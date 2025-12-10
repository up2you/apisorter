import Link from 'next/link';
import { useState } from 'react';
import AdUnit from '@/components/ads/AdUnit';
import InterestModal from '@/components/newsletter/InterestModal';

export default function SiteFooter() {
    const [email, setEmail] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleInitialSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email && email.includes('@')) {
            setIsModalOpen(true);
        }
    };

    const handleFinalSubmit = async (interests: string[]) => {
        setLoading(true);
        try {
            const res = await fetch('/api/newsletter/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, interests }),
            });

            if (res.ok) {
                setStatus('success');
                setIsModalOpen(false);
                setEmail('');
            } else {
                setStatus('error');
            }
        } catch (error) {
            setStatus('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <footer className="mt-20 border-t border-white/5 bg-surface/60 pt-16 pb-8 backdrop-blur-xl">
            <div className="container-max">
                {/* Newsletter Section */}
                <div className="mb-16 flex flex-col items-center justify-between gap-8 rounded-2xl border border-white/5 bg-white/5 p-8 md:flex-row md:p-12">
                    <div className="max-w-xl">
                        <h3 className="text-2xl font-bold text-white">Stay updated with the latest APIs</h3>
                        <p className="mt-2 text-gray-400">
                            Get a weekly digest of new APIs, trends, and developer tools. No spam, unsubscribe anytime.
                        </p>
                    </div>
                    <div className="w-full max-w-md">
                        {status === 'success' ? (
                            <div className="p-4 rounded-xl bg-green-500/20 text-green-400 text-center font-medium border border-green-500/30">
                                ✨ Thanks for subscribing! Check your inbox soon.
                            </div>
                        ) : (
                            <form className="flex w-full gap-3" onSubmit={handleInitialSubmit}>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    className="input w-full bg-midnight/50 focus:bg-midnight"
                                />
                                <button type="submit" className="btn btn-primary whitespace-nowrap">
                                    Subscribe
                                </button>
                            </form>
                        )}
                        {status === 'error' && (
                            <p className="text-red-400 text-xs mt-2 text-center">Something went wrong. Please try again.</p>
                        )}
                    </div>
                </div>

                <InterestModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleFinalSubmit}
                    loading={loading}
                />

                {/* Ad Slot */}
                <div className="mb-16">
                    <AdUnit slotKey="footer-banner" className="w-full max-w-4xl mx-auto" />
                </div>

                <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
                    {/* Brand Column */}
                    <div className="flex flex-col gap-6">
                        <Link href="/" className="flex items-center gap-3">
                            <img
                                src="/images/logo.png"
                                alt="API Sorter Logo"
                                className="h-8 w-8 object-contain"
                            />
                            <span className="text-lg font-bold text-white">API Sorter</span>
                        </Link>
                        <p className="text-sm leading-relaxed text-gray-400">
                            Empowering developers to build the future. We index, categorize, and monitor thousands of APIs to help you find the perfect tools for your next project.
                        </p>
                        <div className="flex gap-4">
                            {/* Social Icons */}
                            {[
                                { name: 'GitHub', icon: 'github' },
                                { name: 'Twitter', icon: 'twitter' },
                                { name: 'Discord', icon: 'discord' },
                            ].map((social) => (
                                <a
                                    key={social.name}
                                    href="#"
                                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-gray-400 transition-all hover:bg-accent/20 hover:text-accent"
                                    aria-label={social.name}
                                >
                                    {/* Placeholder Icons - using simple text/emoji for now to avoid icon lib dependency issues */}
                                    <span className="text-xs">{social.name[0]}</span>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Platform Column */}
                    <div>
                        <h4 className="mb-6 text-sm font-bold uppercase tracking-wider text-white">Platform</h4>
                        <ul className="space-y-4 text-sm text-gray-400">
                            <li>
                                <Link href="/category/all" className="hover:text-accent transition-colors">
                                    Browse APIs
                                </Link>
                            </li>
                            <li>
                                <Link href="/categories" className="hover:text-accent transition-colors">
                                    Categories
                                </Link>
                            </li>
                            <li>
                                <Link href="/submit" className="hover:text-accent transition-colors">
                                    Submit API
                                </Link>
                            </li>
                            <li>
                                <Link href="/pricing" className="hover:text-accent transition-colors">
                                    Pricing
                                </Link>
                            </li>
                            <li>
                                <span className="flex items-center gap-2">
                                    <span className="hover:text-accent cursor-not-allowed">Chrome Extension</span>
                                    <span className="badge badge-secondary text-[10px] py-0.5 px-1.5">Soon</span>
                                </span>
                            </li>
                        </ul>
                    </div>

                    {/* Company Column */}
                    <div>
                        <h4 className="mb-6 text-sm font-bold uppercase tracking-wider text-white">Company</h4>
                        <ul className="space-y-4 text-sm text-gray-400">
                            <li>
                                <Link href="/about" className="hover:text-accent transition-colors">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/blog" className="hover:text-accent transition-colors">
                                    Blog
                                </Link>
                            </li>
                            <li>
                                <Link href="/careers" className="hover:text-accent transition-colors">
                                    Careers
                                </Link>
                            </li>
                            <li>
                                <Link href="/brand" className="hover:text-accent transition-colors">
                                    Brand Assets
                                </Link>
                            </li>
                            <li>
                                <Link href="mailto:hello@apisorter.com" className="hover:text-accent transition-colors">
                                    Contact
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Legal Column */}
                    <div>
                        <h4 className="mb-6 text-sm font-bold uppercase tracking-wider text-white">Legal</h4>
                        <ul className="space-y-4 text-sm text-gray-400">
                            <li>
                                <Link href="/privacy" className="hover:text-accent transition-colors">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="hover:text-accent transition-colors">
                                    Terms of Service
                                </Link>
                            </li>
                            <li>
                                <Link href="/cookies" className="hover:text-accent transition-colors">
                                    Cookie Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/acceptable-use" className="hover:text-accent transition-colors">
                                    Acceptable Use
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-16 border-t border-white/5 pt-8">
                    <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                        <p className="text-xs text-gray-500">
                            © {new Date().getFullYear()} API Sorter. All rights reserved.
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                            Made with <span className="text-red-500">❤️</span> for developers
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
