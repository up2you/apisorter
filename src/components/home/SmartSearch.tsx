import { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import ApiCard from '@/components/ApiCard';

interface RecommendedApi {
    id: string;
    slug: string;
    name: string;
    category: string;
    tags: string[];
    description?: string | null;
    provider: {
        name: string;
        logoUrl: string | null;
    };
    logoUrl?: string | null;
    freeTier?: string | null;
    reason?: string;
}

const GREETINGS = [
    "Welcome! What kind of service are you looking for today?",
    "I'm looking for a reliable payment API...",
    "Is there any recommended AI drawing tool?",
    "Help me find a service for sending emails...",
    "I need a crypto market data API...",
];

export default function SmartSearch() {
    const [query, setQuery] = useState('');
    const [placeholder, setPlaceholder] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<RecommendedApi[] | null>(null);
    const [error, setError] = useState('');

    // Typing effect logic
    useEffect(() => {
        let currentText = '';
        let currentIndex = 0;
        let greetingIndex = 0;
        let isDeleting = false;
        let timeout: NodeJS.Timeout;

        const type = () => {
            const fullText = GREETINGS[greetingIndex];

            if (isDeleting) {
                currentText = fullText.substring(0, currentText.length - 1);
            } else {
                currentText = fullText.substring(0, currentText.length + 1);
            }

            setPlaceholder(currentText);

            let typeSpeed = 100;
            if (isDeleting) typeSpeed /= 2;

            if (!isDeleting && currentText === fullText) {
                typeSpeed = 2000; // Pause at end
                isDeleting = true;
            } else if (isDeleting && currentText === '') {
                isDeleting = false;
                greetingIndex = (greetingIndex + 1) % GREETINGS.length;
                typeSpeed = 500;
            }

            timeout = setTimeout(type, typeSpeed);
        };

        timeout = setTimeout(type, 1000);

        return () => clearTimeout(timeout);
    }, []);

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setError('');
        setResults(null);

        try {
            const res = await fetch('/api/search/smart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query }),
            });

            if (!res.ok) {
                throw new Error('Search failed');
            }

            const data = await res.json();
            setResults(data.results);
        } catch (err) {
            console.error(err);
            setError('Sorry, an error occurred during search. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto px-4">
            {/* Search Box Container */}
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-accent via-purple-500 to-pink-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>

                <form
                    onSubmit={handleSearch}
                    className="relative flex items-center bg-surface border border-white/10 rounded-2xl p-2 shadow-2xl"
                >
                    <div className="pl-4 pr-2 text-accent animate-pulse">
                        <Sparkles size={24} />
                    </div>

                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={placeholder}
                        className="flex-1 bg-transparent border-none outline-none text-white text-lg placeholder-gray-500 px-4 py-3"
                    />

                    <button
                        type="submit"
                        disabled={loading || !query.trim()}
                        className="bg-accent hover:bg-accent-light text-white rounded-xl px-6 py-3 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <>
                                <span>Ask AI</span>
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-center">
                    {error}
                </div>
            )}

            {/* Results Area */}
            {results && (
                <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-2 mb-6">
                        <Sparkles className="text-accent" size={20} />
                        <h3 className="text-xl font-bold text-white">AI Recommendations</h3>
                    </div>

                    {results.length === 0 ? (
                        <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
                            <p className="text-gray-400">No relevant APIs found. Please try a different query.</p>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {results.map((api) => (
                                <div key={api.id} className="relative flex flex-col">
                                    {/* AI Reason Bubble */}
                                    {api.reason && (
                                        <div className="mb-3 bg-accent/10 border border-accent/20 rounded-lg p-3 text-sm text-gray-200 relative">
                                            <div className="absolute -bottom-1.5 left-6 w-3 h-3 bg-surface border-r border-b border-accent/20 rotate-45 transform translate-y-1/2 bg-[#1a1f2e]"></div>
                                            <span className="text-accent font-bold mr-1">AI:</span>
                                            {api.reason}
                                        </div>
                                    )}

                                    <div className="flex-1">
                                        <ApiCard
                                            slug={api.slug}
                                            name={api.name}
                                            category={api.category}
                                            tags={api.tags}
                                            description={api.description}
                                            providerName={api.provider?.name}
                                            providerLogo={api.provider?.logoUrl}
                                            apiLogo={api.logoUrl}
                                            freeTier={api.freeTier}
                                            // Mock rating for now as it's not in the lightweight fetch
                                            rating={0}
                                            reviewCount={0}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
