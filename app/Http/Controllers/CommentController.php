<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\Comment;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CommentController extends Controller
{
    public function store(Request $request, Post $post)
    {
        abort_unless($post->user->isVisibleTo($request->user()), 404);

        $request->validate([
            'content' => 'required|string|max:1000',
        ]);

        $comment = $post->comments()->create([
            'user_id' => Auth::id(),
            'content' => $request->content,
        ]);

        return response()->json([...$comment->load('user')->toArray(), 'likes_count' => 0, 'is_liked' => false], 201);
    }

    public function like(Request $request, Comment $comment)
    {
        abort_unless($comment->post->user->isVisibleTo($request->user()), 404);

        $me = $request->user()->id;
        $deleted = $comment->likers()->detach($me);
        if (! $deleted) {
            try {
                $comment->likers()->attach($me);
            } catch (UniqueConstraintViolationException) {
                // Double tap: the other request already liked it.
            }
        }

        return ['liked' => ! $deleted, 'likes_count' => $comment->likers()->count()];
    }

    public function destroy(Comment $comment)
    {
        if ($comment->user_id !== Auth::id()) {
            abort(403);
        }

        $comment->delete();

        return response()->noContent();
    }
}
