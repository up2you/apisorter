import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { signOut, useSession } from 'next-auth/react';

import DonationButton from '../donation/DonationButton';

const navItems = [
  { href: '/category/AI%20%26%20Machine%20Learning', label: 'AI APIs' },
  { href: '/category/Payments%20%26%20Finance', label: 'Payments' },
  { href: '/category/Maps%20%26%20Geolocation', label: 'Maps' },
];

export default function SiteHeader() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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
          <DonationButton />
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
            <div className="relative ml-4">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 pl-2 pr-4 py-1.5 transition-colors hover:border-accent/50 hover:bg-white/10"
              >
                <div className="h-8 w-8 overflow-hidden rounded-full bg-accent/20">
                  {(session.user as any).image ? (
                    <img src={(session.user as any).image} alt="User" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs font-bold text-accent">
                      {session.user.name?.[0] ?? 'U'}
                    </div>
                  )}
                </div>
                <span className="text-sm font-medium text-gray-200">
                  {session.user.name ?? 'User'}
                </span>
                <svg className={`h-4 w-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsDropdownOpen(false)}
                  />
                  <div className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-xl border border-white/10 bg-midnight shadow-xl backdrop-blur-xl">
                    <div className="px-4 py-3 border-b border-white/5">
                      <p className="text-xs text-gray-400">Signed in as</p>
                      <p className="truncate text-sm font-medium text-white">{session.user.email}</p>
                    </div>

                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-200 hover:bg-white/5"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Profile Settings
                    </Link>

                    {session.user.role === 'ADMIN' && (
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-sm text-accent hover:bg-white/5"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Admin Dashboard
                      </Link>
                    )}

                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="block w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-white/5"
                    >
                      Sign out
                    </button>
                  </div>
                </>
              )}
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

