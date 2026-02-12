import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        username: '',
        email: '',
        birth_date: '',
        password: '',
        password_confirmation: '',
        redirect: new URLSearchParams(window.location.search).get('redirect') || '',
    });

    const [usernameStatus, setUsernameStatus] = useState({
        loading: false,
        available: null,
        message: ''
    });

    const timeoutRef = useRef(null);

    const checkUsername = useCallback(async (username) => {
        if (username.length < 3) {
            setUsernameStatus({ loading: false, available: null, message: '' });
            return;
        }

        setUsernameStatus(prev => ({ ...prev, loading: true }));
        try {
            const response = await axios.get(route('username.check', username));
            if (response.data.available) {
                setUsernameStatus({
                    loading: false,
                    available: true,
                    message: 'Nick disponível!'
                });
            } else if (response.data.reserved) {
                setUsernameStatus({
                    loading: false,
                    available: false,
                    message: 'Este nick é reservado pelo sistema.'
                });
            } else {
                setUsernameStatus({
                    loading: false,
                    available: false,
                    message: 'Este nick já está em uso.'
                });
            }
        } catch (error) {
            setUsernameStatus({ loading: false, available: null, message: '' });
        }
    }, []);

    useEffect(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        if (data.username) {
            timeoutRef.current = setTimeout(() => {
                checkUsername(data.username);
            }, 500);
        } else {
            setUsernameStatus({ loading: false, available: null, message: '' });
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [data.username, checkUsername]);

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Criar Conta" />

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="name" value="Nome Completo" />

                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className="mt-1 block w-full"
                        autoComplete="name"
                        isFocused={true}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />

                    <InputError message={errors.name} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="username" value="Nick (Nome de usuário)" />

                    <div className="relative">
                        <TextInput
                            id="username"
                            name="username"
                            value={data.username}
                            className={`mt-1 block w-full ${
                                usernameStatus.available === true ? 'border-green-500 focus:ring-green-500' : 
                                usernameStatus.available === false ? 'border-red-500 focus:ring-red-500' : ''
                            }`}
                            placeholder="ex: vs.leit"
                            onChange={(e) => setData('username', e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, ''))}
                            required
                        />
                        
                        {usernameStatus.loading && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600"></div>
                            </div>
                        )}
                    </div>

                    {usernameStatus.message && (
                        <p className={`mt-2 text-sm ${usernameStatus.available ? 'text-green-600' : 'text-red-600'}`}>
                            {usernameStatus.message}
                        </p>
                    )}

                    <InputError message={errors.username} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="email" value="E-mail" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="birth_date" value="Data de Nascimento" />

                    <TextInput
                        id="birth_date"
                        type="date"
                        name="birth_date"
                        value={data.birth_date}
                        className="mt-1 block w-full"
                        onChange={(e) => setData('birth_date', e.target.value)}
                        required
                    />

                    <InputError message={errors.birth_date} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Senha" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Confirmar Senha"
                    />

                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                        required
                    />

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2"
                    />
                </div>

                <div className="mt-8">
                    <PrimaryButton className="w-full justify-center py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-[0.98]" disabled={processing}>
                        Cadastrar na Zivra
                    </PrimaryButton>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                    <p className="text-sm text-gray-600">
                        Já tem uma conta?{' '}
                        <Link
                            href={data.redirect ? route('login', { redirect: data.redirect }) : route('login')}
                            className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors"
                        >
                            Entre agora
                        </Link>
                    </p>
                </div>
            </form>
        </GuestLayout>
    );
}