<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\Like;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LikeController extends Controller
{
    public function toggle(Post $post)
    {
        $like = $post->likes()->where('user_id', Auth::id())->first();

        if ($like) {
            $like->delete();
            $liked = false;
        } else {
            $post->likes()->create([
                'user_id' => Auth::id(),
            ]);
            $liked = true;
        }

        return back();
    }
}
