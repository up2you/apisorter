import Head from 'next/head';

import SiteFooter from '@/components/layout/SiteFooter';
import SiteHeader from '@/components/layout/SiteHeader';

export default function PrivacyPage() {
  return (
    <>
      <Head>
        <title>Privacy Policy — API Sorter</title>
      </Head>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 py-20">
        <h1 className="text-3xl font-semibold text-white">Privacy Policy</h1>
        <p className="mt-4 text-sm text-gray-400">
          API Sorter values developer trust. We collect minimal analytics and never sell your data. Full policy will be published prior to launch.
        </p>
        <ul className="mt-6 space-y-3 text-sm text-gray-300">
          <li>• Anonymous reviews store nickname + hashed IP for anti-spam.</li>
          <li>• Payment data is processed by Stripe, with no card details stored on our servers.</li>
          <li>• Documentation fetchers respect robots.txt and rate limits.</li>
        </ul>
      </main>
      <SiteFooter />
    </>
  );
}





