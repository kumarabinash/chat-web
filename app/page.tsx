'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [username, setUsername] = useState('');
  const router = useRouter();

  const handleJoin = () => {
    if (username.trim()) {
      sessionStorage.setItem('username', username.trim());
      router.push('/world');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <input 
        type="text" 
        placeholder="Username" 
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="border-2 border-gray-300 rounded-md p-2" 
      />
      <button 
        onClick={handleJoin}
        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
      >
        Join World Chat
      </button>
    </div>
  );
}
