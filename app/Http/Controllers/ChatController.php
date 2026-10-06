<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

/**
 * Direct and group chats. Only mutual follows can be added, which keeps strangers out of minors' inboxes.
 * ponytail: clients poll for new messages; move to Reverb/websockets if polling load matters.
 */
class ChatController extends Controller
{
    public function contacts(Request $request)
    {
        return $request->user()->mutuals()->orderBy('username')->get();
    }

    public function index(Request $request)
    {
        $me = $request->user();
        $unread = $me->unreadByConversation();

        return $me->conversations()->with(['members', 'latestMessage'])->get()
            ->map(fn (Conversation $c) => $this->present($c) + ['unread_count' => (int) ($unread[$c->id] ?? 0)])
            ->sortByDesc(fn ($c) => $c['last_message']['id'] ?? 0)
            ->values();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'user_ids' => ['required', 'array', 'min:1', 'max:20'],
            'user_ids.*' => ['integer', 'distinct', 'exists:users,id'],
            'name' => ['nullable', 'string', 'max:60'],
        ]);
        $me = $request->user();
        $others = User::whereIn('id', $data['user_ids'])->where('id', '!=', $me->id)->get();
        $this->assertFriends($me, $others);

        $isGroup = $others->count() > 1 || filled($data['name'] ?? null);
        if ($others->count() > 1 && blank($data['name'] ?? null)) {
            throw ValidationException::withMessages(['name' => 'Dê um nome pro grupo.']);
        }

        if (! $isGroup) {
            $existing = $me->conversations()->where('is_group', false)
                ->whereHas('members', fn ($q) => $q->where('users.id', $others->first()->id))->first();
            if ($existing) {
                return $this->present($existing->load('members', 'latestMessage'));
            }
        }

        $conversation = Conversation::create(['name' => $isGroup ? $data['name'] : null, 'is_group' => $isGroup, 'created_by' => $me->id]);
        $conversation->members()->attach($others->pluck('id')->push($me->id));

        return response()->json($this->present($conversation->load('members', 'latestMessage')), 201);
    }

    public function messages(Request $request, Conversation $conversation)
    {
        $me = $request->user();
        $this->assertMember($conversation, $me);

        $messages = $conversation->messages()->with('user')
            ->when($request->integer('after'), fn ($q, $after) => $q->where('id', '>', $after)->orderBy('id'),
                fn ($q) => $q->latest('id')->limit(100))
            ->get()->sortBy('id')->values();

        if ($last = $messages->last()) {
            $conversation->members()->updateExistingPivot($me->id, ['last_read_message_id' => $last->id]);
        }

        return $messages;
    }

    public function send(Request $request, Conversation $conversation)
    {
        $me = $request->user();
        $this->assertMember($conversation, $me);
        $data = $request->validate(['body' => ['required', 'string', 'max:2000']]);

        $message = $conversation->messages()->create(['user_id' => $me->id, 'body' => $data['body']]);
        $conversation->members()->updateExistingPivot($me->id, ['last_read_message_id' => $message->id]);
        $conversation->touch();

        return response()->json($message->load('user'), 201);
    }

    public function addMember(Request $request, Conversation $conversation)
    {
        $me = $request->user();
        $this->assertMember($conversation, $me);
        $data = $request->validate(['user_id' => ['required', 'integer', 'exists:users,id']]);
        if (! $conversation->is_group) {
            throw ValidationException::withMessages(['user_id' => 'Só dá pra adicionar pessoas em grupos.']);
        }
        $this->assertFriends($me, User::whereKey($data['user_id'])->get());
        $conversation->members()->syncWithoutDetaching([$data['user_id']]);

        return $this->present($conversation->load('members', 'latestMessage'));
    }

    public function leave(Request $request, Conversation $conversation)
    {
        $this->assertMember($conversation, $request->user());
        $conversation->members()->detach($request->user()->id);
        if (! $conversation->members()->exists()) {
            $conversation->delete();
        }

        return response()->noContent();
    }

    private function assertMember(Conversation $conversation, User $me): void
    {
        abort_unless($conversation->members()->whereKey($me->id)->exists(), 404);
    }

    private function assertFriends(User $me, $users): void
    {
        if ($users->isEmpty() || $users->contains(fn (User $u) => ! $me->isMutualWith($u))) {
            throw ValidationException::withMessages(['user_ids' => 'Só dá pra conversar com quem você segue e te segue de volta.']);
        }
    }

    private function present(Conversation $c): array
    {
        return [
            'id' => $c->id,
            'name' => $c->name,
            'is_group' => $c->is_group,
            'members' => $c->members->map->only(['id', 'name', 'username', 'profile_photo_path'])->values(),
            'last_message' => $c->latestMessage?->only(['id', 'user_id', 'body', 'created_at']),
        ];
    }
}
