<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

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
            $post->media_type = str_starts_with((string) $file->getMimeType(), 'video/') ? 'video' : 'image';
        }

        $post->save();

        return response()->json(Post::forViewer($request->user())->find($post->id), 201);
    }

    public function destroy(Request $request, Post $post)
    {
        abort_unless($post->user_id === $request->user()->id, 403);

        if ($post->media_path) {
            Storage::disk('public')->delete($post->media_path);
        }
        $post->delete();

        return response()->noContent();
    }
}
