<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    protected $fillable = ['content', 'user_id'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function likes()
    {
        return $this->hasMany(Like::class);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    /** Posts $viewer may see: own, followed (accepted) and public authors. */
    public function scopeVisibleTo($query, User $viewer)
    {
        $ids = $viewer->following()->pluck('users.id')->push($viewer->id);

        return $query->where(fn ($q) => $q->whereIn('posts.user_id', $ids)
            ->orWhereHas('user', fn ($u) => $u->where('is_public', true)));
    }

    public function scopeForViewer($query, ?User $viewer)
    {
        return $query->with(['user', 'comments' => fn ($q) => $q->with('user')
                ->withCount('likers as likes_count')
                ->withExists(['likers as is_liked' => fn ($l) => $l->where('user_id', $viewer?->id)])])
            ->withCount(['likes', 'comments'])
            ->withExists(['likes as is_liked' => fn ($q) => $q->where('user_id', $viewer?->id)])
            ->latest();
    }
}
