import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import { Transition } from '@headlessui/react';

export default function Configurations({ mustVerifyEmail, status }) {
    const user = usePage().props.auth.user;
    
    const { data, setData, patch, processing, recentlySuccessful } = useForm({
        is_public: user.is_public ?? true,
    });

    const submitPrivacy = (e) => {
        e.preventDefault();
        patch(route('profile.updatePrivacy'), {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-bold leading-tight text-gray-900">
                    Configurações
                </h2>
            }
        >
            <Head title="Configurações" />

            <div className="py-12 bg-gray-50 min-h-screen">
                <div className="mx-auto max-w-4xl space-y-8 sm:px-6 lg:px-8">
                    {/* Privacidade do Perfil */}
                    <div className="bg-white p-6 shadow-xl border border-gray-100 sm:rounded-2xl sm:p-10 transition-all hover:shadow-2xl">
                        <header className="mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Privacidade da Conta</h2>
                            <p className="mt-1 text-sm text-gray-500">
                                Controle quem pode ver suas publicações e informações.
                            </p>
                        </header>

                        <form onSubmit={submitPrivacy} className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div>
                                    <h4 className="text-sm font-bold text-gray-900">Conta Privada</h4>
                                    <p className="text-xs text-gray-500">Quando sua conta é privada, apenas pessoas que você aprova podem ver suas fotos e vídeos.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setData('is_public', !data.is_public)}
                                    className={`${
                                        !data.is_public ? 'bg-indigo-600' : 'bg-gray-200'
                                    } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none`}
                                >
                                    <span
                                        className={`${
                                            !data.is_public ? 'translate-x-5' : 'translate-x-0'
                                        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                                    />
                                </button>
                            </div>

                            <div className="flex items-center gap-4">
                                <PrimaryButton disabled={processing}>Salvar Preferência</PrimaryButton>
                                <Transition
                                    show={recentlySuccessful}
                                    enter="transition ease-in-out"
                                    enterFrom="opacity-0"
                                    leave="transition ease-in-out"
                                    leaveTo="opacity-0"
                                >
                                    <p className="text-sm text-indigo-600 font-medium">Salvo com sucesso.</p>
                                </Transition>
                            </div>
                        </form>
                    </div>

                    {/* Alterar Senha */}
                    <div className="bg-white p-6 shadow-xl border border-gray-100 sm:rounded-2xl sm:p-10 transition-all hover:shadow-2xl">
                        <UpdatePasswordForm />
                    </div>

                    {/* Deletar Conta */}
                    <div className="bg-white p-6 shadow-xl border border-gray-100 sm:rounded-2xl sm:p-10 transition-all hover:shadow-2xl border-l-4 border-l-red-500">
                        <DeleteUserForm />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
