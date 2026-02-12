<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
})->name('welcome');

use App\Http\Controllers\PostController;

Route::get('/dashboard', [PostController::class, 'index'])->middleware(['auth', 'verified'])->name('dashboard');
Route::post('/posts', [PostController::class, 'store'])->middleware(['auth', 'verified'])->name('posts.store');

use App\Http\Controllers\FollowController;
use App\Http\Controllers\LikeController;
use App\Http\Controllers\CommentController;

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::get('/configurations', [ProfileController::class, 'configurations'])->name('profile.configurations');
    Route::get('/follow-requests', [ProfileController::class, 'followRequests'])->name('profile.follow-requests');
    Route::patch('/configurations/privacy', [ProfileController::class, 'updatePrivacy'])->name('profile.updatePrivacy');
    Route::get('/messages', function () {
        return Inertia::render('Chat/Index');
    })->name('messages.index');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    
    Route::post('/follow/{user}', [FollowController::class, 'store'])->name('follow.store');
    Route::delete('/follow/{user}', [FollowController::class, 'destroy'])->name('follow.destroy');
    Route::post('/follow-requests/{user}/accept', [FollowController::class, 'accept'])->name('follow.accept');
    Route::delete('/follow-requests/{user}/reject', [FollowController::class, 'reject'])->name('follow.reject');

    Route::post('/posts/{post}/like', [LikeController::class, 'toggle'])->name('posts.like');
    Route::post('/posts/{post}/comments', [CommentController::class, 'store'])->name('comments.store');
    Route::delete('/comments/{comment}', [CommentController::class, 'destroy'])->name('comments.destroy');
});

Route::get('/privacy', function () {
    return Inertia::render('Privacy');
})->name('privacy');

Route::get('/security', function () {
    return Inertia::render('Security');
})->name('security');

Route::get('/check-username/{username}', function ($username) {
    $exists = \App\Models\User::where('username', $username)->exists();
    $isReserved = in_array(strtolower($username), ['login', 'register', 'dashboard', 'profile', 'privacy', 'security', 'u', 'posts']);
    
    return response()->json([
        'available' => !$exists && !$isReserved,
        'exists' => $exists,
        'reserved' => $isReserved
    ]);
})->name('username.check');

require __DIR__.'/auth.php';

// Rota dinâmica para perfil público e posts específicos
Route::get('/{username}/followers', [ProfileController::class, 'getFollowers'])->name('profile.followers');
Route::get('/{username}/following', [ProfileController::class, 'getFollowing'])->name('profile.following');
Route::get('/{username}', [ProfileController::class, 'show'])->name('profile.show');
Route::get('/{username}/p/{postId}', [ProfileController::class, 'show'])->name('profile.show.post');
