import { useEffect, useState } from 'react';
import { Socket, io } from 'socket.io-client';
import { CHAT_EVENTS, USER_EVENTS } from '@/types/event.enum';

interface Message {
    message: string;
    sender: string;
    timestamp: string;
    type: string;
}

interface MessagePayload {
    message: Message;
    userName: string;
}

export const useChat = (userName: string | null) => {
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [socket] = useState<Socket>(io('http://localhost:3001'));

    useEffect(() => {
        if (isConnected && userName) {
            socket.emit(USER_EVENTS.USER_JOIN_REQUEST, userName);
        }
    }, [userName, isConnected]);

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

        socket.on(CHAT_EVENTS.CHAT_MESSAGE_RECEIVED, (message: MessagePayload) => {
            console.log(message);
            setMessages((prevMessages) => [...prevMessages, message.message]);
        });

        return () => {
            socket.off('connect');
            socket.off('connect_error');
            socket.off('disconnect');
            socket.off(CHAT_EVENTS.CHAT_MESSAGE_RECEIVED);
        };
    }, []);

    const sendMessage = (message: string) => {
        socket.emit(CHAT_EVENTS.CHAT_MESSAGE, {
            message,
            sender: userName,
            timestamp: new Date().toISOString(),
            type: 'chat',
        });
    };

    const disconnect = () => {
        if (userName) {
            socket.emit(USER_EVENTS.USER_DISCONNECT, userName);
        }
    };

    return {
        isConnected,
        messages,
        sendMessage,
        disconnect
    };
};

