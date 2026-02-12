import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-gray-50 pt-6 sm:justify-center sm:pt-0">
            <div className="mb-8 flex flex-col items-center">
                <Link href={route('welcome')} className="flex flex-col items-center gap-2">
                    <ApplicationLogo className="h-16 w-auto fill-indigo-600" />
                    <h1 className="text-4xl font-black tracking-tighter text-gray-900">Zivra</h1>
                </Link>
            </div>

            <div className="w-full overflow-hidden bg-white px-8 py-8 shadow-xl shadow-indigo-100/50 border border-gray-100 sm:max-w-md sm:rounded-2xl">
                {children}
            </div>

            <div className="mt-8 flex gap-6 text-xs text-gray-400 font-medium">
                <Link href={route('privacy')} className="hover:text-gray-600 transition-colors">Privacidade</Link>
                <Link href={route('security')} className="hover:text-gray-600 transition-colors">Segurança</Link>
                <span>© 2026 Zivra</span>
            </div>
        </div>
    );
}
