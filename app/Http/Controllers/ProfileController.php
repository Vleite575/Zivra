<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

use App\Models\User;
use App\Models\Post;

class ProfileController extends Controller
{
    /**
     * Display the user's public profile.
     */
    public function show($username, $postId = null): Response
    {
        $user = User::where('username', $username)->firstOrFail();

        $isOwnProfile = Auth::check() && Auth::id() === $user->id;
        $isFollowing = Auth::check() ? Auth::user()->isFollowing($user) : false;
        $hasRequestedToFollow = Auth::check() ? Auth::user()->hasRequestedToFollow($user) : false;
        $hasPendingRequestFrom = Auth::check() ? Auth::user()->pendingFollowers()->where('follower_id', $user->id)->exists() : false;

        // Se o perfil for privado e não for o dono e não estiver seguindo
        $canSeeContent = $user->is_public || $isOwnProfile || $isFollowing;

        $posts = $canSeeContent 
            ? $user->posts()
                ->with(['user', 'likes', 'comments.user'])
                ->withCount(['likes', 'comments'])
                ->latest()
                ->get()
                ->map(function ($post) {
                    $post->is_liked = Auth::check() ? $post->isLikedBy(Auth::user()) : false;
                    return $post;
                })
            : [];

        $initialPost = null;
        if ($postId && $canSeeContent) {
            $initialPost = $posts->firstWhere('id', (int) $postId);
        }

        return Inertia::render('Profile/Show', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'bio' => $user->bio,
                'profile_photo_path' => $user->profile_photo_path,
                'followers_count' => $user->followers()->count(),
                'following_count' => $user->following()->count(),
                'posts_count' => $user->posts()->count(),
                'is_public' => $user->is_public,
            ],
            'posts' => $posts,
            'initialPost' => $initialPost,
            'isOwnProfile' => $isOwnProfile,
            'isFollowing' => $isFollowing,
            'hasRequestedToFollow' => $hasRequestedToFollow,
            'hasPendingRequestFrom' => $hasPendingRequestFrom,
            'canSeeContent' => $canSeeContent,
        ]);
    }

    /**
     * Get followers list for a user.
     */
    public function getFollowers($username, Request $request)
    {
        $user = User::where('username', $username)->firstOrFail();
        
        $isOwnProfile = Auth::check() && Auth::id() === $user->id;
        $isFollowing = Auth::check() ? Auth::user()->isFollowing($user) : false;

        if (!$user->is_public && !$isOwnProfile && !$isFollowing) {
            return response()->json(['error' => 'Perfil privado'], 403);
        }

        $query = $user->followers();

        if ($isOwnProfile) {
            if ($request->has('sort')) {
                $sort = $request->sort === 'oldest' ? 'asc' : 'desc';
                $query->orderBy('follows.accepted_at', $sort);
            } else {
                $query->orderBy('follows.accepted_at', 'desc');
            }
        } else {
            $query->inRandomOrder();
        }

        return response()->json($query->get());
    }

    /**
     * Get following list for a user.
     */
    public function getFollowing($username, Request $request)
    {
        $user = User::where('username', $username)->firstOrFail();
        
        $isOwnProfile = Auth::check() && Auth::id() === $user->id;
        $isFollowing = Auth::check() ? Auth::user()->isFollowing($user) : false;

        if (!$user->is_public && !$isOwnProfile && !$isFollowing) {
            return response()->json(['error' => 'Perfil privado'], 403);
        }

        $query = $user->following();

        if ($isOwnProfile) {
            if ($request->has('sort')) {
                $sort = $request->sort === 'oldest' ? 'asc' : 'desc';
                $query->orderBy('follows.accepted_at', $sort);
            } else {
                $query->orderBy('follows.accepted_at', 'desc');
            }
        } else {
            $query->inRandomOrder();
        }

        return response()->json($query->get());
    }

    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    /**
     * Display the user's configurations form.
     */
    public function configurations(Request $request): Response
    {
        return Inertia::render('Profile/Configurations', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    /**
     * Display the user's follow requests.
     */
    public function followRequests(Request $request): Response
    {
        return Inertia::render('Profile/FollowRequests', [
            'requests' => $request->user()->pendingFollowers()->get(),
        ]);
    }

    /**
     * Update the user's privacy settings.
     */
    public function updatePrivacy(Request $request): RedirectResponse
    {
        $request->validate([
            'is_public' => ['required', 'boolean'],
        ]);

        $user = $request->user();
        $user->is_public = $request->is_public;
        $user->save();

        return back()->with('status', 'privacy-updated');
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $user->fill($request->validated());

        if ($request->has('is_public')) {
            $user->is_public = $request->is_public;
        }

        if ($request->hasFile('profile_photo')) {
            if ($user->profile_photo_path) {
                Storage::disk('public')->delete($user->profile_photo_path);
            }
            $path = $request->file('profile_photo')->store('profile-photos', 'public');
            $user->profile_photo_path = $path;
        }

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        return back()->with('status', 'profile-updated');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
