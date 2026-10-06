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
    Route::post('register', [RegisteredUserController::class, 'store'])->middleware('throttle:auth');
    Route::post('login', [AuthenticatedSessionController::class, 'store']);
    Route::post('forgot-password', [PasswordResetLinkController::class, 'store'])->middleware('throttle:auth');
    Route::post('reset-password', [NewPasswordController::class, 'store'])->middleware('throttle:auth');
});

Route::get('check-username/{username}', function (string $username) {
    $exists = User::where('username', $username)->exists();
    $reserved = in_array(strtolower($username), User::RESERVED_USERNAMES);

    return ['available' => ! $exists && ! $reserved, 'exists' => $exists, 'reserved' => $reserved];
});

Route::get('posts/{post}/media', [PostController::class, 'media']);
Route::get('users/{username}', [ProfileController::class, 'show']);
Route::get('users/{username}/followers', [ProfileController::class, 'getFollowers']);
Route::get('users/{username}/following', [ProfileController::class, 'getFollowing']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('user', fn (Request $r) => $r->user()->makeVisible('email')->loadCount('pendingFollowers as pending_requests_count'));
    Route::get('users', function (Request $r) {
        $q = trim((string) $r->query('q'));
        if (mb_strlen($q) < 2) {
            return [];
        }
        $like = '%'.str_replace(['%', '_'], ['\\%', '\\_'], $q).'%';

        return User::where('username', 'like', $like)->orWhere('name', 'like', $like)->orderBy('username')->limit(20)->get();
    });
    Route::post('logout', [AuthenticatedSessionController::class, 'destroy']);
    Route::put('password', [PasswordController::class, 'update']);

    Route::get('feed', [PostController::class, 'index']);
    Route::post('posts', [PostController::class, 'store'])->middleware('throttle:posts');
    Route::delete('posts/{post}', [PostController::class, 'destroy']);
    Route::post('posts/{post}/like', [LikeController::class, 'toggle'])->middleware('throttle:social');
    Route::post('posts/{post}/comments', [CommentController::class, 'store'])->middleware('throttle:social');
    Route::delete('comments/{comment}', [CommentController::class, 'destroy']);

    Route::patch('profile', [ProfileController::class, 'update']);
    Route::delete('profile', [ProfileController::class, 'destroy']);
    Route::patch('profile/privacy', [ProfileController::class, 'updatePrivacy']);
    Route::get('follow-requests', [ProfileController::class, 'followRequests']);
    Route::post('follow/{user}', [FollowController::class, 'store'])->middleware('throttle:social');
    Route::delete('follow/{user}', [FollowController::class, 'destroy']);
    Route::post('follow-requests/{user}/accept', [FollowController::class, 'accept']);
    Route::delete('follow-requests/{user}/reject', [FollowController::class, 'reject']);
});
