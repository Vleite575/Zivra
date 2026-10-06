# Zivra: frontend Next.js + API Laravel — Plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar o Laravel em API JSON pura e reconstruir todas as telas em Next.js (pasta `web/`), já com o redesign.

**Architecture:** O Laravel deixa de renderizar telas: Inertia, Vite, Ziggy e `resources/js` saem. As rotas ficam em `routes/api.php` e a autenticação é por sessão/cookie do Sanctum (modo SPA). O Next roda em `localhost:3000` e usa `rewrites` para encaminhar `/api/*`, `/sanctum/*` e `/storage/*` ao Laravel. Assim o navegador vê uma única origem: não precisa de CORS nem de token no `localStorage`.

**Tech Stack:** Laravel 12, Sanctum 4, PHPUnit (sqlite em memória), Next.js (App Router, versão `@latest`), TypeScript e Tailwind v4.

**Spec:** conversa de 2026-10-06 (sessão `303bffc5`): "quero projeto em Next, mas API em Laravel". Redesign pedido nesta sessão: todas as telas com `/impeccable` e `/frontend-design`; a landing também com `/landing-page-design`.

## Global Constraints

- Em desenvolvimento, o Laravel roda com `php artisan serve --port=8000`. O XAMPP usa HTTPS com certificado autoassinado, e o Node recusa esse certificado.
- O Next fica em `zivra/web/`. O `.htaccess` da raiz já bloqueia arquivos fora de `public/`, então `web/` não fica exposto pelo Apache.
- Nenhuma dependência nova no frontend além do que o `create-next-app` instala. Nada de axios, SWR ou biblioteca de UI.
- A API nunca retorna `email` nem `birth_date` de outros usuários. Só `/api/user` mostra o e-mail, e só do próprio usuário.
- Textos da interface em português do Brasil.
- Toda tela nova passa por: skill `impeccable` + skill `frontend-design`. A landing também passa pela skill `landing-page-design`.
- O fluxo de follow com aprovação (perfil privado) tem o mesmo comportamento do app atual.

## Review Focus

1. **Vazamento de posts privados no feed:** hoje `PostController@index` retorna posts de TODOS os usuários, inclusive de perfis privados. Esperado: o feed mostra só posts de perfis públicos, de quem eu sigo (com follow aceito) e os meus. Teste: Task 2.
2. **Vazamento de e-mail:** `with('user')` e as listas de seguidores serializam o `User` inteiro, com `email` e `birth_date`. Esperado: esses campos ficam ocultos. Teste: Task 2.
3. **Sessão expirada:** o fetch recebe 401 ou 419. Esperado: redirecionar para `/login?redirect=<rota atual>`, sem tela branca. Coberto pelo guard da Task 6.
4. **Upload de foto com PATCH multipart:** o PHP não lê corpo multipart em `PATCH`. Esperado: o frontend envia `POST` com `_method=PATCH`. Teste: Task 3.
5. **Username que colide com rota do Next** (`feed`, `settings`...): esperado "indisponível" no cadastro. Teste: Task 1.

---

## Mapa de arquivos

**Laravel (modificar/criar):**
- `routes/api.php` (criar): todas as rotas.
- `routes/web.php`: só redireciona `/` para o Next. `routes/auth.php` é apagado.
- `bootstrap/app.php`: registra `api:` e `statefulApi()`; remove o Inertia.
- `app/Http/Controllers/*.php` e `Auth/*.php`: passam a retornar JSON.
- `app/Models/User.php`: `$hidden` e cast de `is_public`.
- `app/Providers/AppServiceProvider.php`: link de reset de senha aponta para o Next.
- `database/factories/UserFactory.php`: adiciona `username`.
- `tests/Feature/Api/{AuthTest,PostTest,ProfileTest,FollowTest}.php` (criar). Os testes antigos do Breeze são apagados.

**Next (`web/`):**
- `next.config.ts`: rewrites.
- `lib/api.ts`: tipos, `api()`, `useApi()` e `MeProvider`/`useMe()`.
- `app/layout.tsx`, `app/globals.css`: tokens do design system.
- `app/page.tsx`: landing.
- `app/(auth)/{login,register,forgot-password}/page.tsx`, `app/(auth)/reset-password/[token]/page.tsx`.
- `app/(app)/layout.tsx`: guard + navegação; `app/(app)/{feed,follow-requests,settings}/page.tsx`.
- `app/[username]/page.tsx`: perfil público.
- `app/{privacy,security}/page.tsx`: páginas estáticas.
- `components/PostCard.tsx`: post com curtida e comentários, usado no feed e no perfil.

