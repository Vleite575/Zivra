<?php

namespace Tests\Feature\Api;

use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PostTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withHeaders(['Referer' => 'http://localhost:3000']);
    }

    private function postBy(User $u): Post
    {
        $p = new Post(['content' => 'oi']);
        $p->user_id = $u->id;
        $p->save();

        return $p;
    }

    public function test_feed_hides_private_profiles_not_followed(): void
    {
        $me = User::factory()->create();
        $public = User::factory()->create();
        $private = User::factory()->create(['is_public' => false]);
        $followedPrivate = User::factory()->create(['is_public' => false]);
        $me->following()->attach($followedPrivate->id, ['accepted_at' => now()]);
        foreach ([$me, $public, $private, $followedPrivate] as $u) {
            $this->postBy($u);
        }

        $ids = collect($this->actingAs($me)->getJson('/api/feed')->assertOk()->json())->pluck('user.id');

        $this->assertEqualsCanonicalizing([$me->id, $public->id, $followedPrivate->id], $ids->all());
    }

    public function test_feed_never_exposes_email(): void
    {
        $u = User::factory()->create();
        $this->postBy($u);
        $json = $this->actingAs($u)->getJson('/api/feed')->json();
        $this->assertArrayNotHasKey('email', $json[0]['user']);
    }

    public function test_store_post_with_media(): void
    {
        Storage::fake('public');
        $this->actingAs(User::factory()->create())
            ->post('/api/posts', ['content' => 'foto', 'media' => UploadedFile::fake()->image('a.jpg')], ['Accept' => 'application/json'])
            ->assertCreated()->assertJsonPath('media_type', 'image');
    }

    public function test_like_toggles(): void
    {
        $u = User::factory()->create();
        $p = $this->postBy($u);
        $this->actingAs($u)->postJson("/api/posts/{$p->id}/like")->assertJson(['liked' => true, 'likes_count' => 1]);
        $this->actingAs($u)->postJson("/api/posts/{$p->id}/like")->assertJson(['liked' => false, 'likes_count' => 0]);
    }

    public function test_comment_delete_only_by_author(): void
    {
        $a = User::factory()->create();
        $b = User::factory()->create();
        $p = $this->postBy($a);
        $id = $this->actingAs($a)->postJson("/api/posts/{$p->id}/comments", ['content' => 'x'])
            ->assertCreated()->json('id');
        $this->actingAs($b)->deleteJson("/api/comments/$id")->assertForbidden();
        $this->actingAs($a)->deleteJson("/api/comments/$id")->assertNoContent();
    }

    public function test_cannot_like_or_comment_private_post_not_followed(): void
    {
        $private = User::factory()->create(['is_public' => false]);
        $p = $this->postBy($private);
        $stranger = User::factory()->create();
        $this->actingAs($stranger)->postJson("/api/posts/{$p->id}/like")->assertNotFound();
        $this->actingAs($stranger)->postJson("/api/posts/{$p->id}/comments", ['content' => 'x'])->assertNotFound();
        $this->actingAs($private)->postJson("/api/posts/{$p->id}/like")->assertOk();
    }
}
