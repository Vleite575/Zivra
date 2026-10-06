<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $key = fn (Request $r) => $r->user()?->id ?: $r->ip();
        RateLimiter::for('api', fn (Request $r) => Limit::perMinute(120)->by($key($r)));
        // Signup and password reset: per IP, slow enough to stop enumeration and spam accounts.
        RateLimiter::for('auth', fn (Request $r) => Limit::perMinute(5)->by($r->ip()));
        RateLimiter::for('posts', fn (Request $r) => Limit::perMinute(10)->by($key($r)));
        RateLimiter::for('social', fn (Request $r) => Limit::perMinute(60)->by($key($r)));
        RateLimiter::for('messages', fn (Request $r) => Limit::perMinute(40)->by($key($r)));

        ResetPassword::createUrlUsing(fn ($user, string $token) =>
            config('app.frontend_url')."/reset-password?token=$token&email=".urlencode($user->email));
    }
}
