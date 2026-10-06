<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withHeaders(['Referer' => 'http://localhost:3000']);
    }

    public function test_guest_sees_public_profile(): void
    {
        $u = User::factory()->create();
        $this->getJson("/api/users/{$u->username}")->assertOk()
            ->assertJsonPath('user.username', $u->username)->assertJsonPath('canSeeContent', true)
            ->assertJsonMissingPath('user.email');
    }

    public function test_private_profile_hides_posts_and_followers(): void
    {
        $u = User::factory()->create(['is_public' => false]);
        $this->getJson("/api/users/{$u->username}")->assertJsonPath('canSeeContent', false)->assertJsonPath('posts', []);
        $this->getJson("/api/users/{$u->username}/followers")->assertForbidden();
    }

    public function test_unknown_user_404(): void
    {
        $this->getJson('/api/users/ninguem')->assertNotFound();
    }

    public function test_update_profile_with_photo_via_method_spoof(): void
    {
        Storage::fake('public');
        $u = User::factory()->create();
        $this->actingAs($u)->post('/api/profile', [
            '_method' => 'PATCH', 'name' => 'Novo', 'email' => $u->email, 'bio' => 'oi',
            'profile_photo' => UploadedFile::fake()->image('p.jpg'),
        ], ['Accept' => 'application/json'])->assertOk()->assertJsonPath('name', 'Novo');
        $this->assertNotNull($u->fresh()->profile_photo_path);
    }

    public function test_privacy_toggle(): void
    {
        $u = User::factory()->create();
        $this->actingAs($u)->patchJson('/api/profile/privacy', ['is_public' => false])->assertJsonPath('is_public', false);
    }

    public function test_delete_requires_password(): void
    {
        $u = User::factory()->create();
        $this->actingAs($u)->deleteJson('/api/profile', ['password' => 'errada'])->assertStatus(422);
        $this->actingAs($u)->deleteJson('/api/profile', ['password' => 'password'])->assertNoContent();
        $this->assertNull($u->fresh());
    }

    public function test_search_users_by_nick_or_name(): void
    {
        $me = User::factory()->create();
        User::factory()->create(['username' => 'maria_luz', 'name' => 'Maria Luz']);
        User::factory()->create(['username' => 'joao', 'name' => 'João Mariano']);
        User::factory()->create(['username' => 'pedro', 'name' => 'Pedro']);
        $json = $this->actingAs($me)->getJson('/api/users?q=mari')->assertOk()->json();
        $this->assertEqualsCanonicalizing(['maria_luz', 'joao'], array_column($json, 'username'));
        $this->assertArrayNotHasKey('email', $json[0]);
    }

    public function test_me_includes_pending_request_count(): void
    {
        $a = User::factory()->create();
        $b = User::factory()->create(['is_public' => false]);
        $this->actingAs($a)->postJson("/api/follow/{$b->id}");
        $this->actingAs($b)->getJson('/api/user')->assertJsonPath('pending_requests_count', 1);
    }
}
