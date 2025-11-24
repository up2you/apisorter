import Head from 'next/head';

import SiteFooter from '@/components/layout/SiteFooter';
import SiteHeader from '@/components/layout/SiteHeader';

export default function CommunityPage() {
  return (
    <>
      <Head>
        <title>Community — API Sorter</title>
      </Head>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 py-24 text-center">
        <span className="rounded-full border border-white/10 bg-white/10 px-4 py-1 text-xs uppercase tracking-[0.3em] text-gray-400">
          Community Hub
        </span>
        <h1 className="mt-6 text-4xl font-semibold text-white">Coming Soon</h1>
        <p className="mt-4 text-gray-400">
          We&apos;re building a space for API builders and integrators to share playbooks, templates, and launch updates.
          Stay tuned!
        </p>
      </main>
      <SiteFooter />
    </>
  );
}





