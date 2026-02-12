import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-bold leading-tight text-gray-900">
                    Editar Perfil
                </h2>
            }
        >
            <Head title="Editar Perfil" />

            <div className="py-12 bg-gray-50 min-h-screen">
                <div className="mx-auto max-w-4xl space-y-8 sm:px-6 lg:px-8">
                    <div className="bg-white p-6 shadow-xl border border-gray-100 sm:rounded-2xl sm:p-10 transition-all hover:shadow-2xl">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                        />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
