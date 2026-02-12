import { Head, Link, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Security() {
    const { auth } = usePage().props;

    const Content = () => (
        <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100/50 border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-10 text-white">
                    <h1 className="text-3xl font-black tracking-tight">Segurança na Zivra</h1>
                    <p className="mt-2 text-indigo-100 opacity-90">Protegendo sua conta com tecnologia de ponta.</p>
                </div>
                
                <div className="p-8 md:p-12 space-y-10">
                    <section className="relative">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">1. Proteção de Conta</h2>
                        </div>
                        <p className="text-gray-600 leading-relaxed">
                            Sua segurança começa com uma senha forte. Recomendamos o uso de combinações complexas e a ativação da autenticação de dois fatores (2FA) para adicionar uma camada extra de proteção à sua identidade na Zivra.
                        </p>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">2. Monitoramento Ativo</h2>
                        </div>
                        <p className="text-gray-600 leading-relaxed">
                            Nossos sistemas monitoram constantemente atividades suspeitas em tempo real. Se detectarmos um acesso incomum ou tentativa de invasão, agimos imediatamente para bloquear a ameaça e notificar você.
                        </p>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">3. Denúncias e Suporte</h2>
                        </div>
                        <p className="text-gray-600 leading-relaxed">
                            A comunidade Zivra é protegida por todos. Se você encontrar conteúdo inadequado, perfis falsos ou comportamento malicioso, use nossas ferramentas de denúncia. Nossa equipe de segurança analisa cada caso com prioridade.
                        </p>
                    </section>

                    <div className="pt-8 border-t border-gray-100 text-center">
                        <div className="inline-flex items-center gap-2 text-sm text-green-600 font-bold bg-green-50 px-4 py-2 rounded-full">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            Sistemas Operacionais
                        </div>
                        <p className="mt-4 text-sm text-gray-400">Última revisão de segurança: 12 de Fevereiro de 2026</p>
                    </div>
                </div>
            </div>
            
            {!auth.user && (
                <div className="mt-8 text-center">
                    <Link href={route('welcome')} className="text-sm font-bold text-indigo-600 hover:text-indigo-500 transition-colors">
                        ← Voltar para a página inicial
                    </Link>
                </div>
            )}
        </div>
    );

    if (auth.user) {
        return (
            <AuthenticatedLayout>
                <Head title="Segurança • Zivra" />
                <Content />
            </AuthenticatedLayout>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Head title="Segurança • Zivra" />
            <nav className="bg-white border-b border-gray-100 py-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <Link href={route('welcome')} className="flex items-center gap-2">
                        <ApplicationLogo className="h-8 w-auto fill-indigo-600" />
                        <span className="text-xl font-black tracking-tighter text-gray-900">Zivra</span>
                    </Link>
                </div>
            </nav>
            <Content />
        </div>
    );
}
