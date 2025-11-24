import Head from 'next/head';

import SiteFooter from '@/components/layout/SiteFooter';
import SiteHeader from '@/components/layout/SiteHeader';

export default function TermsPage() {
  return (
    <>
      <Head>
        <title>Terms of Service — API Sorter</title>
      </Head>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 py-20">
        <h1 className="text-3xl font-semibold text-white">Terms of Service</h1>
        <p className="mt-4 text-sm text-gray-400">
          These terms govern usage of the API Sorter platform. Final wording will be added before public launch.
        </p>
        <ol className="mt-6 space-y-4 text-sm text-gray-300">
          <li><strong className="text-white">Usage:</strong> API Sorter aggregates publicly available API metadata and documentation links.</li>
          <li><strong className="text-white">Reviews:</strong> Anonymous submissions may be moderated for spam, abuse, or inaccuracies.</li>
          <li><strong className="text-white">Payments:</strong> Subscription billing is handled by Stripe per plan descriptions.</li>
          <li><strong className="text-white">Availability:</strong> Auto-updates run every three days; service level agreements apply only to Enterprise plans.</li>
        </ol>
      </main>
      <SiteFooter />
    </>
  );
}





