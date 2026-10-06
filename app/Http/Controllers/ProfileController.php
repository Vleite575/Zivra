<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Models\Comment;
use App\Models\Post;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    /**
     * Display a user's public profile.
     */
    public function show(Request $request, string $username)
    {
        $user = User::where('username', $username)->firstOrFail();
        $me = $request->user('sanctum');

        $isOwnProfile = $me?->id === $user->id;
        $isFollowing = $me ? $me->isFollowing($user) : false;
        $canSeeContent = $user->isVisibleTo($me);

        return [
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
            'posts' => $canSeeContent ? $user->posts()->forViewer($me)->get() : [],
            'isOwnProfile' => $isOwnProfile,
            'isFollowing' => $isFollowing,
            'hasRequestedToFollow' => $me ? $me->hasRequestedToFollow($user) : false,
            'hasPendingRequestFrom' => $me ? $me->pendingFollowers()->where('follower_id', $user->id)->exists() : false,
            'canSeeContent' => $canSeeContent,
        ];
    }

    public function getFollowers(Request $request, string $username)
    {
        return $this->followList($request, $username, 'followers');
    }

    public function getFollowing(Request $request, string $username)
    {
        return $this->followList($request, $username, 'following');
    }

    private function followList(Request $request, string $username, string $relation)
    {
        $user = User::where('username', $username)->firstOrFail();
        $me = $request->user('sanctum');
        $isOwnProfile = $me?->id === $user->id;

        if (! $user->isVisibleTo($me)) {
            return response()->json(['error' => 'Perfil privado'], 403);
        }

        $query = $user->{$relation}();

        if ($isOwnProfile) {
            $query->orderBy('follows.accepted_at', $request->sort === 'oldest' ? 'asc' : 'desc');
        } else {
            $query->inRandomOrder();
        }

        return $query->get()->makeHidden('pivot');
    }

    /**
     * My own activity: posts I liked, comments I wrote, comments I liked.
     * Only items on posts I can still see. Lists show 50 (newest first, ?sort=oldest flips), counts are totals.
     */
    public function activity(Request $request)
    {
        $me = $request->user();
        $dir = $request->sort === 'oldest' ? 'asc' : 'desc';
        $onVisiblePost = fn ($q) => $q->whereHas('post', fn ($p) => $p->visibleTo($me));

        $likedPosts = Post::forViewer($me)->visibleTo($me)
            ->join('likes', 'likes.post_id', '=', 'posts.id')->where('likes.user_id', $me->id)
            ->addSelect('likes.created_at as liked_at')->withCasts(['liked_at' => 'datetime'])->reorder('likes.created_at', $dir);
        $comments = Comment::where('user_id', $me->id)->tap($onVisiblePost)
            ->with('post.user')->withCount('likers as likes_count')->orderBy('created_at', $dir);
        $likedComments = Comment::tap($onVisiblePost)->with(['user', 'post.user'])
            ->join('comment_likes', 'comment_likes.comment_id', '=', 'comments.id')->where('comment_likes.user_id', $me->id)
            ->select('comments.*', 'comment_likes.created_at as liked_at')->withCasts(['liked_at' => 'datetime'])->orderBy('comment_likes.created_at', $dir);

        $out = [];
        foreach (['liked_posts' => $likedPosts, 'comments' => $comments, 'liked_comments' => $likedComments] as $key => $query) {
            $out[$key.'_count'] = (clone $query)->count();
            $out[$key] = $query->limit(50)->get();
        }

        return $out;
    }

    public function followRequests(Request $request)
    {
        return $request->user()->pendingFollowers()->get();
    }

    public function updatePrivacy(Request $request)
    {
        $request->validate(['is_public' => ['required', 'boolean']]);

        $user = $request->user();
        $user->is_public = $request->boolean('is_public');
        $user->save();

        // A public profile has nothing to approve: pending requests become follows.
        if ($user->is_public) {
            $user->pendingFollowers()->newPivotQuery()->whereNull('accepted_at')->update(['accepted_at' => now()]);
        }

        return $user;
    }

    public function update(ProfileUpdateRequest $request)
    {
        $user = $request->user();
        $user->fill($request->validated());

        if ($request->hasFile('profile_photo')) {
            if ($user->profile_photo_path) {
                Storage::disk('public')->delete($user->profile_photo_path);
            }
            $user->profile_photo_path = $request->file('profile_photo')->store('profile-photos', 'public');
        }

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        return $user->makeVisible('email');
    }

    public function destroy(Request $request)
    {
        $request->validate(['password' => ['required', 'current_password']]);

        $user = $request->user();

        Auth::guard('web')->logout();
        $user->delete();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->noContent();
    }
}
