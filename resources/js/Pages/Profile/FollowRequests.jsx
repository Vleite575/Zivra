import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function FollowRequests({ requests }) {
    const handleAccept = (userId) => {
        router.post(route('follow.accept', userId), {}, {
            preserveScroll: true,
        });
    };

    const handleReject = (userId) => {
        router.delete(route('follow.reject', userId), {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-bold leading-tight text-gray-900">
                    Solicitações de Seguidores
                </h2>
            }
        >
            <Head title="Solicitações" />

            <div className="py-12 bg-gray-50 min-h-screen">
                <div className="mx-auto max-w-2xl space-y-8 sm:px-6 lg:px-8">
                    <div className="bg-white p-6 shadow-xl border border-gray-100 sm:rounded-2xl transition-all hover:shadow-2xl">
                        {requests.length > 0 ? (
                            <ul className="divide-y divide-gray-100">
                                {requests.map((user) => (
                                    <li key={user.id} className="flex items-center justify-between py-4">
                                        <div className="flex items-center">
                                            <Link href={route('profile.show', user.username)} className="flex-shrink-0">
                                                {user.profile_photo_path ? (
                                                    <img 
                                                        src={`/Zivra/public/storage/${user.profile_photo_path}`} 
                                                        alt={user.name} 
                                                        className="h-12 w-12 rounded-full object-cover border border-gray-100" 
                                                    />
                                                ) : (
                                                    <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-100">
                                                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                                                    </div>
                                                )}
                                            </Link>
                                            <div className="ml-4">
                                                <Link href={route('profile.show', user.username)} className="text-sm font-bold text-gray-900 hover:underline">
                                                    {user.username}
                                                </Link>
                                                <div className="text-sm text-gray-500">{user.name}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleAccept(user.id)}
                                                className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 transition-colors"
                                            >
                                                Aceitar
                                            </button>
                                            <button
                                                onClick={() => handleReject(user.id)}
                                                className="rounded-lg bg-gray-200 px-4 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-300 transition-colors"
                                            >
                                                Excluir
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-center py-12">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50">
                                    <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">Sem solicitações pendentes</h3>
                                <p className="mt-1 text-sm text-gray-500">Quando as pessoas pedirem para seguir você, você as verá aqui.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
