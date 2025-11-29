import Head from 'next/head';
import SiteFooter from '@/components/layout/SiteFooter';
import SiteHeader from '@/components/layout/SiteHeader';
import { Send } from 'lucide-react';

export default function SubmitApiPage() {
    return (
        <>
            <Head>
                <title>Submit an API — API Sorter</title>
            </Head>
            <SiteHeader />
            <main className="mx-auto max-w-3xl px-6 py-20 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 text-accent mb-6">
                    <Send size={32} />
                </div>
                <h1 className="text-4xl font-bold text-white mb-6">Submit your API</h1>
                <p className="text-xl text-gray-300 mb-10">
                    Join the world's largest curated API directory. Reach thousands of developers who are looking for tools just like yours.
                </p>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-left">
                    <h2 className="text-xl font-semibold text-white mb-4">How to submit</h2>
                    <p className="text-gray-300 mb-6">
                        We are currently accepting submissions via email. Please send the following details to our team:
                    </p>
                    <ul className="space-y-3 text-gray-300 mb-8">
                        <li className="flex items-start gap-3">
                            <span className="text-accent">•</span> API Name & Website URL
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-accent">•</span> Brief Description (what does it do?)
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-accent">•</span> Documentation Link
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-accent">•</span> Pricing Model (Free, Paid, Freemium)
                        </li>
                    </ul>

                    <a
                        href="mailto:submissions@apisorter.com?subject=New API Submission"
                        className="inline-flex items-center justify-center w-full py-3 px-6 bg-accent hover:bg-accent-light text-midnight font-bold rounded-lg transition-colors"
                    >
                        Email Submission
                    </a>
                </div>

                <p className="mt-8 text-sm text-gray-500">
                    Automated submission portal coming soon.
                </p>
            </main>
            <SiteFooter />
        </>
    );
}
