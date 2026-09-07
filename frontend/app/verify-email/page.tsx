'use client';

import Link from 'next/link';
import { useState } from 'react';
import { resendVerificationEmail, verifyEmail } from '../lib/api';

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<'success' | 'error' | 'idle'>('idle');
  const [message, setMessage] = useState('Enter the six-digit code sent to your email.');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('userId');

    if (!userId) {
      setStatus('error');
      setMessage('This verification request is incomplete or invalid.');
      return;
    }

    setVerifying(true);
    setStatus('idle');

    try {
      const result = await verifyEmail(userId, code);
      setStatus('success');
      setMessage(result.message || 'Your email has been verified.');
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Email verification failed.');
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResending(true);

    try {
      const result = await resendVerificationEmail(email);
      setMessage(result.message);
      setStatus('idle');
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Unable to resend verification email.');
    } finally {
      setResending(false);
    }
  };

  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-50 px-6 py-12">
      <section className="w-full max-w-xl rounded-lg bg-white px-8 py-10 text-center shadow-sm">
        <h1 className="text-2xl font-semibold">Email verification</h1>
        <p className={status === 'error' ? 'mt-4 text-red-700' : 'mt-4 text-gray-600'}>
          {message}
        </p>

        {status === 'success' && (
          <Link
            href="/login"
            className="mt-6 inline-block rounded-md bg-gradient-to-r from-purple-600 to-pink-500 px-5 py-2 font-semibold text-white"
          >
            Continue to login
          </Link>
        )}

        {status !== 'success' && (
          <form onSubmit={handleVerify} className="mt-8 flex flex-col gap-3 text-left">
            <label htmlFor="verification-code" className="text-sm font-medium text-gray-700">
              Verification code
            </label>
            <input
              id="verification-code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
              required
              placeholder="000000"
              disabled={verifying}
              className="rounded-md border border-gray-300 px-4 py-2 text-center text-xl tracking-[0.4em] focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
            />
            <button
              type="submit"
              disabled={verifying || code.length !== 6}
              className="rounded-md bg-gray-900 px-4 py-2 font-semibold text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {verifying ? 'Checking...' : 'Verify email'}
            </button>
          </form>
        )}

        {status !== 'success' && (
          <form onSubmit={handleResend} className="mt-8 flex flex-col gap-3 text-left">
            <label htmlFor="verification-email" className="text-sm font-medium text-gray-700">
              Request a new verification email
            </label>
            <input
              id="verification-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              placeholder="Email address"
              disabled={resending}
              className="rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
            />
            <button
              type="submit"
              disabled={resending}
              className="rounded-md bg-gray-900 px-4 py-2 font-semibold text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {resending ? 'Sending...' : 'Resend verification email'}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
