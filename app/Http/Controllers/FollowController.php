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
