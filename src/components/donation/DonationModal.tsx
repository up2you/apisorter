import { useState } from 'react';
import { X, Coffee, Utensils, Wrench, Loader2 } from 'lucide-react';

interface DonationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const TIERS = [
    {
        id: 'coffee',
        name: 'Buy us a Coffee',
        price: 3,
        icon: Coffee,
        description: 'Fuel our coding sessions!',
        color: 'from-orange-400 to-amber-500'
    },
    {
        id: 'lunch',
        name: 'Buy us Lunch',
        price: 8,
        icon: Utensils,
        description: 'Keep us well-fed and happy.',
        color: 'from-green-400 to-emerald-500'
    },
    {
        id: 'tool',
        name: 'Sponsor a Tool',
        price: 20,
        icon: Wrench,
        description: 'Help us pay for server costs.',
        color: 'from-blue-400 to-indigo-500'
    }
];

export default function DonationModal({ isOpen, onClose }: DonationModalProps) {
    const [loading, setLoading] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleDonate = async (tierId: string) => {
        setLoading(tierId);
        try {
            const res = await fetch('/api/donate/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tier: tierId }),
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (error) {
            console.error('Donation failed', error);
            setLoading(null);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="relative w-full max-w-2xl bg-[#0d1117] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X size={24} />
                </button>

                <div className="p-8 text-center">
                    <h2 className="text-3xl font-bold text-white mb-2">Support API Sorter</h2>
                    <p className="text-gray-400 mb-8">
                        Your support helps us keep the servers running and the data fresh.
                    </p>

                    <div className="grid md:grid-cols-3 gap-4">
                        {TIERS.map((tier) => (
                            <button
                                key={tier.id}
                                onClick={() => handleDonate(tier.id)}
                                disabled={!!loading}
                                className="group relative flex flex-col items-center p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all hover:scale-105"
                            >
                                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${tier.color} flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-all`}>
                                    <tier.icon className="text-white" size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-1">{tier.name}</h3>
                                <p className="text-2xl font-bold text-accent mb-2">${tier.price}</p>
                                <p className="text-sm text-gray-400">{tier.description}</p>

                                {loading === tier.id && (
                                    <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                                        <Loader2 className="animate-spin text-white" size={32} />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>

                    <p className="mt-8 text-xs text-gray-500">
                        Secure payment via Lemon Squeezy. You can cancel anytime.
                    </p>
                </div>
            </div>
        </div>
    );
}
