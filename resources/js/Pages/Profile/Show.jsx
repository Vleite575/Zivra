import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, usePage, router, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import Modal from '@/Components/Modal';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function Show({ user, posts, isOwnProfile, isFollowing, hasRequestedToFollow, hasPendingRequestFrom, canSeeContent, initialPost }) {
    const authUser = usePage().props.auth.user;
    const [selectedPost, setSelectedPost] = useState(initialPost || null);
    const [commentingPostId, setCommentingPostId] = useState(null);
    const [showFollowersModal, setShowFollowersModal] = useState(false);
    const [showFollowingModal, setShowFollowingModal] = useState(false);
    const [followersList, setFollowersList] = useState([]);
    const [followingList, setFollowingList] = useState([]);
    const [followersSort, setFollowersSort] = useState('newest');
    const [followingSort, setFollowingSort] = useState('newest');
    const [loadingFollowers, setLoadingFollowers] = useState(false);
    const [loadingFollowing, setLoadingFollowing] = useState(false);

    const fetchFollowers = async (sort = followersSort) => {
        setLoadingFollowers(true);
        try {
            const response = await fetch(route('profile.followers', { username: user.username, sort }));
            if (response.ok) {
                const data = await response.json();
                setFollowersList(data);
            }
        } catch (error) {
            console.error('Error fetching followers:', error);
        } finally {
            setLoadingFollowers(false);
        }
    };

    const fetchFollowing = async (sort = followingSort) => {
        setLoadingFollowing(true);
        try {
            const response = await fetch(route('profile.following', { username: user.username, sort }));
            if (response.ok) {
                const data = await response.json();
                setFollowingList(data);
            }
        } catch (error) {
            console.error('Error fetching following:', error);
        } finally {
            setLoadingFollowing(false);
        }
    };

    const handleOpenFollowers = () => {
        if (!canSeeContent) return;
        setShowFollowersModal(true);
        fetchFollowers();
    };

    const handleOpenFollowing = () => {
        if (!canSeeContent) return;
        setShowFollowingModal(true);
        fetchFollowing();
    };

    const handleSortFollowers = (sort) => {
        setFollowersSort(sort);
        fetchFollowers(sort);
    };

    const handleSortFollowing = (sort) => {
        setFollowingSort(sort);
        fetchFollowing(sort);
    };

    // Sincronizar post selecionado com as props quando houver atualizações (curtidas/comentários)
    useEffect(() => {
        if (selectedPost) {
            const updatedPost = posts.find(p => p.id === selectedPost.id);
            if (updatedPost) {
                setSelectedPost(updatedPost);
            }
        }
    }, [posts]);

    // Se o initialPost mudar (ex: navegação via histórico), atualizar o selectedPost
    useEffect(() => {
        if (initialPost) {
            setSelectedPost(initialPost);
        }
    }, [initialPost]);

    const { data: commentData, setData: setCommentData, post: postComment, processing: commentProcessing, reset: resetComment } = useForm({
        content: '',
    });

    const Layout = authUser ? AuthenticatedLayout : ({ children }) => (
        <div className="min-h-screen bg-white">
            <nav className="border-b border-gray-100 bg-white sticky top-0 z-50">
                <div className="mx-auto max-w-[1200px] px-4 h-16 flex items-center justify-between">
                    <Link href={route('welcome')} className="flex items-center gap-2">
                        <ApplicationLogo className="h-8 w-auto" />
                        <span className="text-xl font-black tracking-tighter text-gray-900">Zivra</span>
                    </Link>
                    <div className="flex items-center gap-2 md:gap-4">
                        <Link href={route('login')} className="text-sm font-bold text-gray-900 hover:opacity-70 transition-opacity px-2">Entrar</Link>
                        <Link href={route('register')} className="rounded-lg bg-indigo-500 px-3 md:px-4 py-1.5 text-xs md:text-sm font-bold text-white hover:bg-indigo-600 transition-all shadow-md shadow-indigo-100">Cadastrar</Link>
                    </div>
                </div>
            </nav>
            <div className="w-full">
                {children}
            </div>
            <footer className="border-t border-gray-100 py-12 mt-12 bg-gray-50">
                <div className="mx-auto max-w-[1200px] px-4 text-center">
                    <p className="text-sm text-gray-400">© 2026 Zivra. Todos os direitos reservados.</p>
                </div>
            </footer>
        </div>
    );

    const handleFollow = () => {
        router.post(route('follow.store', user.id), {}, {
            preserveScroll: true,
        });
    };

    const handleUnfollow = () => {
        router.delete(route('follow.destroy', user.id), {
            preserveScroll: true,
        });
    };

    const handleAccept = () => {
        router.post(route('follow.accept', user.id), {}, {
            preserveScroll: true,
        });
    };

    const handleReject = () => {
        router.delete(route('follow.reject', user.id), {
            preserveScroll: true,
        });
    };

    const toggleLike = (postId) => {
        router.post(route('posts.like', postId), {}, {
            preserveScroll: true,
        });
    };

    const submitComment = (e, postId) => {
        e.preventDefault();
        postComment(route('comments.store', postId), {
            preserveScroll: true,
            onSuccess: () => {
                resetComment();
                setCommentingPostId(null);
            },
        });
    };

    const openPost = (post) => {
        setSelectedPost(post);
        // Atualizar URL sem recarregar para dar a sensação de URL dinâmica
        const newUrl = route('profile.show.post', { username: user.username, postId: post.id });
        window.history.pushState({ postId: post.id }, '', newUrl);
    };

    const closePost = () => {
        setSelectedPost(null);
        // Voltar para a URL do perfil
        window.history.pushState({}, '', route('profile.show', { username: user.username }));
    };

    // Navegação entre posts no modal
    const navigatePost = (direction) => {
        const currentIndex = posts.findIndex(p => p.id === selectedPost.id);
        let nextIndex = currentIndex + direction;
        
        if (nextIndex < 0) nextIndex = posts.length - 1;
        if (nextIndex >= posts.length) nextIndex = 0;
        
        openPost(posts[nextIndex]);
    };

    return (
        <Layout>
            <Head title={`${user.name} (@${user.username}) • Zivra`} />

            <div className="mx-auto w-full max-w-[1200px] px-4 py-4 md:py-8">
                {/* Header do Perfil Estilo Instagram Moderno */}
                <header className="mb-12 flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-24 px-4">
                    <div className="flex-shrink-0 relative group">
                        {user.profile_photo_path ? (
                            <div className="p-1 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 transition-transform duration-300 group-hover:scale-105">
                                <img 
                                    src={`/Zivra/public/storage/${user.profile_photo_path}`} 
                                    alt={user.name} 
                                    className="h-28 w-28 md:h-44 md:w-44 rounded-full border-4 border-white object-cover"
                                />
                            </div>
                        ) : (
                            <div className="h-28 w-28 md:h-44 md:w-44 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 border border-gray-100 transition-transform duration-300 group-hover:scale-105">
                                <svg className="h-20 w-20 md:h-28 md:w-28" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                </svg>
                            </div>
                        )}
                    </div>

                    <div className="flex-grow text-center md:text-left pt-2">
                        <div className="mb-6 flex flex-col md:flex-row items-center gap-6">
                            <h2 className="text-2xl font-light text-gray-800 tracking-tight">{user.username}</h2>
                            <div className="flex gap-2">
                                {isOwnProfile ? (
                                    <>
                                        <Link
                                            href={route('profile.edit')}
                                            className="rounded-lg bg-gray-100 px-5 py-1.5 text-sm font-semibold text-gray-900 hover:bg-gray-200 transition-all active:scale-95"
                                        >
                                            Editar perfil
                                        </Link>
                                        <button className="p-1.5 text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </button>
                                    </>
                                ) : authUser ? (
                                    <>
                                        {hasPendingRequestFrom ? (
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={handleAccept}
                                                    className="rounded-lg bg-indigo-500 px-6 py-1.5 text-sm font-semibold text-white hover:bg-indigo-600 shadow-md shadow-indigo-100 transition-all active:scale-95"
                                                >
                                                    Aceitar
                                                </button>
                                                <button 
                                                    onClick={handleReject}
                                                    className="rounded-lg bg-gray-100 px-6 py-1.5 text-sm font-semibold text-gray-900 hover:bg-gray-200 transition-all active:scale-95"
                                                >
                                                    Excluir
                                                </button>
                                            </div>
                                        ) : isFollowing ? (
                                            <button 
                                                onClick={handleUnfollow}
                                                className="rounded-lg bg-gray-100 px-6 py-1.5 text-sm font-semibold text-gray-900 hover:bg-gray-200 transition-all active:scale-95"
                                            >
                                                Seguindo
                                            </button>
                                        ) : hasRequestedToFollow ? (
                                            <button 
                                                onClick={handleUnfollow}
                                                className="rounded-lg bg-gray-100 px-6 py-1.5 text-sm font-semibold text-gray-900 hover:bg-gray-200 transition-all active:scale-95"
                                            >
                                                Solicitado
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={handleFollow}
                                                className="rounded-lg bg-indigo-500 px-6 py-1.5 text-sm font-semibold text-white hover:bg-indigo-600 shadow-md shadow-indigo-100 transition-all active:scale-95"
                                            >
                                                {user.is_public ? 'Seguir' : 'Solicitar'}
                                            </button>
                                        )}
                                        <button className="rounded-lg bg-gray-100 px-6 py-1.5 text-sm font-semibold text-gray-900 hover:bg-gray-200 transition-all active:scale-95">
                                            Mensagem
                                        </button>
                                    </>
                                ) : (
                                     <div className="flex gap-2">
                                        <Link
                                             href={route('login', { redirect: window.location.href })}
                                             className="rounded-lg bg-indigo-500 px-6 py-1.5 text-sm font-semibold text-white hover:bg-indigo-600 shadow-md shadow-indigo-100 transition-all active:scale-95"
                                         >
                                             Seguir
                                         </Link>
                                    </div>
                                 )}
                             </div>
                         </div>
 
                         <div className="mb-6 flex justify-center md:justify-start gap-4 md:gap-12 text-gray-700">
                            <div className="flex flex-col md:flex-row items-center gap-1">
                                <span className="font-bold text-gray-900 text-base md:text-lg">{user.posts_count}</span> 
                                <span className="text-xs md:text-sm">publicações</span>
                            </div>
                            <div 
                                onClick={handleOpenFollowers}
                                className={`flex flex-col md:flex-row items-center gap-1 transition-all ${canSeeContent ? 'cursor-pointer hover:opacity-70 active:scale-95' : 'cursor-not-allowed opacity-50'}`}
                                title={!canSeeContent ? 'Este perfil é privado' : ''}
                            >
                                <span className="font-bold text-gray-900 text-base md:text-lg">{user.followers_count}</span> 
                                <span className="text-xs md:text-sm">seguidores</span>
                            </div>
                            <div 
                                onClick={handleOpenFollowing}
                                className={`flex flex-col md:flex-row items-center gap-1 transition-all ${canSeeContent ? 'cursor-pointer hover:opacity-70 active:scale-95' : 'cursor-not-allowed opacity-50'}`}
                                title={!canSeeContent ? 'Este perfil é privado' : ''}
                            >
                                <span className="font-bold text-gray-900 text-base md:text-lg">{user.following_count}</span> 
                                <span className="text-xs md:text-sm">seguindo</span>
                            </div>
                        </div>

                        <div className="max-w-md">
                            <h1 className="font-bold text-gray-900 text-lg mb-1">{user.name}</h1>
                            {user.bio && (
                                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                                    {user.bio}
                                </p>
                            )}
                        </div>
                    </div>
                </header>

                {/* Tabs de navegação estilo IG */}
                <div className="border-t border-gray-100">
                    <div className="flex justify-center">
                        <button className="flex items-center gap-2 border-t-2 border-gray-900 -mt-[1px] py-4 text-[13px] font-bold uppercase tracking-[2px] text-gray-900">
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                            Publicações
                        </button>
                    </div>
                </div>

                {/* Grid de Posts - Estilo Zivra */}
                {canSeeContent ? (
                    <div className="grid grid-cols-3 gap-1 md:gap-8 mt-6">
                        {posts.length > 0 ? (
                            posts.map(post => (
                                <div 
                                    key={post.id} 
                                    onClick={() => openPost(post)}
                                    className="group relative aspect-square overflow-hidden bg-gray-100 cursor-pointer rounded-xl shadow-sm transition-all duration-300 hover:shadow-lg border border-gray-100"
                                >
                                    {post.media_path ? (
                                        post.media_type === 'image' ? (
                                            <img 
                                                src={`/Zivra/public/storage/${post.media_path}`} 
                                                alt="" 
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="relative h-full w-full">
                                                <video 
                                                    src={`/Zivra/public/storage/${post.media_path}`} 
                                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                                <div className="absolute top-3 right-3 text-white drop-shadow-md">
                                                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M8 5v14l11-7z"/>
                                                    </svg>
                                                </div>
                                            </div>
                                        )
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center p-6 text-center text-base font-medium text-gray-700 bg-white border border-gray-50 italic overflow-hidden">
                                            <div className="line-clamp-6">
                                                "{post.content}"
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Overlay ao passar o mouse */}
                                    <div className="absolute inset-0 flex items-center justify-center bg-indigo-900/40 opacity-0 transition-all duration-200 group-hover:opacity-100">
                                        <div className="flex gap-8 text-white">
                                            <div className="flex items-center gap-2 font-bold text-lg">
                                                <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M12.1 18.55l-.1.1-.11-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5 18.5 5 20 6.5 20 8.5c0 2.89-3.14 5.74-7.9 10.05z" />
                                                </svg>
                                                {post.likes_count}
                                            </div>
                                            <div className="flex items-center gap-2 font-bold text-lg">
                                                <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M20.65 19.19l-1.38-1.37A12.35 12.35 0 0021 12a9 9 0 10-9 9 8.6 8.6 0 004.81-1.49l1.37 1.37a1 1 0 001.41 0 1 1 0 00.06-1.69zM12 19a7 7 0 117-7 7 7 0 01-7 7z" />
                                                </svg>
                                                {post.comments_count}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-3 py-24 text-center">
                                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border-[2.5px] border-indigo-500">
                                    <svg className="h-10 w-10 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-3xl font-black text-gray-900 tracking-tight">Ainda não há publicações</h3>
                                <p className="mt-2 text-gray-500">Quando houver publicações, elas aparecerão aqui.</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="mt-8 border border-gray-100 rounded-3xl p-12 bg-gray-50 text-center shadow-inner">
                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm">
                            <svg className="h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 mb-2">Esta conta é privada</h3>
                        <p className="text-gray-500 mb-6">Siga esta conta para ver suas fotos e vídeos.</p>
                        {!authUser && (
                            <Link 
                                href={route('login', { redirect: window.location.href })}
                                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
                            >
                                Fazer login para seguir
                            </Link>
                        )}
                    </div>
                )}
            </div>

            {/* Modal de Visualização do Post */}
            <Modal show={!!selectedPost} onClose={closePost} maxWidth="5xl">
                {selectedPost && (
                    <div className="flex flex-col md:flex-row h-full max-h-[90vh] overflow-hidden bg-white rounded-2xl relative">
                        {/* Botões de Navegação */}
                        <button 
                            onClick={(e) => { e.stopPropagation(); navigatePost(-1); }}
                            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/20 text-white hover:bg-black/40 transition-all md:-left-12"
                        >
                            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); navigatePost(1); }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/20 text-white hover:bg-black/40 transition-all md:-right-12"
                        >
                            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                        </button>

                        {/* Lado Esquerdo: Mídia */}
                        <div className="md:w-[60%] bg-black flex items-center justify-center relative min-h-[300px]">
                            {selectedPost.media_path ? (
                                selectedPost.media_type === 'image' ? (
                                    <img 
                                        src={`/Zivra/public/storage/${selectedPost.media_path}`} 
                                        alt="" 
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <video 
                                        src={`/Zivra/public/storage/${selectedPost.media_path}`} 
                                        controls 
                                        className="w-full h-full object-contain"
                                    />
                                )
                            ) : (
                                <div className="p-12 text-center text-2xl font-medium text-white italic">
                                    "{selectedPost.content}"
                                </div>
                            )}
                        </div>

                        {/* Lado Direito: Info e Comentários */}
                        <div className="md:w-[40%] flex flex-col bg-white border-l border-gray-100 min-h-[400px]">
                            {/* Header do Post no Modal */}
                            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Link href={route('profile.show', selectedPost.user.username)}>
                                        {selectedPost.user.profile_photo_path ? (
                                            <img src={`/Zivra/public/storage/${selectedPost.user.profile_photo_path}`} className="h-8 w-8 rounded-full object-cover" />
                                        ) : (
                                            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                                            </div>
                                        )}
                                    </Link>
                                    <Link href={route('profile.show', selectedPost.user.username)} className="text-sm font-bold text-gray-900 hover:underline">
                                        {selectedPost.user.username}
                                    </Link>
                                </div>
                                <button onClick={closePost} className="text-gray-400 hover:text-gray-600">
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                                </button>
                            </div>

                            {/* Conteúdo e Comentários */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                                <div className="flex gap-3">
                                    <div className="h-8 w-8 rounded-full bg-gray-100 flex-shrink-0">
                                        {selectedPost.user.profile_photo_path ? (
                                            <img src={`/Zivra/public/storage/${selectedPost.user.profile_photo_path}`} className="h-full w-full rounded-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <span className="font-bold text-sm text-gray-900 mr-2">{selectedPost.user.username}</span>
                                        <span className="text-sm text-gray-800 leading-snug">{selectedPost.content}</span>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-gray-50">
                                    {selectedPost.comments && selectedPost.comments.length > 0 ? (
                                        selectedPost.comments.map(comment => (
                                            <div key={comment.id} className="flex gap-3">
                                                <div className="h-8 w-8 rounded-full bg-gray-100 flex-shrink-0">
                                                    {comment.user.profile_photo_path ? (
                                                        <img src={`/Zivra/public/storage/${comment.user.profile_photo_path}`} className="h-full w-full rounded-full object-cover" />
                                                    ) : (
                                                        <div className="h-full w-full rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                                                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <span className="font-bold text-sm text-gray-900 mr-2">{comment.user.username}</span>
                                                    <span className="text-sm text-gray-800">{comment.content}</span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-8 text-center text-sm text-gray-400">
                                            Nenhum comentário ainda.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Footer do Modal: Ações e Input */}
                            <div className="p-4 border-t border-gray-100 space-y-2">
                                <div className="flex items-center gap-4">
                                    <button 
                                        onClick={() => toggleLike(selectedPost.id)}
                                        className={`transition-all active:scale-125 ${selectedPost.is_liked ? 'text-red-500' : 'text-gray-700 hover:text-red-500'}`}
                                    >
                                        {selectedPost.is_liked ? (
                                            <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                                        ) : (
                                            <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                                        )}
                                    </button>
                                    <button className="text-gray-700 hover:text-indigo-500 transition-colors">
                                        <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                                    </button>
                                </div>
                                <div className="text-sm font-bold text-gray-900">{selectedPost.likes_count} curtidas</div>
                                <div className="text-[10px] text-gray-400 uppercase font-medium tracking-tight">
                                    {new Date(selectedPost.created_at).toLocaleDateString()}
                                </div>
                                
                                <form onSubmit={(e) => submitComment(e, selectedPost.id)} className="mt-2 flex gap-2 border-t border-gray-50 pt-3">
                                    <input 
                                        type="text" 
                                        value={commentData.content}
                                        onChange={e => setCommentData('content', e.target.value)}
                                        placeholder="Adicione um comentário..."
                                        className="flex-1 border-none focus:ring-0 text-sm p-0 bg-transparent"
                                    />
                                    <button 
                                        disabled={commentProcessing || !commentData.content.trim()}
                                        className="text-indigo-500 font-bold text-sm disabled:opacity-50"
                                    >
                                        Publicar
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
            {/* Modal de Seguidores */}
            <Modal show={showFollowersModal} onClose={() => setShowFollowersModal(false)} maxWidth="md">
                <div className="bg-white rounded-2xl overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900">Seguidores</h3>
                        <button onClick={() => setShowFollowersModal(false)} className="text-gray-400 hover:text-gray-600">
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                    </div>

                    {isOwnProfile && (
                        <div className="px-4 py-2 bg-gray-50 flex gap-2 border-b border-gray-100">
                            <button 
                                onClick={() => handleSortFollowers('newest')}
                                className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all ${followersSort === 'newest' ? 'bg-indigo-500 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                            >
                                Mais recentes
                            </button>
                            <button 
                                onClick={() => handleSortFollowers('oldest')}
                                className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all ${followersSort === 'oldest' ? 'bg-indigo-500 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                            >
                                Mais antigos
                            </button>
                        </div>
                    )}

                    <div className="max-h-[400px] overflow-y-auto p-4 space-y-4">
                        {loadingFollowers ? (
                            <div className="py-8 flex justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                            </div>
                        ) : followersList.length > 0 ? (
                            followersList.map((f) => (
                                <div key={f.id} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <Link href={route('profile.show', f.username)} className="flex-shrink-0">
                                            {f.profile_photo_path ? (
                                                <img src={`/Zivra/public/storage/${f.profile_photo_path}`} className="h-10 w-10 rounded-full object-cover border border-gray-100" />
                                            ) : (
                                                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-100">
                                                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                                                </div>
                                            )}
                                        </Link>
                                        <div className="flex flex-col">
                                            <Link href={route('profile.show', f.username)} className="text-sm font-bold text-gray-900 hover:underline leading-tight">
                                                {f.username}
                                            </Link>
                                            <span className="text-xs text-gray-500 leading-tight">{f.name}</span>
                                        </div>
                                    </div>
                                    <Link 
                                        href={route('profile.show', f.username)}
                                        className="text-xs font-bold text-indigo-600 hover:text-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        Ver perfil
                                    </Link>
                                </div>
                            ))
                        ) : (
                            <div className="py-8 text-center text-gray-500 text-sm">
                                Nenhum seguidor encontrado.
                            </div>
                        )}
                    </div>
                </div>
            </Modal>

            {/* Modal de Seguindo */}
            <Modal show={showFollowingModal} onClose={() => setShowFollowingModal(false)} maxWidth="md">
                <div className="bg-white rounded-2xl overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900">Seguindo</h3>
                        <button onClick={() => setShowFollowingModal(false)} className="text-gray-400 hover:text-gray-600">
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                    </div>

                    {isOwnProfile && (
                        <div className="px-4 py-2 bg-gray-50 flex gap-2 border-b border-gray-100">
                            <button 
                                onClick={() => handleSortFollowing('newest')}
                                className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all ${followingSort === 'newest' ? 'bg-indigo-500 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                            >
                                Mais recentes
                            </button>
                            <button 
                                onClick={() => handleSortFollowing('oldest')}
                                className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all ${followingSort === 'oldest' ? 'bg-indigo-500 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                            >
                                Mais antigos
                            </button>
                        </div>
                    )}

                    <div className="max-h-[400px] overflow-y-auto p-4 space-y-4">
                        {loadingFollowing ? (
                            <div className="py-8 flex justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                            </div>
                        ) : followingList.length > 0 ? (
                            followingList.map((f) => (
                                <div key={f.id} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <Link href={route('profile.show', f.username)} className="flex-shrink-0">
                                            {f.profile_photo_path ? (
                                                <img src={`/Zivra/public/storage/${f.profile_photo_path}`} className="h-10 w-10 rounded-full object-cover border border-gray-100" />
                                            ) : (
                                                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-100">
                                                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                                                </div>
                                            )}
                                        </Link>
                                        <div className="flex flex-col">
                                            <Link href={route('profile.show', f.username)} className="text-sm font-bold text-gray-900 hover:underline leading-tight">
                                                {f.username}
                                            </Link>
                                            <span className="text-xs text-gray-500 leading-tight">{f.name}</span>
                                        </div>
                                    </div>
                                    <Link 
                                        href={route('profile.show', f.username)}
                                        className="text-xs font-bold text-indigo-600 hover:text-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        Ver perfil
                                    </Link>
                                </div>
                            ))
                        ) : (
                            <div className="py-8 text-center text-gray-500 text-sm">
                                Não está seguindo ninguém.
                            </div>
                        )}
                    </div>
                </div>
            </Modal>
        </Layout>
    );
}
