'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function WorldChat() {
  const router = useRouter();

  const userName = sessionStorage.getItem('username');

  useEffect(() => {
    if (!userName) {
      router.replace('/');
    }
  }, [router, userName]);

  const handleLogout = () => {
    sessionStorage.clear();
    router.replace('/');
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const message = form.message.value;

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
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">John Doe</span>
              <span className="text-xs text-gray-500">12:00 PM</span>
            </div>
            <p className="text-sm">Hello, how are you?</p>
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
