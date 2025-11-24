import Head from 'next/head';
import Link from 'next/link';
import { FormEvent, useState } from 'react';

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account.');
      }

      setMessage('Account created! Please check your email to verify your account.');
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Create account — API Sorter</title>
      </Head>
      <main className="container-max flex min-h-[70vh] flex-col items-center justify-center">
        <div className="card w-full max-w-md p-8">
          <h1 className="text-2xl font-semibold text-white">Create your account</h1>
          <p className="mt-2 text-sm text-gray-400">Start monitoring your favorite APIs in minutes.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-200">Name</label>
              <input
                type="text"
                className="input mt-2"
                placeholder="Your name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
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
            <div>
              <label className="text-sm font-medium text-gray-200">Password</label>
              <input
                type="password"
                className="input mt-2"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-200">Confirm Password</label>
              <input
                type="password"
                className="input mt-2"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            {message && <p className="text-sm text-green-400">{message}</p>}
            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="mt-4 text-sm text-gray-400">
            Already have an account?{' '}
            <Link href="/auth/signin" className="text-accent hover:text-accent-light">
              Sign in
            </Link>
          </p>

          <div className="mt-6 text-center text-sm text-gray-400">
            <Link href="/" className="btn btn-ghost">
              ← Back to homepage
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}