**Cortes deliberados (ponytail ultra). Confirmar com o usuário antes de executar:**
- `/messages` (chat): sai. Hoje não tem backend; é só uma tela falsa. Volta quando houver backend de mensagens.
- Verificação de e-mail e confirmação de senha: saem. `User` não implementa `MustVerifyEmail`, então esse código nunca roda.
- `Profile/Edit` + `Profile/Configurations`: viram uma tela só, `/settings`.
- Sem SSR nas telas logadas: são client components. Se SEO do perfil público importar, converter `[username]` para server component depois.
- Feed limitado a 50 posts, sem paginação. Adicionar `cursorPaginate` quando passar disso.

---

### Task 1: Base da API (Sanctum SPA, rotas de auth em JSON)

**Files:**
- Modify: `bootstrap/app.php`, `routes/web.php`, `app/Models/User.php`, `app/Providers/AppServiceProvider.php`, `database/factories/UserFactory.php`, `.env`, `.env.example`
- Modify: `app/Http/Controllers/Auth/{RegisteredUser,AuthenticatedSession,PasswordResetLink,NewPassword,Password}Controller.php`
- Delete: `routes/auth.php`, `app/Http/Controllers/Auth/{ConfirmablePassword,EmailVerificationNotification,EmailVerificationPrompt,VerifyEmail}Controller.php`, `tests/Feature/Auth/*`
- Create: `routes/api.php`, `tests/Feature/Api/AuthTest.php`

**Interfaces:**
- Produces: `GET /api/user` (200 com o usuário + email, ou 401), `POST /api/register|login|logout|forgot-password|reset-password` (204 ou 422 `{message, errors}`), `PUT /api/password` (204), `GET /api/check-username/{username}` (`{available, exists, reserved}`).

- [ ] **Step 1: Instalar o scaffold da API**

Run: `php artisan install:api --no-interaction`
Esperado: cria `routes/api.php` e a migration `personal_access_tokens`, e adiciona `api:` em `bootstrap/app.php`. Depois rode `php artisan migrate`.

- [ ] **Step 2: Escrever o teste que falha**

`tests/Feature/Api/AuthTest.php`:
```php
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
            return str_starts_with($n->toMail($user)->actionUrl, config('app.frontend_url').'/reset-password/');
        });
    }

    public function test_reserved_username_unavailable(): void
    {
        foreach (['feed', 'settings', 'api', 'login'] as $name) {
            $this->getJson("/api/check-username/$name")->assertJsonPath('available', false);
        }
    }
}
```

- [ ] **Step 3: Rodar e ver falhar**

Run: `php artisan test tests/Feature/Api/AuthTest.php`
Esperado: FAIL (rotas inexistentes, 404).

- [ ] **Step 4: Implementar**

`bootstrap/app.php`, bloco de middleware (remove Inertia e AddLinkHeaders):
```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->statefulApi();
})
```

`routes/web.php` (arquivo inteiro):
```php
<?php

use Illuminate\Support\Facades\Route;

Route::redirect('/', config('app.frontend_url'));
```

`config/app.php`, adicionar a chave:
```php
'frontend_url' => env('FRONTEND_URL', 'http://localhost:3000'),
```
`.env` e `.env.example`: `FRONTEND_URL=http://localhost:3000`.

`routes/api.php` (parte de auth; as Tasks 2 e 3 acrescentam o resto):
```php
<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {
    Route::post('register', [RegisteredUserController::class, 'store']);
    Route::post('login', [AuthenticatedSessionController::class, 'store']);
    Route::post('forgot-password', [PasswordResetLinkController::class, 'store']);
    Route::post('reset-password', [NewPasswordController::class, 'store']);
});

Route::get('check-username/{username}', function (string $username) {
    $exists = User::where('username', $username)->exists();
    $reserved = in_array(strtolower($username), [
        'api', 'storage', 'sanctum', 'login', 'register', 'forgot-password', 'reset-password',
        'feed', 'settings', 'follow-requests', 'privacy', 'security', 'messages', 'p',
    ]);

    return ['available' => ! $exists && ! $reserved, 'exists' => $exists, 'reserved' => $reserved];
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('user', fn (Request $r) => $r->user()->makeVisible('email'));
    Route::post('logout', [AuthenticatedSessionController::class, 'destroy']);
    Route::put('password', [PasswordController::class, 'update']);
});
```

`app/Models/User.php`: `$hidden` e casts:
```php
protected $hidden = ['password', 'remember_token', 'email', 'birth_date', 'email_verified_at'];
// em casts():
'is_public' => 'boolean',
```

