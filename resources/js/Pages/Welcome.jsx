import { Head, Link, useForm, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import Checkbox from '@/Components/Checkbox';
import { useEffect } from 'react';

export default function Welcome({ auth, status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
        redirect: new URLSearchParams(window.location.search).get('redirect') || '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    // Se já estiver logado, redirecionar para o dashboard
    useEffect(() => {
        if (auth.user) {
            window.location.href = route('dashboard');
        }
    }, [auth.user]);

    if (auth.user) return null;

    return (
        <>
            <Head title="Zivra • Conecte-se com o mundo" />
            
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-[800px] flex flex-col md:flex-row items-center gap-12 px-4">
                    
                    {/* Lado Esquerdo - Branding/Hero */}
                    <div className="hidden md:flex flex-col flex-1 text-left">
                        <div className="flex items-center gap-3 mb-8">
                            <ApplicationLogo className="h-16 w-auto fill-indigo-600" />
                            <h1 className="text-5xl font-black tracking-tighter text-gray-900">Zivra</h1>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-800 leading-tight mb-4">
                            A rede social feita para <span className="text-indigo-600">você</span>.
                        </h2>
                        <p className="text-xl text-gray-600 mb-8 max-w-md">
                            Compartilhe momentos, conecte-se com amigos e descubra o que há de novo no mundo. Simples, rápido e seguro.
                        </p>
                        
                        <div className="flex gap-4">
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="h-10 w-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden shadow-sm">
                                        <img src={`https://i.pravatar.cc/150?u=${i + 10}`} alt="" className="h-full w-full object-cover" />
                                    </div>
                                ))}
                            </div>
                            <div className="text-sm text-gray-500 self-center">
                                +1.000 pessoas já se juntaram
                            </div>
                        </div>
                    </div>

                    {/* Lado Direito - Login Form */}
                    <div className="w-full max-w-sm">
                        <div className="bg-white p-8 border border-gray-200 rounded-2xl shadow-xl shadow-indigo-100/50">
                            <div className="flex flex-col items-center mb-8 md:hidden">
                                <ApplicationLogo className="h-12 w-auto mb-2" />
                                <h1 className="text-3xl font-black tracking-tighter text-gray-900">Zivra</h1>
                            </div>

                            <h3 className="text-lg font-semibold text-gray-800 mb-6 text-center md:text-left">Acesse sua conta</h3>

                            {status && (
                                <div className="mb-4 text-sm font-medium text-green-600 bg-green-50 p-3 rounded-lg">
                                    {status}
                                </div>
                            )}

                            <form onSubmit={submit} className="space-y-4">
                                <div>
                                    <TextInput
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        className="mt-1 block w-full bg-gray-50 border-gray-200 focus:ring-indigo-500 focus:border-indigo-500 rounded-xl"
                                        autoComplete="username"
                                        placeholder="E-mail"
                                        isFocused={true}
                                        onChange={(e) => setData('email', e.target.value)}
                                    />
                                    <InputError message={errors.email} className="mt-2" />
                                </div>

                                <div>
                                    <TextInput
                                        id="password"
                                        type="password"
                                        name="password"
                                        value={data.password}
                                        className="mt-1 block w-full bg-gray-50 border-gray-200 focus:ring-indigo-500 focus:border-indigo-500 rounded-xl"
                                        autoComplete="current-password"
                                        placeholder="Senha"
                                        onChange={(e) => setData('password', e.target.value)}
                                    />
                                    <InputError message={errors.password} className="mt-2" />
                                </div>

                                <div className="flex items-center justify-between">
                                    <label className="flex items-center">
                                        <Checkbox
                                            name="remember"
                                            checked={data.remember}
                                            onChange={(e) => setData('remember', e.target.checked)}
                                            className="text-indigo-600 focus:ring-indigo-500 rounded"
                                        />
                                        <span className="ms-2 text-sm text-gray-600">Lembrar</span>
                                    </label>
                                    
                                    {canResetPassword && (
                                        <Link
                                            href={route('password.request')}
                                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-500"
                                        >
                                            Esqueceu a senha?
                                        </Link>
                                    )}
                                </div>

                                <PrimaryButton 
                                    className="w-full justify-center py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-[0.98]" 
                                    disabled={processing}
                                >
                                    Entrar
                                </PrimaryButton>
                            </form>

                            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                                <p className="text-sm text-gray-600">
                                    Não tem uma conta?{' '}
                                    <Link
                                        href={data.redirect ? route('register', { redirect: data.redirect }) : route('register')}
                                        className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors"
                                    >
                                        Cadastre-se
                                    </Link>
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-center gap-6 text-xs text-gray-400 font-medium">
                            <Link href={route('privacy')} className="hover:text-gray-600 transition-colors">Privacidade</Link>
                            <Link href={route('security')} className="hover:text-gray-600 transition-colors">Segurança</Link>
                            <span>© 2026 Zivra</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
