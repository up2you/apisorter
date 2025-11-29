import Head from 'next/head';
import SiteFooter from '@/components/layout/SiteFooter';
import SiteHeader from '@/components/layout/SiteHeader';
import { Download } from 'lucide-react';

export default function BrandAssetsPage() {
    return (
        <>
            <Head>
                <title>Brand Assets — API Sorter</title>
            </Head>
            <SiteHeader />
            <main className="mx-auto max-w-5xl px-6 py-20">
                <h1 className="text-4xl font-bold text-white mb-6">Brand Assets</h1>
                <p className="text-xl text-gray-300 mb-12">
                    Download official API Sorter logos and assets. Please do not modify the colors or proportions.
                </p>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Light Logo */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                        <div className="h-40 bg-midnight rounded-xl flex items-center justify-center mb-6 border border-white/10">
                            <img src="/images/logo.png" alt="API Sorter Logo" className="h-16" />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-white">Primary Logo</h3>
                                <p className="text-sm text-gray-400">PNG, SVG • Transparent Background</p>
                            </div>
                            <a href="/images/logo.png" download className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors">
                                <Download size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Dark Logo (Placeholder for now, using same logo) */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                        <div className="h-40 bg-white rounded-xl flex items-center justify-center mb-6 border border-gray-200">
                            {/* Assuming we might have a dark version later, for now just show the same one */}
                            <img src="/images/logo.png" alt="API Sorter Logo" className="h-16" />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-white">Dark Version</h3>
                                <p className="text-sm text-gray-400">PNG, SVG • For light backgrounds</p>
                            </div>
                            <a href="/images/logo.png" download className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors">
                                <Download size={20} />
                            </a>
                        </div>
                    </div>
                </div>
            </main>
            <SiteFooter />
        </>
    );
}
