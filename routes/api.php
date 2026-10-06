<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\FollowController;
use App\Http\Controllers\LikeController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\ProfileController;
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

Route::get('users/{username}', [ProfileController::class, 'show']);
Route::get('users/{username}/followers', [ProfileController::class, 'getFollowers']);
Route::get('users/{username}/following', [ProfileController::class, 'getFollowing']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('user', fn (Request $r) => $r->user()->makeVisible('email'));
    Route::post('logout', [AuthenticatedSessionController::class, 'destroy']);
    Route::put('password', [PasswordController::class, 'update']);

    Route::get('feed', [PostController::class, 'index']);
    Route::post('posts', [PostController::class, 'store']);
    Route::post('posts/{post}/like', [LikeController::class, 'toggle']);
    Route::post('posts/{post}/comments', [CommentController::class, 'store']);
    Route::delete('comments/{comment}', [CommentController::class, 'destroy']);

    Route::patch('profile', [ProfileController::class, 'update']);
    Route::delete('profile', [ProfileController::class, 'destroy']);
    Route::patch('profile/privacy', [ProfileController::class, 'updatePrivacy']);
    Route::get('follow-requests', [ProfileController::class, 'followRequests']);
    Route::post('follow/{user}', [FollowController::class, 'store']);
    Route::delete('follow/{user}', [FollowController::class, 'destroy']);
    Route::post('follow-requests/{user}/accept', [FollowController::class, 'accept']);
    Route::delete('follow-requests/{user}/reject', [FollowController::class, 'reject']);
});
