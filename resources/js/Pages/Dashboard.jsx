import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link, usePage, router } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import InputError from '@/Components/InputError';
import { useRef, useState } from 'react';

export default function Dashboard({ posts }) {
    const user = usePage().props.auth.user;
    const fileInput = useRef();
    const [commentingPostId, setCommentingPostId] = useState(null);

    const { data, setData, post, processing, reset, errors } = useForm({
        content: '',
        media: null,
    });

    const { data: commentData, setData: setCommentData, post: postComment, processing: commentProcessing, reset: resetComment } = useForm({
        content: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('posts.store'), { 
            onSuccess: () => {
                reset();
                fileInput.current.value = '';
            },
            forceFormData: true,
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

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Feed da Zivra
                </h2>
            }
        >
            <Head title="Feed • Zivra" />

            <div className="py-8">
                <div className="mx-auto max-w-[600px] sm:px-6 lg:px-8">
                    {/* Criar Post */}
                    <div className="mb-8 overflow-hidden bg-white border border-gray-200 rounded-xl">
                        <div className="p-4">
                            <form onSubmit={submit} encType="multipart/form-data">
                                <div className="flex gap-3">
                                    {user.profile_photo_path ? (
                                        <img src={`/Zivra/public/storage/${user.profile_photo_path}`} className="h-10 w-10 rounded-full object-cover" />
                                    ) : (
                                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                                            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                                        </div>
                                    )}
                                    <textarea
                                        value={data.content}
                                        placeholder="O que você está pensando?"
                                        className="block w-full border-none focus:ring-0 text-lg placeholder-gray-400 resize-none p-0 pt-2"
                                        rows="2"
                                        onChange={e => setData('content', e.target.value)}
                                    ></textarea>
                                </div>
                                <InputError message={errors.content} className="mt-2" />
                                
                                <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                                    <div className="flex gap-4">
                                        <label className="cursor-pointer text-indigo-500 hover:text-indigo-600 transition-colors">
                                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <input
                                                type="file"
                                                ref={fileInput}
                                                className="hidden"
                                                onChange={e => setData('media', e.target.files[0])}
                                                accept="image/*,video/*"
                                            />
                                        </label>
                                    </div>
                                    <PrimaryButton 
                                        className="!rounded-full !bg-gradient-to-r !from-indigo-600 !to-violet-600 hover:!from-indigo-700 hover:!to-violet-700 !px-6 !py-2 !text-sm !font-bold !normal-case !tracking-normal !border-0" 
                                        disabled={processing || !data.content.trim()}
                                    >
                                        Publicar
                                    </PrimaryButton>
                                </div>
                                {data.media && (
                                    <div className="mt-2 text-xs text-indigo-600 font-medium flex items-center gap-1">
                                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                                        Mídia selecionada: {data.media.name}
                                    </div>
                                )}
                                <InputError message={errors.media} className="mt-2" />
                            </form>
                        </div>
                    </div>

                    {/* Lista de Posts */}
                    <div className="space-y-8">
                        {posts.map(post => (
                            <div key={post.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                {/* Header do Post */}
                                <div className="p-3 flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <Link href={route('profile.show', post.user.username)} className="flex-shrink-0">
                                            {post.user.profile_photo_path ? (
                                                <img src={`/Zivra/public/storage/${post.user.profile_photo_path}`} className="h-8 w-8 rounded-full object-cover" />
                                            ) : (
                                                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                                                </div>
                                            )}
                                        </Link>
                                        <div>
                                            <Link href={route('profile.show', post.user.username)} className="text-sm font-bold text-gray-900 hover:underline">
                                                {post.user.username}
                                            </Link>
                                            <div className="text-[10px] text-gray-400 uppercase tracking-tight font-medium">
                                                {new Date(post.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <button className="text-gray-400 hover:text-gray-600">
                                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
                                    </button>
                                </div>

                                {/* Mídia do Post */}
                                {post.media_path && (
                                    <div className="aspect-square bg-black flex items-center justify-center overflow-hidden">
                                        {post.media_type === 'image' ? (
                                            <img 
                                                src={`/Zivra/public/storage/${post.media_path}`} 
                                                alt="" 
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <video 
                                                src={`/Zivra/public/storage/${post.media_path}`} 
                                                controls 
                                                className="w-full h-full object-contain"
                                            />
                                        )}
                                    </div>
                                )}

                                {/* Ações do Post */}
                                <div className="p-3">
                                    <div className="flex items-center gap-4 mb-3">
                                        <button 
                                            onClick={() => toggleLike(post.id)}
                                            className={`transition-colors ${post.is_liked ? 'text-red-500' : 'text-gray-700 hover:text-red-500'}`}
                                        >
                                            {post.is_liked ? (
                                                <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                                            ) : (
                                                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                                            )}
                                        </button>
                                        <button 
                                            onClick={() => setCommentingPostId(commentingPostId === post.id ? null : post.id)}
                                            className="text-gray-700 hover:text-indigo-500 transition-colors"
                                        >
                                            <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                                        </button>
                                        <button className="text-gray-700 hover:text-indigo-500 transition-colors">
                                            <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
                                        </button>
                                    </div>
                                    
                                    <div className="space-y-1">
                                        <div className="text-sm font-bold text-gray-900">{post.likes_count} curtidas</div>
                                        <div className="text-sm text-gray-800 leading-snug">
                                            <Link href={route('profile.show', post.user.username)} className="font-bold mr-2 hover:underline">
                                                {post.user.username}
                                            </Link>
                                            {post.content}
                                        </div>
                                        {post.comments_count > 0 && (
                                            <button className="text-sm text-gray-400 font-medium">Ver todos os {post.comments_count} comentários</button>
                                        )}

                                        {/* Lista de Comentários (exibir os últimos 2) */}
                                        <div className="mt-2 space-y-1">
                                            {post.comments.slice(-2).map(comment => (
                                                <div key={comment.id} className="text-sm">
                                                    <Link href={route('profile.show', comment.user.username)} className="font-bold mr-2 hover:underline text-gray-900">
                                                        {comment.user.username}
                                                    </Link>
                                                    <span className="text-gray-800">{comment.content}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Input de Comentário */}
                                        {commentingPostId === post.id && (
                                            <form onSubmit={(e) => submitComment(e, post.id)} className="mt-3 flex gap-2">
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
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
