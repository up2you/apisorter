import { getProviders, getSession, signIn } from 'next-auth/react';
import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FormEvent, useState } from 'react';

type SignInPageProps = {
  providers: Record<string, any> | null;
};

export default function SignInPage({ providers }: SignInPageProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    typeof router.query.error === 'string' ? router.query.error : null,
  );

  const handleCredentialsSignIn = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
      callbackUrl: (router.query.callbackUrl as string) || '/',
    });

    setLoading(false);

    if (result?.error) {
      setErrorMessage(result.error);
      return;
    }

    if (result?.url) {
      router.push(result.url);
    }
  };

  return (
    <>
      <Head>
        <title>Sign in — API Sorter</title>
      </Head>
      <main className="container-max flex min-h-[70vh] flex-col items-center justify-center">
        <div className="card w-full max-w-md p-8">
          <h1 className="text-2xl font-semibold text-white">Welcome back</h1>
          <p className="mt-2 text-sm text-gray-400">Sign in to continue exploring APIs.</p>

          <form onSubmit={handleCredentialsSignIn} className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-200">Email</label>
              <input
                type="email"
                className="input mt-2"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@example.com"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-200">Password</label>
              <input
                type="password"
                className="input mt-2"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            {errorMessage && <p className="text-sm text-red-400">{errorMessage}</p>}
            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="mt-4 flex justify-between text-sm text-gray-400">
            <Link href="/auth/forgot-password" className="hover:text-white">
              Forgot password?
            </Link>
            <Link href="/auth/signup" className="hover:text-white">
              Create account
            </Link>
          </div>

          <div className="mt-6 text-center text-sm text-gray-400">
            <Link href="/" className="btn btn-ghost">
              ← Back to homepage
            </Link>
          </div>

          {providers && (
            <div className="mt-8">
              <div className="divider mb-4" />
              <p className="text-sm font-medium uppercase tracking-widest text-gray-400">Continue with</p>
              <div className="mt-4 space-y-3">
                {Object.values(providers)
                  .filter((provider) => provider.id !== 'credentials')
                  .map((provider) => (
                    <button
                      key={provider.name}
                      onClick={() =>
                        signIn(
                          provider.id,
                          { callbackUrl: (router.query.callbackUrl as string) || '/' },
                          provider.id === 'google' ? { prompt: 'select_account' } : undefined
                        )
                      }
                      className="btn btn-secondary w-full"
                      type="button"
                    >
                      {provider.id === 'google' ? 'Sign in with Google' : provider.name}
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<SignInPageProps> = async (context) => {
  const session = await getSession(context);
  if (session) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  const providers = await getProviders();

  return {
    props: {
      providers: providers ?? null,
    },
  };
};

