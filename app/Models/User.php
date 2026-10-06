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

    /** Usernames that collide with frontend or API routes. */
    public const RESERVED_USERNAMES = [
        'api', 'storage', 'sanctum', 'login', 'register', 'forgot-password', 'reset-password',
        'feed', 'settings', 'follow-requests', 'privacy', 'security', 'messages', 'p', '_next',
    ];

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
        'email',
        'birth_date',
        'email_verified_at',
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
            'is_public' => 'boolean',
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

    /** Whether $viewer may see this user's posts. */
    public function isVisibleTo(?User $viewer): bool
    {
        return $this->is_public || $viewer?->id === $this->id || ($viewer && $viewer->isFollowing($this));
    }

    public function conversations()
    {
        return $this->belongsToMany(Conversation::class)->withPivot('last_read_message_id');
    }

    /** People who follow me and whom I follow back (both accepted): the only people I can chat with. */
    public function mutuals()
    {
        return User::whereIn('id', $this->following()->pluck('users.id'))
            ->whereIn('id', $this->followers()->pluck('users.id'));
    }

    public function isMutualWith(User $other): bool
    {
        return $this->isFollowing($other) && $other->isFollowing($this);
    }

    /** Unread messages from others, keyed by conversation id. */
    public function unreadByConversation(): \Illuminate\Support\Collection
    {
        return \DB::table('messages')
            ->join('conversation_user as cu', function ($join) {
                $join->on('cu.conversation_id', '=', 'messages.conversation_id')->where('cu.user_id', $this->id);
            })
            ->where('messages.user_id', '!=', $this->id)
            ->whereRaw('messages.id > coalesce(cu.last_read_message_id, 0)')
            ->groupBy('messages.conversation_id')
            ->pluck(\DB::raw('count(*)'), 'messages.conversation_id');
    }
}
