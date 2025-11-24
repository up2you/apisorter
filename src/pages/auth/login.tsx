import Head from 'next/head';

import SiteFooter from '@/components/layout/SiteFooter';
import SiteHeader from '@/components/layout/SiteHeader';

export default function LoginPage() {
  return (
    <>
      <Head>
        <title>Sign in — API Sorter</title>
      </Head>
      <SiteHeader />
      <main className="mx-auto max-w-md px-6 py-24">
        <div className="rounded-[28px] border border-white/5 bg-white/5 p-8 shadow-card">
          <h1 className="text-2xl font-semibold text-white">Sign in to API Sorter</h1>
          <p className="mt-2 text-sm text-gray-400">
            Authentication integration (e.g. Auth0 / Clerk) will plug in here. For now, use anonymous reviews freely.
          </p>
          <div className="mt-6 space-y-4">
            <button className="w-full rounded-full bg-accent px-4 py-3 text-sm font-semibold text-midnight transition-colors hover:bg-highlight">
              Continue with email
            </button>
            <button className="w-full rounded-full border border-white/10 px-4 py-3 text-sm text-gray-200 transition-colors hover:border-accent">
              Continue with GitHub
            </button>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}





