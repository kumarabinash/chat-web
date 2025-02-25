'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useChat } from '@/hooks/use-chat.hook';

export default function WorldChat() {
    const router = useRouter();
    const userName = sessionStorage.getItem('username');
    const [message, setMessage] = useState('');
    const { isConnected,messages, sendMessage, disconnect } = useChat(userName);

    useEffect(() => {
        if (!userName) {
            router.replace('/');
        }
    }, [router, userName]);

    const handleLogout = () => {
        sessionStorage.clear();
        disconnect();
        router.replace('/');
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        sendMessage(message);
        setMessage('');
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const getAvatar = (sender: string | null) => {
        const number = sender ? sender.charCodeAt(0) % 100 : 0;
        return `https://avatar.iran.liara.run/public/${number}`;
    };

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">
                    Welcome, {userName}!
                </h1>
                <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                >
                    Logout
                </button>
            </div>
            <div className="flex flex-col h-[calc(100vh-100px)] border border-gray-300 rounded-md p-4">
                <div className="flex-1 overflow-y-auto">
                    <div className="flex flex-col gap-2">
                        {messages.map((message, index) => (
                            <div className="flex items-start gap-2.5" key={index}>
                                <img src={getAvatar(message.sender)} alt="avatar" className="w-8 h-8 rounded-full" />
                                <div className="flex flex-col w-full leading-1.5 p-4 border-gray-200 bg-gray-100 rounded-e-xl rounded-es-xl dark:bg-gray-700">
                                    <div className="flex items-center w-full justify-between">
                                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{message.sender === userName ? 'You' : message.sender}</span>
                                        <span className="text-sm font-normal text-gray-500 dark:text-gray-400">{formatDate(message.timestamp)}</span>
                                    </div>
                                    <p className="text-sm font-normal py-2.5 text-gray-900 dark:text-white">{message.message}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex-none">
                    <form className="flex gap-2" onSubmit={handleSubmit}>
                        <div className="flex items-center gap-2">
                            <img src={getAvatar(userName)} alt="avatar" className="w-10 h-10 rounded-full" />
                        </div>
                        <input value={message} onChange={(e) => setMessage(e.target.value)} type="text" name="message" placeholder="Message" className="w-full p-2 border-2 border-gray-300 rounded-md" />
                        <button disabled={!isConnected || !message} type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed">Send</button>
                    </form>
                </div>
            </div>
        </div>
    );
}
