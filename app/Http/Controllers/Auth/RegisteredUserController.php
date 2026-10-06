<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Response;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules;

class RegisteredUserController extends Controller
{
    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'username' => ['required', 'string', 'lowercase', 'alpha_dash', 'max:30', 'unique:'.User::class, Rule::notIn(User::RESERVED_USERNAMES)],
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'birth_date' => 'required|date|before:'.now()->subYears(14)->format('Y-m-d'),
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ], [
            'birth_date.before' => 'Você precisa ter pelo menos 14 anos para se cadastrar na Zivra.',
            'username.unique' => 'Este nick já está sendo usado.',
            'username.not_in' => 'Esse nick é reservado. Escolha outro.',
            'username.alpha_dash' => 'O nick pode conter apenas letras, números, traços e underscores.',
        ]);

        $user = User::create([
            'name' => $request->name,
            'username' => $request->username,
            'email' => $request->email,
            'birth_date' => $request->birth_date,
            'password' => Hash::make($request->password),
        ]);

        event(new Registered($user));

        Auth::login($user);

        return response()->noContent();
    }
}
