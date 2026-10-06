<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;

class PostController extends Controller
{
    public function index(Request $request)
    {
        $me = $request->user();
        $visible = $me->following()->pluck('users.id')->push($me->id);

        // ponytail: no pagination, switch to cursorPaginate once the feed outgrows 50
        return Post::forViewer($me)
            ->where(fn ($q) => $q->whereIn('user_id', $visible)
                ->orWhereHas('user', fn ($u) => $u->where('is_public', true)))
            ->limit(50)
            ->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'content' => 'required|string|max:280',
            'media' => 'nullable|file|mimes:jpg,jpeg,png,mp4,mov,avi|max:20480',
        ]);

        $post = new Post(['content' => $request->content]);
        $post->user_id = $request->user()->id;

        if ($file = $request->file('media')) {
            $post->media_path = $file->store('posts-media', 'public');
            $post->media_type = in_array(strtolower($file->getClientOriginalExtension()), ['mp4', 'mov', 'avi']) ? 'video' : 'image';
        }

        $post->save();

        return response()->json(Post::forViewer($request->user())->find($post->id), 201);
    }
}
