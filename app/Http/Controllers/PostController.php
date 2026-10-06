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

        // ponytail: no pagination, switch to cursorPaginate once the feed outgrows 50
        return Post::forViewer($me)->visibleTo($me)
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
            $post->media_path = $file->store('posts-media', 'local');
            $post->media_type = str_starts_with((string) $file->getMimeType(), 'video/') ? 'video' : 'image';
        }

        $post->save();

        return response()->json(Post::forViewer($request->user())->find($post->id), 201);
    }

    /** Post photos/videos live on the private disk and are only streamed to people allowed to see the post. */
    public function media(Request $request, Post $post)
    {
        abort_unless($post->media_path && $post->user->isVisibleTo($request->user('sanctum')), 404);

        // BinaryFileResponse handles Range requests, which video seeking needs.
        $response = response()->file(Storage::disk('local')->path($post->media_path));
        $response->setPrivate();
        $response->setMaxAge(3600);

        return $response;
    }

    public function destroy(Request $request, Post $post)
    {
        abort_unless($post->user_id === $request->user()->id, 403);

        if ($post->media_path) {
            Storage::disk('local')->delete($post->media_path);
        }
        $post->delete();

        return response()->noContent();
    }
}
