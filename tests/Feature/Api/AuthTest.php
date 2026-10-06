<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withHeaders(['Referer' => 'http://localhost:3000']);
    }

    private function payload(array $over = []): array
    {
        return array_merge([
            'name' => 'Ana', 'username' => 'ana', 'email' => 'ana@x.com',
            'birth_date' => '2000-01-01', 'password' => 'password', 'password_confirmation' => 'password',
        ], $over);
    }

    public function test_register_logs_in(): void
    {
        $this->postJson('/api/register', $this->payload())->assertNoContent();
        $this->assertAuthenticated();
    }

    public function test_register_rejects_under_14(): void
    {
        $this->postJson('/api/register', $this->payload(['birth_date' => now()->subYears(10)->toDateString()]))
            ->assertStatus(422)->assertJsonValidationErrors('birth_date');
    }

    public function test_login_and_me(): void
    {
        $user = User::factory()->create();
        $this->postJson('/api/login', ['email' => $user->email, 'password' => 'password'])->assertNoContent();
        $this->getJson('/api/user')->assertOk()->assertJsonPath('email', $user->email);
    }

    public function test_login_wrong_password(): void
    {
        $user = User::factory()->create();
        $this->postJson('/api/login', ['email' => $user->email, 'password' => 'nope'])->assertStatus(422);
    }

    public function test_me_requires_auth(): void
    {
        $this->getJson('/api/user')->assertUnauthorized();
    }

    public function test_logout(): void
    {
        $this->actingAs(User::factory()->create())->postJson('/api/logout')->assertNoContent();
        $this->assertGuest('web');
    }

    public function test_reset_link_points_to_frontend(): void
    {
        Notification::fake();
        $user = User::factory()->create();
        $this->postJson('/api/forgot-password', ['email' => $user->email])->assertOk();
        Notification::assertSentTo($user, ResetPassword::class, function ($n) use ($user) {
            return str_starts_with($n->toMail($user)->actionUrl, config('app.frontend_url').'/reset-password?token=');
        });
    }

    public function test_reserved_username_unavailable(): void
    {
        foreach (['feed', 'settings', 'api', 'login'] as $name) {
            $this->getJson("/api/check-username/$name")->assertJsonPath('available', false);
        }
    }

    public function test_register_rejects_reserved_username(): void
    {
        $this->postJson('/api/register', $this->payload(['username' => 'feed']))
            ->assertStatus(422)->assertJsonValidationErrors('username');
    }
}
