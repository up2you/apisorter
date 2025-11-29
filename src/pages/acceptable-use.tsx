import Head from 'next/head';
import SiteFooter from '@/components/layout/SiteFooter';
import SiteHeader from '@/components/layout/SiteHeader';

export default function AcceptableUsePage() {
    return (
        <>
            <Head>
                <title>Acceptable Use Policy — API Sorter</title>
            </Head>
            <SiteHeader />
            <main className="mx-auto max-w-5xl px-6 py-20">
                <h1 className="text-3xl font-semibold text-white">Acceptable Use Policy</h1>
                <p className="mt-4 text-sm text-gray-400">
                    Last updated: November 2025
                </p>
                <div className="mt-8 space-y-6 text-gray-300">
                    <p>By accessing or using API Sorter, you agree to comply with this Acceptable Use Policy.</p>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">Prohibited Activities</h2>
                        <p>You may not use our services to:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Violate any applicable laws or regulations.</li>
                            <li>Infringe upon the intellectual property rights of others.</li>
                            <li>Distribute malware, viruses, or other harmful software.</li>
                            <li>Engage in scraping or automated data collection without permission.</li>
                            <li>Post false, misleading, or fraudulent reviews.</li>
                            <li>Harass, abuse, or harm other users.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">Enforcement</h2>
                        <p>We reserve the right to investigate and take appropriate action against anyone who, in our sole discretion, violates this policy, including removing offending content and suspending or terminating the account of such violators.</p>
                    </section>
                </div>
            </main>
            <SiteFooter />
        </>
    );
}
