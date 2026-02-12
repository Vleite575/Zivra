import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

export default function Index() {
    const [activeChat, setActiveChat] = useState(null);

    const chats = [
        { id: 1, name: 'Zivra Team', lastMessage: 'Bem-vindo ao Zivra Chat!', time: '12:45', online: true, photo: null },
        { id: 2, name: 'Vinícius Santana', lastMessage: 'O layout ficou sensacional!', time: 'Ontem', online: false, photo: null },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Mensagens" />

            <div className="flex h-[calc(100vh-64px)] bg-white overflow-hidden">
                {/* Sidebar de Conversas */}
                <div className="w-full md:w-80 lg:w-96 border-r border-gray-100 flex flex-col bg-gray-50/30">
                    <div className="p-6 border-b border-gray-100 bg-white">
                        <h2 className="text-xl font-black tracking-tight text-gray-900">Mensagens</h2>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {chats.map((chat) => (
                            <button
                                key={chat.id}
                                onClick={() => setActiveChat(chat)}
                                className={`w-full flex items-center gap-4 p-4 transition-all hover:bg-white border-b border-gray-50/50 ${
                                    activeChat?.id === chat.id ? 'bg-white border-l-4 border-l-indigo-600 shadow-sm' : 'border-l-4 border-l-transparent'
                                }`}
                            >
                                <div className="relative">
                                    <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold border border-indigo-50">
                                        {chat.name.charAt(0)}
                                    </div>
                                    {chat.online && (
                                        <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
                                    )}
                                </div>
                                <div className="flex-1 text-left min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h4 className="font-bold text-gray-900 truncate">{chat.name}</h4>
                                        <span className="text-[10px] text-gray-400 font-medium uppercase">{chat.time}</span>
                                    </div>
                                    <p className="text-sm text-gray-500 truncate leading-tight">{chat.lastMessage}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Área da Mensagem */}
                <div className="hidden md:flex flex-1 flex-col bg-white">
                    {activeChat ? (
                        <>
                            {/* Header do Chat */}
                            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-sm sticky top-0 z-10">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold border border-indigo-50">
                                        {activeChat.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">{activeChat.name}</h4>
                                        <p className="text-xs text-green-500 font-medium">{activeChat.online ? 'Online agora' : 'Offline'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button className="text-gray-400 hover:text-indigo-600 transition-colors">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                                    </button>
                                    <button className="text-gray-400 hover:text-indigo-600 transition-colors">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                                    </button>
                                </div>
                            </div>

                            {/* Mensagens */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30">
                                <div className="flex justify-center my-4">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-white px-3 py-1 rounded-full border border-gray-100 shadow-sm">Hoje</span>
                                </div>
                                
                                <div className="flex flex-col space-y-2 max-w-[70%]">
                                    <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-none shadow-sm text-sm text-gray-800 leading-relaxed">
                                        {activeChat.lastMessage}
                                    </div>
                                    <span className="text-[10px] text-gray-400 font-medium px-1 uppercase">{activeChat.time}</span>
                                </div>

                                <div className="flex flex-col space-y-2 max-w-[70%] ml-auto items-end">
                                    <div className="bg-indigo-600 p-4 rounded-2xl rounded-tr-none shadow-lg shadow-indigo-100 text-sm text-white leading-relaxed font-medium">
                                        Oi! Como posso ajudar hoje?
                                    </div>
                                    <span className="text-[10px] text-gray-400 font-medium px-1 uppercase">12:46</span>
                                </div>
                            </div>

                            {/* Input de Mensagem */}
                            <div className="p-6 bg-white border-t border-gray-100">
                                <form className="flex items-center gap-4 bg-gray-50 rounded-2xl p-2 pl-4 border border-gray-100 focus-within:border-indigo-300 focus-within:bg-white transition-all shadow-sm">
                                    <button type="button" className="text-gray-400 hover:text-indigo-600 transition-colors">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                    </button>
                                    <input 
                                        type="text" 
                                        placeholder="Escreva sua mensagem..." 
                                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-gray-800 placeholder:text-gray-400"
                                    />
                                    <button type="submit" className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 active:scale-95">
                                        <svg className="w-5 h-5 transform rotate-90" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                            <div className="h-24 w-24 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mb-6 shadow-inner">
                                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.808-1.232L7 20l1.232-4.808A8.963 8.963 0 014 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-2">Suas Mensagens</h3>
                            <p className="text-gray-500 max-w-xs">Selecione uma conversa ao lado para começar a bater papo com seus amigos no Zivra.</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
