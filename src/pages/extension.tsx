import Head from 'next/head';
import SiteFooter from '@/components/layout/SiteFooter';
import SiteHeader from '@/components/layout/SiteHeader';
import { Chrome, Bell, Zap, Shield } from 'lucide-react';

export default function ExtensionPage() {
    return (
        <>
            <Head>
                <title>Chrome Extension — API Sorter</title>
            </Head>
            <SiteHeader />
            <main className="mx-auto max-w-7xl px-6 py-20">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-semibold mb-6">
                            COMING SOON
                        </div>
                        <h1 className="text-5xl font-extrabold text-white mb-6 leading-tight">
                            API Discovery, <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-highlight">
                                Right in your browser.
                            </span>
                        </h1>
                        <p className="text-xl text-gray-300 mb-8">
                            Detect APIs on any website you visit. Get instant access to documentation,
                            pricing, and reviews without leaving the page.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button disabled className="btn btn-primary opacity-50 cursor-not-allowed flex items-center justify-center gap-2">
                                <Chrome size={20} />
                                Add to Chrome
                            </button>
                            <button className="btn btn-secondary">
                                Notify me when ready
                            </button>
                        </div>

                        <div className="mt-12 grid gap-6">
                            <div className="flex items-start gap-4">
                                <div className="p-2 rounded-lg bg-white/5 text-accent">
                                    <Zap size={24} />
                                </div>
                                <div>
                                    <h3 className="text-white font-semibold">Instant Detection</h3>
                                    <p className="text-sm text-gray-400">Automatically identifies API endpoints and documentation links.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-2 rounded-lg bg-white/5 text-accent">
                                    <Shield size={24} />
                                </div>
                                <div>
                                    <h3 className="text-white font-semibold">Security Check</h3>
                                    <p className="text-sm text-gray-400">Quickly view security headers and potential vulnerabilities.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mockup */}
                    <div className="relative">
                        <div className="absolute -inset-4 bg-gradient-to-r from-accent/20 to-purple-500/20 rounded-full blur-3xl opacity-50" />
                        <div className="relative bg-[#1a1f2e] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                            <div className="bg-[#0d1117] px-4 py-3 border-b border-white/5 flex items-center gap-2">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-500/20" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                                    <div className="w-3 h-3 rounded-full bg-green-500/20" />
                                </div>
                                <div className="flex-1 mx-4 bg-[#1a1f2e] h-6 rounded-md border border-white/5" />
                            </div>
                            <div className="p-8 aspect-[4/3] flex items-center justify-center text-gray-500">
                                <div className="text-center">
                                    <Chrome size={64} className="mx-auto mb-4 opacity-20" />
                                    <p>Extension Preview</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <SiteFooter />
        </>
    );
}