`AppServiceProvider::boot()`: troca o `Vite::prefetch` por:
```php
ResetPassword::createUrlUsing(fn ($user, string $token) =>
    config('app.frontend_url')."/reset-password/$token?email=".urlencode($user->email));
```
(import `Illuminate\Auth\Notifications\ResetPassword`; remover o import de `Vite`).

`UserFactory::definition()`: acrescentar `'username' => fake()->unique()->userName(),` e `'birth_date' => '2000-01-01',`.

Controllers de auth:
- Apagar todos os métodos `create()` e os imports de `Inertia`.
- `RegisteredUserController::store`: trocar o `return redirect()->intended(...)` por `return response()->noContent();`. O tipo de retorno passa a ser `Response` (`Illuminate\Http\Response`).
- `AuthenticatedSessionController::store`: idem. `destroy`: `return response()->noContent();`.
- `PasswordResetLinkController::store`: `return response()->json(['status' => __($status)]);`.
- `NewPasswordController::store`: `return response()->json(['status' => __($status)]);`.
- `PasswordController::update`: `return response()->noContent();`.
- Remover os tipos `RedirectResponse` desses métodos.

Apagar `routes/auth.php`, os 4 controllers de verificação/confirmação e `tests/Feature/Auth/`.

- [ ] **Step 5: Rodar e ver passar**

Run: `php artisan test tests/Feature/Api/AuthTest.php`
Esperado: 8 passed.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat(api): Sanctum SPA auth endpoints as JSON"
```

---

### Task 2: API de posts, curtidas e comentários (com o fix de privacidade)

**Files:**
- Modify: `app/Http/Controllers/{Post,Like,Comment}Controller.php`, `app/Models/Post.php`, `routes/api.php`
- Create: `tests/Feature/Api/PostTest.php`

**Interfaces:**
- Produces:
  - `GET /api/feed` retorna `Post[]`. Cada `Post` tem: `{id, content, media_path, media_type, created_at, user:{id,name,username,profile_photo_path}, likes_count, comments_count, is_liked, comments:[{id, content, user_id, created_at, user}]}`.
  - `POST /api/posts` (multipart `content`, `media?`) retorna 201 com o `Post`.
  - `POST /api/posts/{post}/like` retorna `{liked, likes_count}`.
  - `POST /api/posts/{post}/comments` retorna 201 com o comentário, incluindo `user`.
  - `DELETE /api/comments/{comment}` retorna 204, ou 403 se o comentário não for seu.

- [ ] **Step 1: Escrever o teste que falha**

`tests/Feature/Api/PostTest.php`:
```php
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
}
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `php artisan test tests/Feature/Api/PostTest.php`
Esperado: FAIL (404).

- [ ] **Step 3: Implementar**

`app/Models/Post.php`: trocar `isLikedBy` por um escopo reutilizado pelo feed e pelo perfil. Ele substitui o N+1 de hoje (um `exists()` por post) e não carrega mais a lista inteira de `likes`:
```php
public function scopeForViewer($query, ?User $viewer)
{
    return $query->with(['user', 'comments.user'])
        ->withCount(['likes', 'comments'])
        ->withExists(['likes as is_liked' => fn ($q) => $q->where('user_id', $viewer?->id)])
        ->latest();
}
```

`PostController` (arquivo inteiro):
```php
<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;

class PostController extends Controller
{
    public function index(Request $request)
    {
        $me = $request->user();
        $visible = $me->following()->pluck('users.id')->push($me->id);

        // ponytail: sem paginação, trocar por cursorPaginate quando o feed passar de 50
        return Post::forViewer($me)
            ->where(fn ($q) => $q->whereIn('user_id', $visible)
                ->orWhereHas('user', fn ($u) => $u->where('is_public', true)))
            ->limit(50)
            ->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'content' => 'required|string|max:280',
            'media' => 'nullable|file|mimes:jpg,jpeg,png,mp4,mov,avi|max:20480',
        ]);

        $post = new Post(['content' => $request->content]);
        $post->user_id = $request->user()->id;

        if ($file = $request->file('media')) {
            $post->media_path = $file->store('posts-media', 'public');
            $post->media_type = in_array(strtolower($file->getClientOriginalExtension()), ['mp4', 'mov', 'avi']) ? 'video' : 'image';
        }

        $post->save();

        return response()->json(Post::forViewer($request->user())->find($post->id), 201);
    }
}
```

`LikeController::toggle`:
```php
public function toggle(Request $request, Post $post)
{
    $deleted = $post->likes()->where('user_id', $request->user()->id)->delete();
    if (! $deleted) {
        $post->likes()->create(['user_id' => $request->user()->id]);
    }

    return ['liked' => ! $deleted, 'likes_count' => $post->likes()->count()];
}
```

