import Head from 'next/head';
import SiteFooter from '@/components/layout/SiteFooter';
import SiteHeader from '@/components/layout/SiteHeader';
import { Users, Globe, Zap } from 'lucide-react';

export default function AboutPage() {
    return (
        <>
            <Head>
                <title>About Us — API Sorter</title>
            </Head>
            <SiteHeader />
            <main className="mx-auto max-w-7xl px-6 py-20">
                {/* Hero Section */}
                <section className="text-center mb-24">
                    <h1 className="text-5xl font-extrabold text-white mb-6">
                        Organizing the world's APIs
                    </h1>
                    <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                        We believe that finding the right API shouldn't be a struggle.
                        API Sorter is built by developers, for developers, to make discovery and integration seamless.
                    </p>
                </section>

                {/* Values Section */}
                <section className="grid md:grid-cols-3 gap-12 mb-24">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 text-accent mb-6">
                            <Zap size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">Speed & Efficiency</h3>
                        <p className="text-gray-400">
                            We optimize for speed. Find what you need in seconds, not hours.
                            Our search engine is tuned for technical relevance.
                        </p>
                    </div>
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-400 mb-6">
                            <Users size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">Community Driven</h3>
                        <p className="text-gray-400">
                            Real reviews from real developers. No paid placements, no hidden agendas.
                            Just honest feedback from the community.
                        </p>
                    </div>
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-400 mb-6">
                            <Globe size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">Global Reach</h3>
                        <p className="text-gray-400">
                            We index APIs from providers all around the world, ensuring you have access
                            to the best tools regardless of origin.
                        </p>
                    </div>
                </section>

                {/* Story Section */}
                <section className="bg-white/5 border border-white/10 rounded-3xl p-12 md:p-20 text-center">
                    <h2 className="text-3xl font-bold text-white mb-6">Our Story</h2>
                    <div className="max-w-3xl mx-auto space-y-6 text-gray-300 text-lg leading-relaxed">
                        <p>
                            API Sorter started as a simple spreadsheet shared among a small team of engineers who were tired of
                            outdated documentation and broken links. We realized that the API economy was growing faster than
                            the tools to navigate it.
                        </p>
                        <p>
                            Today, we are a dedicated team working to build the definitive index of the API economy.
                            Our mission is to empower developers to build better software faster by connecting them
                            with the best building blocks available.
                        </p>
                    </div>
                </section>
            </main>
            <SiteFooter />
        </>
    );
}
