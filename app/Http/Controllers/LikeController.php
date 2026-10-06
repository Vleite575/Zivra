<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\Request;

class LikeController extends Controller
{
    public function toggle(Request $request, Post $post)
    {
        abort_unless($post->user->isVisibleTo($request->user()), 404);

        $deleted = $post->likes()->where('user_id', $request->user()->id)->delete();
        if (! $deleted) {
            try {
                $post->likes()->create(['user_id' => $request->user()->id]);
            } catch (UniqueConstraintViolationException) {
                // Double tap: the other request already liked it.
            }
        }

        return ['liked' => ! $deleted, 'likes_count' => $post->likes()->count()];
    }
}