`CommentController`: `store` retorna `response()->json($comment->load('user'), 201)`, onde `$comment` é o resultado de `create(...)`. `destroy` retorna `response()->noContent()`. Os imports de `Auth` continuam.

`routes/api.php`, dentro do grupo `auth:sanctum`:
```php
Route::get('feed', [PostController::class, 'index']);
Route::post('posts', [PostController::class, 'store']);
Route::post('posts/{post}/like', [LikeController::class, 'toggle']);
Route::post('posts/{post}/comments', [CommentController::class, 'store']);
Route::delete('comments/{comment}', [CommentController::class, 'destroy']);
```

- [ ] **Step 4: Rodar e ver passar**

Run: `php artisan test tests/Feature/Api/PostTest.php`
Esperado: 5 passed.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(api): feed, posts, likes, comments as JSON; hide private posts and emails"
```

---

### Task 3: API de perfil e follow

**Files:**
- Modify: `app/Http/Controllers/{Profile,Follow}Controller.php`, `routes/api.php`
- Delete: `tests/Feature/ProfileTest.php`
- Create: `tests/Feature/Api/ProfileTest.php`, `tests/Feature/Api/FollowTest.php`

**Interfaces:**
- Consumes: `Post::forViewer()` (Task 2).
- Produces:
  - `GET /api/users/{username}` retorna `{user:{id,name,username,bio,profile_photo_path,is_public,followers_count,following_count,posts_count}, posts: Post[], isOwnProfile, isFollowing, hasRequestedToFollow, hasPendingRequestFrom, canSeeContent}`. É público: aceita visitante deslogado.
  - `GET /api/users/{username}/followers?sort=newest|oldest` e `/following` retornam `User[]`, ou 403 se o perfil for privado.
  - `POST /api/profile` com `_method=PATCH` (multipart `name,email,bio,profile_photo?`) retorna o usuário com email.
  - `PATCH /api/profile/privacy {is_public}` retorna o usuário.
  - `DELETE /api/profile {password}` retorna 204.
  - `GET /api/follow-requests` retorna `User[]`.
  - `POST|DELETE /api/follow/{user}`, `POST /api/follow-requests/{user}/accept`, `DELETE /api/follow-requests/{user}/reject` retornam 204. Seguir a si mesmo retorna 422.

- [ ] **Step 1: Escrever os testes que falham**

`tests/Feature/Api/ProfileTest.php`:
```php
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
}
```

`tests/Feature/Api/FollowTest.php`:
```php
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
}
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `php artisan test tests/Feature/Api/ProfileTest.php tests/Feature/Api/FollowTest.php`
Esperado: FAIL (404).

- [ ] **Step 3: Implementar**

`ProfileController`:
- `show($username, Request $request)`: mantém a lógica atual, com estas mudanças:
  - Usa `$me = $request->user('sanctum')`, porque a rota é pública.
  - `$posts = $canSeeContent ? $user->posts()->forViewer($me)->get() : [];`
  - Retorna o array atual (sem `initialPost`) em vez de `Inertia::render`.
  - Remove o parâmetro `$postId`. O Next resolve o post aberto pelo `?p=`.
- `getFollowers` e `getFollowing`: trocar `Auth::check()/Auth::user()` por `$me = $request->user('sanctum')`. O restante continua igual; o `$hidden` do User já tira o email.
- Apagar `edit()` e `configurations()`.
- `followRequests`: `return $request->user()->pendingFollowers()->get();`
- `updatePrivacy`: `return $user;` no lugar do `back()`.
- `update`: `return $user->makeVisible('email');` no lugar do `back()`.
- `destroy`: `return response()->noContent();` no lugar do `Redirect::to('/')`.
- Remover os imports de `Inertia`, `Response`, `Redirect` e `RedirectResponse`.

`FollowController`:
- `store`: se for a si mesmo, `abort(422, 'Você não pode seguir a si mesmo.');`.
- Todos os `return back();` viram `return response()->noContent();`.

`routes/api.php`. Fora do grupo auth (rota pública):
```php
Route::get('users/{username}', [ProfileController::class, 'show']);
Route::get('users/{username}/followers', [ProfileController::class, 'getFollowers']);
Route::get('users/{username}/following', [ProfileController::class, 'getFollowing']);
```
Dentro do grupo `auth:sanctum`:
```php
Route::patch('profile', [ProfileController::class, 'update']);
Route::delete('profile', [ProfileController::class, 'destroy']);
Route::patch('profile/privacy', [ProfileController::class, 'updatePrivacy']);
Route::get('follow-requests', [ProfileController::class, 'followRequests']);
Route::post('follow/{user}', [FollowController::class, 'store']);
Route::delete('follow/{user}', [FollowController::class, 'destroy']);
Route::post('follow-requests/{user}/accept', [FollowController::class, 'accept']);
Route::delete('follow-requests/{user}/reject', [FollowController::class, 'reject']);
```

