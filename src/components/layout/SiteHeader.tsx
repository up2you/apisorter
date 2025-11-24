import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { signOut, useSession } from 'next-auth/react';

const navItems = [
  { href: '/category/AI%20%26%20Machine%20Learning', label: 'AI APIs' },
  { href: '/category/Payments%20%26%20Finance', label: 'Payments' },
  { href: '/category/Maps%20%26%20Geolocation', label: 'Maps' },
];

export default function SiteHeader() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const { data: session, status } = useSession();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!query.trim()) return;
    router.push(`/category/all?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-midnight/80 border-b border-white/5">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center space-x-3">
          <img
            src="/images/logo.png"
            alt="API Sorter Logo"
            className="h-10 w-10 object-contain"
          />
          <div className="leading-tight">
            <span className="block text-lg font-semibold text-white">API Sorter</span>
            <span className="block text-xs text-gray-400">Discover • Compare • Monitor</span>
          </div>
        </Link>

        <nav className="hidden items-center space-x-6 text-sm font-medium text-gray-300 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center space-x-2 md:flex">
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search APIs"
              className="w-56 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-gray-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
            />
            <span className="pointer-events-none absolute right-3 top-2 text-sm text-gray-500">⌘K</span>
          </form>
          {status === 'authenticated' && session?.user ? (
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-accent/20 px-3 py-1 text-sm font-medium text-accent">
                {session.user.name ?? session.user.email?.split('@')[0] ?? 'Member'}
              </span>
              {session.user.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  className="rounded-full border border-accent/50 px-4 py-2 text-sm text-accent transition-colors hover:bg-accent hover:text-midnight"
                >
                  Admin
                </Link>
              )}
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: '/' })}
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-gray-200 transition-colors hover:border-accent hover:text-white"
              >
                Sign out
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/auth/signin"
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-gray-200 transition-colors hover:border-accent hover:text-white"
              >
                Sign in
              </Link>
              <Link
                href="/auth/signup"
                className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-midnight transition-colors hover:bg-highlight"
              >
                Create account
              </Link>
            </>
          )}
        </div>
      </div>
    </header >
  );
}

