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