- [ ] **Step 4: Rodar a suíte inteira**

Run: `php artisan test`
Esperado: tudo passa (Auth, Post, Profile, Follow + os ExampleTest). Se `tests/Feature/ExampleTest` falhar porque `/` agora é um redirect, troque a asserção para `assertRedirect()`.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(api): profile and follow endpoints as JSON"
```

---

### Task 4: Remover o frontend Inertia do Laravel

**Files:**
- Delete: `resources/js/`, `resources/css/`, `resources/views/app.blade.php`, `app/Http/Middleware/HandleInertiaRequests.php`, `vite.config.js`, `package.json`, `package-lock.json`, `tailwind.config.js`, `postcss.config.js`, `jsconfig.json`, `public/build/`, `node_modules/`
- Modify: `composer.json` (remover `inertiajs/inertia-laravel`, `tightenco/ziggy`, `laravel/breeze`), `.env` e `.env.example` (remover `ASSET_URL` e `VITE_*`)

- [ ] **Step 1: Confirmar que nada do PHP depende do Inertia**

Run: `grep -rn "Inertia\|Vite::\|ziggy" app routes bootstrap config`
Esperado: nenhuma linha.

- [ ] **Step 2: Remover**

```bash
composer remove inertiajs/inertia-laravel tightenco/ziggy && composer remove --dev laravel/breeze
rm -rf resources/js resources/css resources/views/app.blade.php app/Http/Middleware/HandleInertiaRequests.php vite.config.js package.json package-lock.json tailwind.config.js postcss.config.js jsconfig.json public/build node_modules
```
Reverter a mudança do `url` do disco `public` em `config/filesystems.php` para o padrão `env('APP_URL').'/storage'`. O `ASSET_URL` não é mais necessário.

- [ ] **Step 3: Verificar**

Run: `php artisan test && php artisan route:list --path=api`
Esperado: testes passam e todas as rotas aparecem sob `api/`.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "chore: drop Inertia/Vite frontend from Laravel"
```

---

### Task 5: Projeto Next + camada de API

**Files:**
- Create: `web/` (via create-next-app), `web/next.config.ts`, `web/lib/api.ts`, `web/.env.local`

**Interfaces:**
- Produces (`web/lib/api.ts`):
  - Tipos `User`, `Comment`, `Post`, `Profile`.
  - `class ApiError { status: number; errors: Record<string, string[]> }`.
  - `api<T>(path, init?)`: Promise<T>.
  - `useApi<T>(path | null)`: `{ data, error, setData, reload }`.
  - `MeProvider`, `useMe()`: `{ me: User | null | undefined, setMe }`. `undefined` = carregando, `null` = deslogado.
  - `media(path)`: string (`/storage/${path}`).

- [ ] **Step 1: Criar o projeto**

```bash
npx create-next-app@latest web --ts --tailwind --eslint --app --no-src-dir --import-alias "@/*" --use-npm --yes
```

- [ ] **Step 2: Rewrites**

`web/next.config.ts`:
```ts
import type { NextConfig } from 'next'

const API = process.env.API_ORIGIN ?? 'http://127.0.0.1:8000'

const nextConfig: NextConfig = {
  async rewrites() {
    return ['api', 'sanctum', 'storage'].map((p) => ({ source: `/${p}/:path*`, destination: `${API}/${p}/:path*` }))
  },
}

export default nextConfig
```
`web/.env.local`: `API_ORIGIN=http://127.0.0.1:8000`.

- [ ] **Step 3: `web/lib/api.ts`**

