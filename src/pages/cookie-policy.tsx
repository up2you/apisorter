import Head from 'next/head';
import SiteFooter from '@/components/layout/SiteFooter';
import SiteHeader from '@/components/layout/SiteHeader';

export default function CookiePolicyPage() {
    return (
        <>
            <Head>
                <title>Cookie Policy — API Sorter</title>
            </Head>
            <SiteHeader />
            <main className="mx-auto max-w-5xl px-6 py-20">
                <h1 className="text-3xl font-semibold text-white">Cookie Policy</h1>
                <p className="mt-4 text-sm text-gray-400">
                    Last updated: November 2025
                </p>
                <div className="mt-8 space-y-6 text-gray-300">
                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">1. What are cookies?</h2>
                        <p>Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide information to the owners of the site.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">2. How we use cookies</h2>
                        <p>We use cookies for the following purposes:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li><strong>Essential Cookies:</strong> Necessary for the website to function (e.g., authentication).</li>
                            <li><strong>Analytics Cookies:</strong> To understand how visitors interact with our website (e.g., page views).</li>
                            <li><strong>Preference Cookies:</strong> To remember your settings (e.g., theme preference).</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-3">3. Managing cookies</h2>
                        <p>Most web browsers allow some control of most cookies through the browser settings. To find out more about cookies, including how to see what cookies have been set, visit <a href="https://www.aboutcookies.org" className="text-accent hover:underline">www.aboutcookies.org</a>.</p>
                    </section>
                </div>
            </main>
            <SiteFooter />
        </>
    );
}
