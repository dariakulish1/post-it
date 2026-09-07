'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      router.push('/posts');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans relative overflow-hidden min-h-screen">
      <div className="absolute top-[-180px] left-[-120px] rounded-full bg-[#7C3AED] opacity-35 blur-2xl z-0 w-[520px] h-[520px]"></div>
      <div className="absolute top-[-140px] right-[-80px] rounded-full bg-[#EC4899] opacity-35 blur-2xl z-0 w-[460px] h-[460px]"></div>
      <div className="absolute bottom-[-160px] left-[38%] rounded-full bg-[#0EA5E9] opacity-25 blur-3xl z-0 w-[460px] h-[460px]"></div>
      <main className="flex flex-1 w-full mx-auto max-w-8xl flex-col items-center justify-center px-10 sm:items-start z-10">
        <div className="flex w-full bg-white text-center rounded-lg max-w-xl mx-auto flex-col items-center justify-center py-8 px-10 sm:items-start z-10">
          <p className="text-lg font-semibold mb-6 w-full">Log in</p>

          {error && (
            <div className="w-full bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="w-full">
            <input
              type="email"
              name="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={loading}
              placeholder="Email"
              className="w-full border border-gray-300 rounded-md px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <input
              type="password"
              name="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={loading}
              placeholder="Password"
              className="w-full border border-gray-300 rounded-md px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold py-2 px-4 rounded-md hover:from-purple-700 hover:to-pink-600 transition-all duration-300 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          <p className="text-sm text-gray-600 mt-4">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-purple-600 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}