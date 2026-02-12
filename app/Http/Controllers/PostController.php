<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;
use Inertia\Inertia;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class PostController extends Controller
{
    public function index()
    {
        $posts = Post::with(['user', 'likes', 'comments.user'])
            ->withCount(['likes', 'comments'])
            ->latest()
            ->get()
            ->map(function ($post) {
                $post->is_liked = Auth::check() ? $post->isLikedBy(Auth::user()) : false;
                return $post;
            });

        return Inertia::render('Dashboard', [
            'posts' => $posts
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'content' => 'required|string|max:280',
            'media' => 'nullable|file|mimes:jpg,jpeg,png,mp4,mov,avi|max:20480', // 20MB max
        ]);

        $post = new Post();
        $post->user_id = Auth::id();
        $post->content = $request->content;

        if ($request->hasFile('media')) {
            $file = $request->file('media');
            $path = $file->store('posts-media', 'public');
            $post->media_path = $path;
            
            $extension = strtolower($file->getClientOriginalExtension());
            $post->media_type = in_array($extension, ['mp4', 'mov', 'avi']) ? 'video' : 'image';
        }

        $post->save();

        return redirect()->route('dashboard');
    }
}