import Head from 'next/head';
import Link from 'next/link';
import { FormEvent, useState } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch('/api/auth/request-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Unable to send reset email.');
      }

      setMessage('If the email exists, we have sent a reset link to your inbox.');
      setEmail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Reset password — API Sorter</title>
      </Head>
      <main className="container-max flex min-h-[70vh] flex-col items-center justify-center">
        <div className="card w-full max-w-md p-8">
          <h1 className="text-2xl font-semibold text-white">Reset your password</h1>
          <p className="mt-2 text-sm text-gray-400">Enter the email associated with your account.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-200">Email</label>
              <input
                type="email"
                className="input mt-2"
                placeholder="name@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            {message && <p className="text-sm text-green-400">{message}</p>}
            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
          </form>

          <p className="mt-4 text-sm text-gray-400">
            Remembered your password?{' '}
            <Link href="/auth/signin" className="text-accent hover:text-accent-light">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}



