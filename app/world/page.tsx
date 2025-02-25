'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Socket, io } from 'socket.io-client';
import { CHAT_EVENTS, USER_EVENTS } from '@/types/event.enum';

const socket: Socket = io('http://localhost:3001');

interface Message {
    message: string;
    sender: string;
    timestamp: string;
    type: string; // chat or system
}

interface MessagePayload {
    message: Message;
    userName: string;
}

export default function WorldChat() {
    const router = useRouter();
    const userName = sessionStorage.getItem('username');
    const [isConnected, setIsConnected] = useState(false);

    const [messages, setMessages] = useState<Message[]>([]);

    useEffect(() => {
        socket.on('connect', () => {
            console.log('Connected to server');
            setIsConnected(true);
        });

        socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
            setIsConnected(false);
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from server');
            setIsConnected(false);
        });

        return () => {
            socket.off('connect');
            socket.off('connect_error');
            socket.off('disconnect');
        };
    }, []);

    useEffect(() => {
        if (!userName) {
            router.replace('/');
            return;
        }

        if (isConnected) {
            socket.emit(USER_EVENTS.USER_JOIN_REQUEST, userName);
        }
    }, [router, userName, isConnected]);

    const handleLogout = () => {
        sessionStorage.clear();
        socket.emit(USER_EVENTS.USER_DISCONNECT, userName);
        router.replace('/');
    };

    useEffect(() => {
        socket.on(USER_EVENTS.USER_JOIN_REQUEST, (message: string) => {
            console.log(message);
        });

        socket.on(CHAT_EVENTS.CHAT_MESSAGE_RECEIVED, (message: MessagePayload) => {
            console.log(message);
            setMessages((prevMessages) => [...prevMessages, message.message]);
        });

        socket.on(USER_EVENTS.USER_JOINED, (message: string) => {
            console.log(message);
        });

        return () => {
            socket.off(USER_EVENTS.USER_JOIN_REQUEST);
            socket.off(CHAT_EVENTS.CHAT_MESSAGE_RECEIVED);
            socket.off(USER_EVENTS.USER_JOINED);
        };
    }, [socket]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const form = e.target as HTMLFormElement;
        const message = form.message.value;

        socket.emit(CHAT_EVENTS.CHAT_MESSAGE, {
            message,
            sender: userName,
            timestamp: new Date().toISOString(),
            type: 'chat',
        });

        form.reset();
        console.log(message);
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
                        <input type="text" name="message" placeholder="Message" className="w-full p-2 border-2 border-gray-300 rounded-md" />
                        <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">Send</button>
                    </form>
                </div>
            </div>
        </div>
    );
}
