import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { FormEvent, useState } from 'react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const token = typeof router.query.token === 'string' ? router.query.token : '';
  const email = typeof router.query.email === 'string' ? router.query.email : '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!token || !email) {
      setError('Invalid reset link.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Unable to reset password.');
      }
      setMessage('Password updated successfully. You can now sign in with your new password.');
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
        <title>Set new password — API Sorter</title>
      </Head>
      <main className="container-max flex min-h-[70vh] flex-col items-center justify-center">
        <div className="card w-full max-w-md p-8">
          <h1 className="text-2xl font-semibold text-white">Set a new password</h1>
          <p className="mt-2 text-sm text-gray-400">Choose a strong password for your account.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-200">New password</label>
              <input
                type="password"
                className="input mt-2"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-200">Confirm password</label>
              <input
                type="password"
                className="input mt-2"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            {message && <p className="text-sm text-green-400">{message}</p>}
            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? 'Updating…' : 'Update password'}
            </button>
          </form>

          <p className="mt-4 text-sm text-gray-400">
            Back to{' '}
            <Link href="/auth/signin" className="text-accent hover:text-accent-light">
              sign in
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}



