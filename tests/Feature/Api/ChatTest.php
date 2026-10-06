<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ChatTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withHeaders(['Referer' => 'http://localhost:3000']);
    }

    /** Mutual accepted follow between two users. */
    private function friends(User $a, User $b): void
    {
        $a->following()->attach($b->id, ['accepted_at' => now()]);
        $b->following()->attach($a->id, ['accepted_at' => now()]);
    }

    public function test_direct_chat_needs_mutual_follow_and_is_reused(): void
    {
        [$a, $b, $c] = User::factory(3)->create();
        $this->friends($a, $b);
        $a->following()->attach($c->id, ['accepted_at' => now()]); // c does not follow back

        $this->actingAs($a)->postJson('/api/conversations', ['user_ids' => [$c->id]])->assertStatus(422);
        $id = $this->actingAs($a)->postJson('/api/conversations', ['user_ids' => [$b->id]])->assertCreated()->json('id');
        $this->actingAs($a)->postJson('/api/conversations', ['user_ids' => [$b->id]])->assertOk()->assertJsonPath('id', $id);
    }

    public function test_send_read_and_poll_messages(): void
    {
        [$a, $b] = User::factory(2)->create();
        $this->friends($a, $b);
        $id = $this->actingAs($a)->postJson('/api/conversations', ['user_ids' => [$b->id]])->json('id');

        $m1 = $this->actingAs($a)->postJson("/api/conversations/$id/messages", ['body' => '<b>oi</b>'])->assertCreated()->assertJsonPath('body', 'oi')->json('id');
        $this->actingAs($b)->getJson('/api/user')->assertJsonPath('unread_messages_count', 1);
        $this->actingAs($b)->getJson('/api/conversations')->assertJsonPath('0.unread_count', 1)->assertJsonPath('0.last_message.body', 'oi');

        $this->actingAs($b)->getJson("/api/conversations/$id/messages")->assertJsonCount(1);
        $this->actingAs($b)->getJson('/api/user')->assertJsonPath('unread_messages_count', 0);

        $this->actingAs($b)->postJson("/api/conversations/$id/messages", ['body' => 'tudo bem?']);
        $this->actingAs($a)->getJson("/api/conversations/$id/messages?after=$m1")->assertJsonCount(1)->assertJsonPath('0.body', 'tudo bem?');
    }

    public function test_outsiders_cannot_read_or_post(): void
    {
        [$a, $b, $x] = User::factory(3)->create();
        $this->friends($a, $b);
        $id = $this->actingAs($a)->postJson('/api/conversations', ['user_ids' => [$b->id]])->json('id');
        $this->actingAs($x)->getJson("/api/conversations/$id/messages")->assertNotFound();
        $this->actingAs($x)->postJson("/api/conversations/$id/messages", ['body' => 'oi'])->assertNotFound();
    }

    public function test_group_create_add_member_and_leave(): void
    {
        [$a, $b, $c, $d] = User::factory(4)->create();
        $this->friends($a, $b);
        $this->friends($a, $c);
        $this->friends($a, $d);

        $this->actingAs($a)->postJson('/api/conversations', ['user_ids' => [$b->id, $c->id]])->assertStatus(422); // groups need a name
        $id = $this->actingAs($a)->postJson('/api/conversations', ['user_ids' => [$b->id, $c->id], 'name' => 'Rolê'])
            ->assertCreated()->assertJsonPath('is_group', true)->assertJsonCount(3, 'members')->json('id');

        $this->actingAs($b)->postJson("/api/conversations/$id/members", ['user_id' => $d->id])->assertStatus(422); // b and d are not friends
        $this->actingAs($a)->postJson("/api/conversations/$id/members", ['user_id' => $d->id])->assertOk()->assertJsonCount(4, 'members');

        $this->actingAs($c)->deleteJson("/api/conversations/$id/members/me")->assertNoContent();
        $this->actingAs($c)->getJson("/api/conversations/$id/messages")->assertNotFound();
    }

    public function test_chat_contacts_are_mutual_follows(): void
    {
        [$a, $b, $c] = User::factory(3)->create();
        $this->friends($a, $b);
        $a->following()->attach($c->id, ['accepted_at' => now()]);
        $this->actingAs($a)->getJson('/api/chat/contacts')->assertJsonCount(1)->assertJsonPath('0.id', $b->id);
    }

    public function test_messages_are_rate_limited(): void
    {
        [$a, $b] = User::factory(2)->create();
        $this->friends($a, $b);
        $id = $this->actingAs($a)->postJson('/api/conversations', ['user_ids' => [$b->id]])->json('id');
        for ($i = 0; $i < 40; $i++) {
            $this->actingAs($a)->postJson("/api/conversations/$id/messages", ['body' => "m$i"]);
        }
        $this->actingAs($a)->postJson("/api/conversations/$id/messages", ['body' => 'demais'])->assertStatus(429);
    }
}
