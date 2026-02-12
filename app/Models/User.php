<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'username',
        'email',
        'password',
        'bio',
        'birth_date',
        'is_public',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function posts()
    {
        return $this->hasMany(Post::class);
    }

    public function followers()
    {
        return $this->belongsToMany(User::class, 'follows', 'following_id', 'follower_id')
            ->whereNotNull('accepted_at')
            ->withPivot('accepted_at')
            ->withTimestamps();
    }

    public function following()
    {
        return $this->belongsToMany(User::class, 'follows', 'follower_id', 'following_id')
            ->whereNotNull('accepted_at')
            ->withPivot('accepted_at')
            ->withTimestamps();
    }

    public function pendingFollowers()
    {
        return $this->belongsToMany(User::class, 'follows', 'following_id', 'follower_id')
            ->whereNull('accepted_at');
    }

    public function pendingFollowing()
    {
        return $this->belongsToMany(User::class, 'follows', 'follower_id', 'following_id')
            ->whereNull('accepted_at');
    }

    public function allFollowing()
    {
        return $this->belongsToMany(User::class, 'follows', 'follower_id', 'following_id');
    }

    public function isFollowing(User $user)
    {
        return $this->following()
            ->where('following_id', $user->id)
            ->exists();
    }

    public function hasRequestedToFollow(User $user)
    {
        return $this->pendingFollowing()
            ->where('following_id', $user->id)
            ->exists();
    }
}
