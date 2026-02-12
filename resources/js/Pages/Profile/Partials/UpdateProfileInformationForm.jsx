import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}) {
    const user = usePage().props.auth.user;

    const { data, setData, post, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
            bio: user.bio || '',
            profile_photo: null,
            _method: 'PATCH',
        });

    const submit = (e) => {
        e.preventDefault();

        post(route('profile.update'), {
            forceFormData: true,
        });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-xl font-bold text-gray-900">
                    Editar Perfil
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                    Mantenha suas informações atualizadas para que seus seguidores conheçam você melhor.
                </p>
            </header>

            <form onSubmit={submit} className="mt-8 space-y-8" encType="multipart/form-data">
                <div className="flex flex-col items-center sm:flex-row sm:items-end gap-6">
                    <div className="relative group">
                        <div className="h-24 w-24 rounded-full p-0.5 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600">
                            <div className="h-full w-full rounded-full bg-white p-1">
                                {user.profile_photo_path ? (
                                    <img 
                                        src={`/Zivra/public/storage/${user.profile_photo_path}`} 
                                        alt={user.name} 
                                        className="h-full w-full rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center rounded-full bg-gray-100 text-gray-400">
                                        <svg className="h-14 w-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        </div>
                        <label 
                            htmlFor="profile_photo" 
                            className="absolute bottom-0 right-0 p-1.5 bg-indigo-600 rounded-full text-white cursor-pointer hover:bg-indigo-700 transition-colors shadow-lg"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <input
                                type="file"
                                id="profile_photo"
                                className="hidden"
                                onChange={(e) => setData('profile_photo', e.target.files[0])}
                            />
                        </label>
                    </div>
                    
                    <div className="flex-1 text-center sm:text-left">
                        <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                        <p className="text-sm text-gray-500">@{user.username}</p>
                        {data.profile_photo && (
                            <p className="mt-1 text-xs font-medium text-indigo-600">
                                Nova foto selecionada: {data.profile_photo.name}
                            </p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <InputLabel htmlFor="name" value="Nome Completo" />
                        <TextInput
                            id="name"
                            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg shadow-sm"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            autoComplete="name"
                        />
                        <InputError className="mt-2" message={errors.name} />
                    </div>

                    <div>
                        <InputLabel htmlFor="email" value="E-mail" />
                        <TextInput
                            id="email"
                            type="email"
                            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg shadow-sm"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            autoComplete="username"
                        />
                        <InputError className="mt-2" message={errors.email} />
                    </div>
                </div>

                <div>
                    <InputLabel htmlFor="bio" value="Biografia" />
                    <textarea
                        id="bio"
                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg shadow-sm min-h-[100px]"
                        value={data.bio}
                        onChange={(e) => setData('bio', e.target.value)}
                        placeholder="Conte um pouco sobre você..."
                    />
                    <InputError className="mt-2" message={errors.bio} />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
                        <p className="mt-2 text-sm text-gray-800">
                            Your email address is unverified.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                Click here to re-send the verification email.
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-medium text-green-600">
                                A new verification link has been sent to your
                                email address.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>Salvar</PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600">
                            Salvo com sucesso.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
