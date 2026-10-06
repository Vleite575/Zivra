<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FollowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withHeaders(['Referer' => 'http://localhost:3000']);
    }

    public function test_follow_public_is_immediate(): void
    {
        [$a, $b] = User::factory(2)->create();
        $this->actingAs($a)->postJson("/api/follow/{$b->id}")->assertNoContent();
        $this->assertTrue($a->isFollowing($b));
    }

    public function test_private_needs_accept_and_can_be_rejected(): void
    {
        $a = User::factory()->create();
        $b = User::factory()->create(['is_public' => false]);
        $c = User::factory()->create();
        $this->actingAs($a)->postJson("/api/follow/{$b->id}");
        $this->actingAs($c)->postJson("/api/follow/{$b->id}");
        $this->assertFalse($a->isFollowing($b));
        $this->actingAs($b)->getJson('/api/follow-requests')->assertJsonCount(2);
        $this->actingAs($b)->postJson("/api/follow-requests/{$a->id}/accept")->assertNoContent();
        $this->actingAs($b)->deleteJson("/api/follow-requests/{$c->id}/reject")->assertNoContent();
        $this->assertTrue($a->isFollowing($b));
        $this->assertFalse($c->hasRequestedToFollow($b));
    }

    public function test_cannot_follow_self(): void
    {
        $a = User::factory()->create();
        $this->actingAs($a)->postJson("/api/follow/{$a->id}")->assertStatus(422);
    }

    public function test_going_public_accepts_pending_requests(): void
    {
        $a = User::factory()->create();
        $b = User::factory()->create(['is_public' => false]);
        $this->actingAs($a)->postJson("/api/follow/{$b->id}");
        $this->actingAs($b)->patchJson('/api/profile/privacy', ['is_public' => true])->assertOk();
        $this->assertTrue($a->isFollowing($b));
    }

    public function test_follow_lists_hide_pivot_dates(): void
    {
        [$a, $b] = User::factory(2)->create();
        $this->actingAs($a)->postJson("/api/follow/{$b->id}");
        $this->getJson("/api/users/{$b->username}/followers")->assertOk()->assertJsonMissingPath('0.pivot');
    }
}