```tsx
'use client'
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

export type User = { id: number; name: string; username: string; bio: string | null; profile_photo_path: string | null; is_public: boolean; email?: string }
export type Comment = { id: number; content: string; user_id: number; created_at: string; user: User }
export type Post = { id: number; content: string; media_path: string | null; media_type: 'image' | 'video' | null; created_at: string; user: User; likes_count: number; comments_count: number; is_liked: boolean; comments: Comment[] }
export type Profile = {
  user: User & { followers_count: number; following_count: number; posts_count: number }
  posts: Post[]; isOwnProfile: boolean; isFollowing: boolean; hasRequestedToFollow: boolean; hasPendingRequestFrom: boolean; canSeeContent: boolean
}

export class ApiError extends Error {
  constructor(public status: number, public errors: Record<string, string[]> = {}, message = '') { super(message) }
}

const xsrf = () => decodeURIComponent(document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]+)/)?.[1] ?? '')

export async function api<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const method = (init.method ?? 'GET').toUpperCase()
  if (method !== 'GET' && !xsrf()) await fetch('/sanctum/csrf-cookie')
  const json = init.body && !(init.body instanceof FormData)
  const res = await fetch(path, {
    ...init,
    headers: { Accept: 'application/json', 'X-XSRF-TOKEN': xsrf(), ...(json ? { 'Content-Type': 'application/json' } : {}), ...init.headers },
  })
  if (res.status === 204) return undefined as T
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new ApiError(res.status, data.errors, data.message)
  return data
}

export function useApi<T>(path: string | null) {
  const [data, setData] = useState<T>()
  const [error, setError] = useState<ApiError>()
  const reload = useCallback(() => { if (path) api<T>(path).then(setData, setError) }, [path])
  useEffect(reload, [reload])
  return { data, error, setData, reload }
}

export const media = (path: string) => `/storage/${path}`

const MeContext = createContext<{ me: User | null | undefined; setMe: (u: User | null) => void }>({ me: undefined, setMe: () => {} })

export function MeProvider({ children }: { children: ReactNode }) {
  const [me, setMe] = useState<User | null>()
  useEffect(() => { api<User>('/api/user').then(setMe, () => setMe(null)) }, [])
  return <MeContext.Provider value={{ me, setMe }}>{children}</MeContext.Provider>
}

export const useMe = () => useContext(MeContext)
```
Renomeie para `web/lib/api.tsx`, porque o arquivo tem JSX. Use esse nome nos imports (`@/lib/api`).

- [ ] **Step 4: Smoke test**

Run em 2 terminais: `php artisan serve --port=8000` e `cd web && npm run dev`.
Abra `http://localhost:3000/api/check-username/feed` no navegador interno.
Esperado: `{"available":false,...}`. Isso prova que o proxy funciona.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(web): Next app with API proxy and fetch helper"
```

---

### Task 6: Design system + shell (layout raiz, guard, navegação)

**Files:**
- Modify: `web/app/layout.tsx`, `web/app/globals.css`
- Create: `web/app/(app)/layout.tsx`, `web/DESIGN.md`

**Interfaces:**
- Consumes: `MeProvider`, `useMe`, `api` (Task 5).
- Produces: tokens de cor, tipo e espaço em `globals.css` (`@theme`), que todas as telas seguintes usam. Também o layout `(app)`, que garante `me` não nulo para as páginas filhas.

- [ ] **Step 1: Direção visual.** Invoque a skill `impeccable` (modo shape/design-system) e depois a skill `frontend-design`. Briefing: "Zivra, rede social de fotos e vídeos curtos, público BR, 14+; telas: landing, auth, feed, perfil, pedidos de follow, settings". Saídas: os tokens em `web/app/globals.css` (bloco `@theme` do Tailwind v4, com tema claro e escuro) e as fontes via `next/font` em `layout.tsx`. Ao final, registre a direção em `web/DESIGN.md` (agente `impeccable-documenter`).

- [ ] **Step 1b: Logo e ícones (pedido do usuário em 2026-10-06).** Invoque a skill `logo-design-guide` junto com `impeccable`. Refaça a logo da Zivra como SVG vetorial em `web/components/Logo.tsx`, com marca + wordmark e variantes clara/escura via `currentColor`. Gere os ícones do app a partir da marca: `web/app/icon.svg` (favicon), `web/app/apple-icon.png` (180×180) e `web/app/opengraph-image.png`. Os ícones de interface (curtir, comentar, nav etc.) ficam como SVG inline em `web/components/icons.tsx`, todos no mesmo grid e no mesmo traço. Sem biblioteca de ícones.

- [ ] **Step 2: Layout raiz.** O `web/app/layout.tsx` envolve `children` com `<MeProvider>`, usa `lang="pt-BR"` e define `metadata.title = 'Zivra'`.

- [ ] **Step 3: Guard + navegação.** `web/app/(app)/layout.tsx`. O visual vem das skills; a lógica obrigatória é esta:
```tsx
'use client'
import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { api, useMe } from '@/lib/api'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { me, setMe } = useMe()
  const router = useRouter()
  const path = usePathname()
  useEffect(() => { if (me === null) router.replace(`/login?redirect=${encodeURIComponent(path)}`) }, [me, path, router])
  if (!me) return null
  const logout = async () => { await api('/api/logout', { method: 'POST' }); setMe(null) }
  // nav: Feed (/feed), Perfil (/{me.username}), Pedidos (/follow-requests), Configurações (/settings), Sair (logout)
  return <>{/* nav */}{children}</>
}
```

- [ ] **Step 4: Verificar.** Com os 2 servidores no ar, abra `http://localhost:3000/feed` deslogado no navegador interno. Esperado: redireciona para `/login?redirect=%2Ffeed`. Rode `cd web && npm run build && npm run lint`: sem erros.

- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat(web): design tokens, app shell and auth guard"`

---

### Task 7: Landing (`/`)

**Files:** Create/Modify: `web/app/page.tsx`

- [ ] **Step 1:** Invoque as skills `landing-page-design`, `impeccable` e `frontend-design`. O conteúdo-base é o `Welcome.jsx` atual (está no git em `3b05af0:resources/js/Pages/Welcome.jsx`; ler com `git show`). Requisitos:
  - Hero com CTA "Criar conta" (`/register`) e "Entrar" (`/login`).
  - Se `useMe().me` existir, o CTA vira "Ir para o feed".
  - Rodapé com links para `/privacy` e `/security`.
  - Mobile-first.
- [ ] **Step 2: Verificar.** Abra `/` no navegador interno, em desktop e no preset `mobile`, e tire screenshots. Depois rode `npm run build`.
- [ ] **Step 3: Commit** — `git commit -am "feat(web): landing page"`

---

### Task 8: Telas de auth

**Files:** Create: `web/app/(auth)/login/page.tsx`, `register/page.tsx`, `forgot-password/page.tsx`, `reset-password/[token]/page.tsx`

**Interfaces:** Consomem `api`, `ApiError`, `useMe` e os endpoints da Task 1.

- [ ] **Step 1:** Invoque `impeccable` + `frontend-design`. A referência de campos e textos é o git `3b05af0:resources/js/Pages/Auth/*.jsx`. Padrão de submit (o mesmo nas 4 telas):
```tsx
const [errors, setErrors] = useState<Record<string, string[]>>({})
async function submit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault()
  try {
    await api('/api/login', { method: 'POST', body: JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))) })
    setMe(await api<User>('/api/user'))
    router.replace(params.get('redirect') ?? '/feed')
  } catch (err) { if (err instanceof ApiError) setErrors(err.errors) }
}
```
Regras por tela:
- **Register:**
  - Campos: `name`, `username`, `email`, `birth_date` (`<input type="date">`), `password`, `password_confirmation`.
  - Checa o username com debounce de 400ms em `/api/check-username/{u}` e mostra disponível/indisponível.
- **Forgot:** mostra `status` da resposta.
- **Reset:** pega `token` de `useParams()` e `email` de `?email=`. Em caso de sucesso, vai para `/login`.
- Erros 422 aparecem sob cada campo.
- Usar `autocomplete` correto (`current-password`, `new-password`, `username`).

- [ ] **Step 2: Verificar** no navegador interno:
  - Criar conta de teste (dados ficam em `database/seeders`, não no chat).
  - Logout, login com senha errada (erro 422 visível), login certo (cai em `/feed`).
  - Rodar `npm run build`.
- [ ] **Step 3: Commit** — `git commit -am "feat(web): auth screens"`

---

### Task 9: Feed + PostCard

**Files:** Create: `web/components/PostCard.tsx`, `web/app/(app)/feed/page.tsx`

**Interfaces:**
- Produces: `<PostCard post={Post} onChange={(p: Post) => void} />`. O componente faz curtida e comentários e chama `onChange` com o post atualizado.

- [ ] **Step 1:** Invoque `impeccable` + `frontend-design`. Lógica obrigatória:
  - **Curtir:** UI otimista. Chama `api<{liked:boolean; likes_count:number}>(\`/api/posts/${id}/like\`, {method:'POST'})` e aplica o retorno.
  - **Comentar:** `POST /api/posts/{id}/comments` com `{content}` e anexa o comentário a `post.comments`. Botão excluir só quando `comment.user_id === me.id`; chama `DELETE /api/comments/{id}`.
  - **Mídia:** `media(post.media_path)` em `<img>` ou `<video controls>`, conforme `media_type`.
  - **Composer no feed:** `FormData` com `content` (máx. 280, com contador) e `media` (`accept="image/jpeg,image/png,video/mp4,video/quicktime,video/x-msvideo"`). Envia `POST /api/posts` e põe o post retornado no topo da lista.
  - **Lista:** `useApi<Post[]>('/api/feed')`. Estado vazio com convite a seguir pessoas.
- [ ] **Step 2: Verificar** no navegador:
  - Postar texto e postar imagem.
  - Curtir/descurtir e checar o contador.
  - Comentar e excluir o comentário.
  - Ver no console de rede que nenhuma resposta tem `email` de outro usuário.
  - Rodar `npm run build`.
