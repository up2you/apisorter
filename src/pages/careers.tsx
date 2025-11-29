import Head from 'next/head';
import SiteFooter from '@/components/layout/SiteFooter';
import SiteHeader from '@/components/layout/SiteHeader';

export default function CareersPage() {
    return (
        <>
            <Head>
                <title>Careers — API Sorter</title>
            </Head>
            <SiteHeader />
            <main className="mx-auto max-w-4xl px-6 py-20 text-center">
                <h1 className="text-4xl font-bold text-white mb-6">Join our team</h1>
                <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
                    We're building the world's best API discovery engine. Help us connect developers with the tools they need to build the future.
                </p>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-12">
                    <h2 className="text-2xl font-semibold text-white mb-4">No open positions right now</h2>
                    <p className="text-gray-400 mb-8">
                        We are currently fully staffed, but we are always looking for talented individuals.
                        Check back soon or follow us on social media for updates.
                    </p>
                    <div className="inline-block px-4 py-2 bg-white/5 rounded-lg text-sm text-gray-500">
                        Remote First • Global Team
                    </div>
                </div>
            </main>
            <SiteFooter />
        </>
    );
}
