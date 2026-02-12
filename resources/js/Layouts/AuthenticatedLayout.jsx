import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const pendingRequestsCount = usePage().props.auth.pending_requests_count || 0;

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    return (
        <div className="min-h-screen bg-white">
            <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex shrink-0 items-center">
                                <Link href={route('dashboard')}>
                                    <ApplicationLogo className="block h-8 w-auto" />
                                </Link>
                            </div>

                            <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                                <NavLink
                                    href={route('dashboard')}
                                    active={route().current('dashboard')}
                                >
                                    Início
                                </NavLink>
                                <NavLink
                                    href={route('messages.index')}
                                    active={route().current('messages.index')}
                                >
                                    Mensagens
                                </NavLink>
                            </div>
                        </div>

                        <div className="hidden sm:ms-6 sm:flex sm:items-center">
                            {/* Notification Bell Dropdown */}
                            <div className="relative">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button
                                            type="button"
                                            className="relative p-2 text-gray-400 hover:text-gray-500 transition-colors focus:outline-none"
                                        >
                                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                            </svg>
                                            {pendingRequestsCount > 0 && (
                                                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                                                    {pendingRequestsCount}
                                                </span>
                                            )}
                                        </button>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content width="64" contentClasses="py-1 bg-white overflow-hidden">
                                        <div className="px-4 py-2 border-b border-gray-100 bg-gray-50/50">
                                            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Notificações</h3>
                                        </div>
                                        
                                        {pendingRequestsCount > 0 ? (
                                            <Dropdown.Link href={route('profile.follow-requests')} className="flex items-center gap-3 py-3 border-b border-gray-50 hover:bg-indigo-50/30 transition-colors">
                                                <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                                    </svg>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-semibold text-gray-900">Solicitações de Seguimento</p>
                                                    <p className="text-xs text-indigo-600 font-medium mt-0.5">Você tem {pendingRequestsCount} {pendingRequestsCount === 1 ? 'nova solicitação' : 'novas solicitações'}</p>
                                                </div>
                                            </Dropdown.Link>
                                        ) : (
                                            <div className="px-4 py-8 text-center">
                                                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-300">
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                                    </svg>
                                                </div>
                                                <p className="text-sm text-gray-400 font-medium">Nenhuma notificação</p>
                                            </div>
                                        )}
                                        
                                        <div className="p-2 border-t border-gray-100 bg-gray-50/30">
                                            <Link href="#" className="block text-center text-xs font-bold text-indigo-600 hover:text-indigo-500 py-1">
                                                Ver tudo
                                            </Link>
                                        </div>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>

                            <div className="relative ms-3">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-500 transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none"
                                            >
                                                {user.profile_photo_path ? (
                                                    <img src={`/Zivra/public/storage/${user.profile_photo_path}`} className="h-8 w-8 rounded-full object-cover mr-2 border border-gray-100" />
                                                ) : (
                                                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center mr-2">
                                                        <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                                                    </div>
                                                )}
                                                <span className="font-semibold">{user.username}</span>

                                                <svg
                                                    className="-me-0.5 ms-2 h-4 w-4"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link
                                            href={route('profile.show', user.username)}
                                        >
                                            Perfil
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={route('profile.edit')}
                                        >
                                            Editar Perfil
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={route('profile.configurations')}
                                        >
                                            Configurações
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                        >
                                            Sair
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        <div className="-me-2 flex items-center sm:hidden">
                            {/* Mobile Notification Bell */}
                            <div className="relative mr-2">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button
                                            type="button"
                                            className="relative p-2 text-gray-400 hover:text-gray-500 transition-colors focus:outline-none"
                                        >
                                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                            </svg>
                                            {pendingRequestsCount > 0 && (
                                                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                                                    {pendingRequestsCount}
                                                </span>
                                            )}
                                        </button>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content width="64" align="right" contentClasses="py-1 bg-white overflow-hidden">
                                        <div className="px-4 py-2 border-b border-gray-100 bg-gray-50/50">
                                            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Notificações</h3>
                                        </div>
                                        
                                        {pendingRequestsCount > 0 ? (
                                            <Dropdown.Link href={route('profile.follow-requests')} className="flex items-center gap-3 py-3 border-b border-gray-50 hover:bg-indigo-50/30 transition-colors">
                                                <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                                    </svg>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-semibold text-gray-900">Solicitações</p>
                                                    <p className="text-xs text-indigo-600 font-medium mt-0.5">{pendingRequestsCount} {pendingRequestsCount === 1 ? 'nova' : 'novas'}</p>
                                                </div>
                                            </Dropdown.Link>
                                        ) : (
                                            <div className="px-4 py-8 text-center">
                                                <p className="text-sm text-gray-400 font-medium">Nenhuma notificação</p>
                                            </div>
                                        )}
                                        
                                        <div className="p-2 border-t border-gray-100 bg-gray-50/30">
                                            <Link href={route('profile.follow-requests')} className="block text-center text-xs font-bold text-indigo-600 hover:text-indigo-500 py-1">
                                                Ver tudo
                                            </Link>
                                        </div>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>

                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState,
                                    )
                                }
                                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-500 focus:bg-gray-100 focus:text-gray-500 focus:outline-none"
                            >
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        className={
                                            !showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={
                                            showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div
                    className={
                        (showingNavigationDropdown ? 'block' : 'hidden') +
                        ' sm:hidden'
                    }
                >
                    <div className="space-y-1 pb-3 pt-2">
                        <ResponsiveNavLink
                            href={route('dashboard')}
                            active={route().current('dashboard')}
                        >
                            Início
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route('messages.index')}
                            active={route().current('messages.index')}
                        >
                            Mensagens
                        </ResponsiveNavLink>
                    </div>

                    <div className="border-t border-gray-200 pb-1 pt-4">
                        <div className="px-4">
                            <div className="text-base font-medium text-gray-800">
                                {user.name}
                            </div>
                            <div className="text-sm font-medium text-gray-500">
                                {user.email}
                            </div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.show', user.username)}>
                                Perfil
                            </ResponsiveNavLink>
                            <ResponsiveNavLink href={route('profile.edit')}>
                                Editar Perfil
                            </ResponsiveNavLink>
                            <ResponsiveNavLink href={route('profile.configurations')}>
                                Configurações
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                method="post"
                                href={route('logout')}
                                as="button"
                            >
                                Sair
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-white border-b border-gray-100">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main className="bg-white">{children}</main>
        </div>
    );
}