- [ ] **Step 3: Commit** — `git commit -am "feat(web): feed and PostCard"`

---

### Task 10: Perfil público (`/[username]`)

**Files:** Create: `web/app/[username]/page.tsx`

**Interfaces:** Consome `PostCard`, `Profile`, `useMe` e os endpoints da Task 3.

- [ ] **Step 1:** Invoque `impeccable` + `frontend-design`. A referência de comportamento é o git `3b05af0:resources/js/Pages/Profile/Show.jsx`. Lógica obrigatória:
  - **Dados:** `useApi<Profile>(\`/api/users/${username}\`)`. Em 404, mostra "Usuário não encontrado".
  - **Cabeçalho:** foto, nome, @username, bio e contadores (posts/seguidores/seguindo).
  - **Botão de ação** conforme o estado:
    - dono: "Editar perfil" (`/settings`)
    - `isFollowing`: "Seguindo" (DELETE follow)
    - `hasRequestedToFollow`: "Solicitado" (DELETE follow)
    - padrão: "Seguir" (POST follow)
    - deslogado: link `/login?redirect=/{username}`
    - Depois de cada ação, `reload()`.
  - `hasPendingRequestFrom`: faixa "X quer te seguir" com aceitar/recusar.
  - `!canSeeContent`: estado "Este perfil é privado".
  - **Grade de posts:** ao clicar, abre `<dialog>` nativo com `<PostCard>` e grava `?p={id}` com `router.replace`. Ao abrir a página com `?p=`, o dialog já abre. Fechar o dialog remove o parâmetro.
  - **Modais de seguidores/seguindo** (`<dialog>`): lista de `/api/users/{u}/followers?sort=`. O seletor de ordenação (mais novos/mais antigos) aparece só quando `isOwnProfile`.
- [ ] **Step 2: Verificar** no navegador, com 2 contas de teste (uma privada):
  - Pedido de follow, aceite pelo outro lado e conteúdo liberado.
  - Link direto `/{u}?p={id}` abre o post.
  - Visitante deslogado vê o perfil público.
  - Rodar `npm run build`.
- [ ] **Step 3: Commit** — `git commit -am "feat(web): public profile"`

---

### Task 11: Pedidos de follow + Configurações

**Files:** Create: `web/app/(app)/follow-requests/page.tsx`, `web/app/(app)/settings/page.tsx`

- [ ] **Step 1:** Invoque `impeccable` + `frontend-design`.
  - **`/follow-requests`:**
    - Lista de `useApi<User[]>('/api/follow-requests')`.
    - Aceitar (`POST /api/follow-requests/{id}/accept`) e recusar (`DELETE .../reject`) removem o item da lista.
    - Estado vazio.
  - **`/settings`:** uma tela com 4 seções (a referência são os Partials antigos no git).
    1. **Perfil:** `FormData` com `_method=PATCH`, `name`, `email`, `bio` (máx. 160) e `profile_photo` (preview via `URL.createObjectURL`). Envia `POST /api/profile` e faz `setMe(resposta)`.
    2. **Privacidade:** toggle `is_public`. Envia `PATCH /api/profile/privacy`.
    3. **Senha:** `PUT /api/password` com `current_password`, `password` e `password_confirmation`.
    4. **Excluir conta:** `<dialog>` de confirmação com senha. Envia `DELETE /api/profile`, faz `setMe(null)` e vai para `/`.
- [ ] **Step 2: Verificar** no navegador:
  - Trocar a foto e conferir que ela aparece na nav.
  - Alternar a privacidade.
  - Trocar a senha.
  - Excluir uma conta de teste.
  - Rodar `npm run build`.
- [ ] **Step 3: Commit** — `git commit -am "feat(web): follow requests and settings"`

---

### Task 12: Páginas estáticas + revisão final

**Files:** Create: `web/app/privacy/page.tsx`, `web/app/security/page.tsx`

- [ ] **Step 1:** Porte o texto de `3b05af0:resources/js/Pages/{Privacy,Security}.jsx` como server components estáticos, no estilo do design system.
- [ ] **Step 2:** Invoque o agente `impeccable-finish-reviewer` sobre `web/` e aplique as correções materiais. Depois, `impeccable-documenter` atualiza o `web/DESIGN.md`.
- [ ] **Step 3: Verificar tudo:** rode `php artisan test` e `cd web && npm run build && npm run lint`. Depois faça o fluxo completo no navegador interno em `mobile` e desktop: landing, cadastro, post, perfil, follow e settings.
- [ ] **Step 4: Commit** — `git add -A && git commit -m "feat(web): static pages and final design pass"`
