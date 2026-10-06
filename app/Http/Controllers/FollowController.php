<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FollowController extends Controller
{
    public function store(User $user)
    {
        if (Auth::id() === $user->id) {
            abort(422, 'Você não pode seguir a si mesmo.');
        }

        // Se já segue ou tem solicitação pendente, não faz nada
        if (Auth::user()->isFollowing($user) || Auth::user()->hasRequestedToFollow($user)) {
            return response()->noContent();
        }

        $attributes = [];
        if ($user->is_public) {
            $attributes['accepted_at'] = now();
        }

        Auth::user()->following()->attach($user->id, $attributes);

        return response()->noContent();
    }

    /**
     * Who to follow: people my follows follow (with one of them named), then the most followed.
     * ponytail: two simple queries; rank with a real score if the user base grows.
     */
    public function suggestions()
    {
        $me = Auth::user();
        $mine = $me->following()->pluck('users.id');
        $skip = $me->allFollowing()->pluck('users.id')->push($me->id);

        $viaFriends = \DB::table('follows')
            ->whereIn('follower_id', $mine)->whereNotNull('accepted_at')->whereNotIn('following_id', $skip)
            ->select('following_id', \DB::raw('count(*) as n'), \DB::raw('min(follower_id) as via'))
            ->groupBy('following_id')->orderByDesc('n')->limit(5)->get();

        $users = User::whereIn('id', $viaFriends->pluck('following_id'))->get()->keyBy('id');
        $vias = User::whereIn('id', $viaFriends->pluck('via'))->pluck('username', 'id');
        $result = $viaFriends->map(fn ($row) => $users[$row->following_id]->toArray() + ['followed_by' => $vias[$row->via]]);

        if ($result->count() < 5) {
            $popular = User::whereNotIn('id', $skip->merge($result->pluck('id')))
                ->withCount('followers')->orderByDesc('followers_count')->orderByDesc('id')
                ->limit(5 - $result->count())->get()
                ->map(fn (User $u) => $u->toArray() + ['followed_by' => null]);
            $result = $result->concat($popular);
        }

        return $result->values();
    }

    public function destroy(User $user)
    {
        // Remove follow ou solicitação de follow
        Auth::user()->allFollowing()->detach($user->id);

        return response()->noContent();
    }

    public function accept(User $user)
    {
        // Aceita solicitação de seguidor (o usuário logado é quem está sendo seguido)
        $followRequest = Auth::user()->pendingFollowers()->where('follower_id', $user->id)->first();

        if ($followRequest) {
            Auth::user()->followers()->updateExistingPivot($user->id, ['accepted_at' => now()]);
        }

        return response()->noContent();
    }

    public function reject(User $user)
    {
        // Rejeita solicitação de seguidor (o usuário logado é quem está sendo seguido)
        Auth::user()->pendingFollowers()->detach($user->id);

        return response()->noContent();
    }
}
