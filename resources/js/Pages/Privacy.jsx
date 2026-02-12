import { Head, Link, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Privacy() {
    const { auth } = usePage().props;

    const Content = () => (
        <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100/50 border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-10 text-white">
                    <h1 className="text-3xl font-black tracking-tight">Política de Privacidade</h1>
                    <p className="mt-2 text-indigo-100 opacity-90">Sua privacidade é o nosso compromisso fundamental.</p>
                </div>
                
                <div className="p-8 md:p-12 space-y-10">
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">1. Coleta de Informações</h2>
                        </div>
                        <p className="text-gray-600 leading-relaxed">
                            Na Zivra, coletamos apenas o necessário para proporcionar a melhor experiência social. Isso inclui informações que você nos fornece ao criar seu perfil, como nome, e-mail e data de nascimento, além do conteúdo que você compartilha espontaneamente em nossa rede.
                        </p>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">2. Uso das Informações</h2>
                        </div>
                        <p className="text-gray-600 leading-relaxed">
                            Seus dados são utilizados exclusivamente para personalizar seu feed, facilitar conexões com outros usuários e garantir que a plataforma funcione de maneira rápida e segura. Não utilizamos seus dados para fins que não tenham sido previamente autorizados por você.
                        </p>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">3. Segurança e Proteção</h2>
                        </div>
                        <p className="text-gray-600 leading-relaxed">
                            Implementamos camadas rigorosas de proteção para garantir que suas informações pessoais estejam seguras contra acessos não autorizados. Seus dados são criptografados e armazenados em infraestrutura de alta confiabilidade.
                        </p>
                    </section>

                    <div className="pt-8 border-t border-gray-100 text-center">
                        <p className="text-sm text-gray-400">Última atualização: 12 de Fevereiro de 2026</p>
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
                <Head title="Privacidade • Zivra" />
                <Content />
            </AuthenticatedLayout>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Head title="Privacidade • Zivra" />
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
