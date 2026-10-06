<?php

namespace Tests\Feature\Api;

use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SecurityTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withHeaders(['Referer' => 'http://localhost:3000']);
    }

    public function test_register_is_rate_limited_per_ip(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/register', ['username' => "x$i"])->assertStatus(422);
        }
        $this->postJson('/api/register', ['username' => 'x9'])->assertStatus(429);
    }

    public function test_posting_is_rate_limited_per_user(): void
    {
        $u = User::factory()->create();
        for ($i = 0; $i < 10; $i++) {
            $this->actingAs($u)->postJson('/api/posts', ['content' => "p$i"])->assertCreated();
        }
        $this->actingAs($u)->postJson('/api/posts', ['content' => 'demais'])->assertStatus(429);
    }

    public function test_html_is_stripped_from_post_content(): void
    {
        $u = User::factory()->create();
        $this->actingAs($u)->postJson('/api/posts', ['content' => '<script>alert(1)</script><b>oi</b>'])->assertCreated();
        $this->assertSame('alert(1)oi', Post::first()->content);
    }

    public function test_html_is_stripped_from_names_but_passwords_are_kept(): void
    {
        $this->postJson('/api/register', [
            'name' => '<i>Ana</i>', 'username' => 'ana_x', 'email' => 'ana@x.com', 'birth_date' => '2000-01-01',
            'password' => '<b>senha123', 'password_confirmation' => '<b>senha123',
        ])->assertNoContent();
        $this->assertSame('Ana', User::where('username', 'ana_x')->value('name'));
        $this->assertTrue(\Hash::check('<b>senha123', User::where('username', 'ana_x')->value('password')));
    }

    public function test_api_sends_security_headers(): void
    {
        $this->getJson('/api/check-username/abc')
            ->assertHeader('X-Content-Type-Options', 'nosniff')
            ->assertHeader('X-Frame-Options', 'DENY')
            ->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    }
}
