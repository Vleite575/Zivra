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
        Storage::fake('local');
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

    public function test_only_author_deletes_post(): void
    {
        Storage::fake('local');
        $a = User::factory()->create();
        $b = User::factory()->create();
        $id = $this->actingAs($a)->post('/api/posts', ['content' => 'x', 'media' => UploadedFile::fake()->image('a.jpg')], ['Accept' => 'application/json'])->json('id');
        $path = Post::find($id)->media_path;
        $this->actingAs($b)->deleteJson("/api/posts/$id")->assertForbidden();
        $this->actingAs($a)->deleteJson("/api/posts/$id")->assertNoContent();
        $this->assertNull(Post::find($id));
        Storage::disk('local')->assertMissing($path);
    }

    public function test_post_media_is_private_and_served_by_permission(): void
    {
        Storage::fake('local');
        Storage::fake('public');
        $owner = User::factory()->create(['is_public' => false]);
        $id = $this->actingAs($owner)->post('/api/posts', ['content' => 'x', 'media' => UploadedFile::fake()->image('a.jpg')], ['Accept' => 'application/json'])->json('id');
        $path = Post::find($id)->media_path;

        Storage::disk('local')->assertExists($path);
        Storage::disk('public')->assertMissing($path);
        $this->actingAs($owner)->get("/api/posts/$id/media")->assertOk()->assertHeader('Cache-Control', 'max-age=3600, private');
        $this->actingAs(User::factory()->create())->get("/api/posts/$id/media")->assertNotFound();
    }

    public function test_guest_can_load_media_of_public_post(): void
    {
        Storage::fake('local');
        $owner = User::factory()->create();
        $id = $this->actingAs($owner)->post('/api/posts', ['content' => 'x', 'media' => UploadedFile::fake()->image('a.jpg')], ['Accept' => 'application/json'])->json('id');
        $this->app['auth']->forgetGuards();
        $this->get("/api/posts/$id/media")->assertOk();
    }

    public function test_comment_like_toggles_and_shows_in_feed(): void
    {
        $me = User::factory()->create();
        $post = $this->postBy(User::factory()->create());
        $comment = $post->comments()->create(['user_id' => $me->id, 'content' => 'legal']);

        $this->actingAs($me)->postJson("/api/comments/{$comment->id}/like")->assertOk()->assertJson(['liked' => true, 'likes_count' => 1]);
        $this->getJson('/api/feed')->assertJsonPath('0.comments.0.likes_count', 1)->assertJsonPath('0.comments.0.is_liked', true);
        $this->postJson("/api/comments/{$comment->id}/like")->assertJson(['liked' => false, 'likes_count' => 0]);
    }

    public function test_comment_like_hidden_on_private_post(): void
    {
        $post = $this->postBy(User::factory()->create(['is_public' => false]));
        $comment = $post->comments()->create(['user_id' => $post->user_id, 'content' => 'x']);

        $this->actingAs(User::factory()->create())->postJson("/api/comments/{$comment->id}/like")->assertNotFound();
    }

    public function test_activity_lists_my_likes_and_comments_on_visible_posts_only(): void
    {
        $me = User::factory()->create();
        $public = $this->postBy(User::factory()->create());
        $hidden = $this->postBy(User::factory()->create(['is_public' => false]));
        foreach ([$public, $hidden] as $p) {
            $p->likes()->create(['user_id' => $me->id]);
            $mine = $p->comments()->create(['user_id' => $me->id, 'content' => 'meu']);
            $other = $p->comments()->create(['user_id' => $p->user_id, 'content' => 'dele']);
            $other->likers()->attach($me->id);
        }

        $this->actingAs($me)->getJson('/api/me/activity')->assertOk()
            ->assertJsonPath('liked_posts_count', 1)->assertJsonPath('liked_posts.0.id', $public->id)
            ->assertJsonPath('comments_count', 1)->assertJsonPath('comments.0.post.id', $public->id)
            ->assertJsonPath('liked_comments_count', 1)->assertJsonPath('liked_comments.0.content', 'dele');
    }

    public function test_activity_sort_oldest_flips_order(): void
    {
        $me = User::factory()->create();
        $old = $this->postBy(User::factory()->create());
        $new = $this->postBy(User::factory()->create());
        $old->likes()->forceCreate(['user_id' => $me->id, 'created_at' => now()->subDay()]);
        $new->likes()->create(['user_id' => $me->id]);

        $this->actingAs($me)->getJson('/api/me/activity')->assertJsonPath('liked_posts.0.id', $new->id);
        $this->getJson('/api/me/activity?sort=oldest')->assertJsonPath('liked_posts.0.id', $old->id);
    }
}
