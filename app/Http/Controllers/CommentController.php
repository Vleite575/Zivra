<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\Comment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CommentController extends Controller
{
    public function store(Request $request, Post $post)
    {
        $request->validate([
            'content' => 'required|string|max:1000',
        ]);

        $post->comments()->create([
            'user_id' => Auth::id(),
            'content' => $request->content,
        ]);

        return back();
    }

    public function destroy(Comment $comment)
    {
        if ($comment->user_id !== Auth::id()) {
            abort(403);
        }

        $comment->delete();

        return back();
    }
}
