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
    router.replace('/');
  };

  useEffect(() => {
    socket.on(USER_EVENTS.USER_JOIN_REQUEST, (message: string) => {
      console.log(message);
    });

    socket.on(CHAT_EVENTS.CHAT_MESSAGE_RECEIVED, (message: Message) => {
      console.log(message);
      setMessages((prevMessages) => [...prevMessages, message]);
    });
  }, [socket]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const message = form.message.value;

    socket.emit(CHAT_EVENTS.CHAT_MESSAGE, message);

    form.reset();
    console.log(message);
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
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{message.message}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex-none">
          <form className="flex gap-2" onSubmit={handleSubmit}>
            <input type="text" name="message" placeholder="Message" className="w-full p-2 border-2 border-gray-300 rounded-md" />
            <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">Send</button>
          </form>
        </div>
      </div>
    </div>
  );
}
