import Head from 'next/head';
import SiteFooter from '@/components/layout/SiteFooter';
import SiteHeader from '@/components/layout/SiteHeader';
import { Mail, MessageSquare, Twitter } from 'lucide-react';

export default function ContactPage() {
    return (
        <>
            <Head>
                <title>Contact Us — API Sorter</title>
            </Head>
            <SiteHeader />
            <main className="mx-auto max-w-4xl px-6 py-20">
                <h1 className="text-4xl font-bold text-white mb-6 text-center">Get in touch</h1>
                <p className="text-xl text-gray-300 mb-16 text-center max-w-2xl mx-auto">
                    Have a question, suggestion, or just want to say hi? We'd love to hear from you.
                </p>

                <div className="grid md:grid-cols-3 gap-8">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center hover:bg-white/10 transition-colors">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 mb-4">
                            <Mail size={24} />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">General Support</h3>
                        <p className="text-gray-400 text-sm mb-4">For account issues and general inquiries.</p>
                        <a href="mailto:support@apisorter.com" className="text-accent hover:underline font-medium">support@apisorter.com</a>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center hover:bg-white/10 transition-colors">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-500/20 text-purple-400 mb-4">
                            <MessageSquare size={24} />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Partnerships</h3>
                        <p className="text-gray-400 text-sm mb-4">For API providers and business opportunities.</p>
                        <a href="mailto:partners@apisorter.com" className="text-accent hover:underline font-medium">partners@apisorter.com</a>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center hover:bg-white/10 transition-colors">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-sky-500/20 text-sky-400 mb-4">
                            <Twitter size={24} />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Social Media</h3>
                        <p className="text-gray-400 text-sm mb-4">Follow us for updates and API trends.</p>
                        <a href="https://twitter.com/apisorter" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline font-medium">@apisorter</a>
                    </div>
                </div>
            </main>
            <SiteFooter />
        </>
    );
}
