<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Conversation extends Model
{
    protected $fillable = ['name', 'is_group', 'created_by'];

    protected function casts(): array
    {
        return ['is_group' => 'boolean'];
    }

    public function members()
    {
        return $this->belongsToMany(User::class)->withPivot('last_read_message_id');
    }

    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    public function latestMessage()
    {
        return $this->hasOne(Message::class)->latestOfMany();
    }
}
