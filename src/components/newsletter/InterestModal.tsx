import { useState } from 'react';
import { X, Check } from 'lucide-react';

interface InterestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (interests: string[]) => void;
    loading: boolean;
}

const CATEGORIES = [
    'AI & Machine Learning',
    'Finance & Payments',
    'DevTools',
    'Social & Media',
    'Data & Analytics',
    'E-commerce',
    'Security',
    'Blockchain',
];

export default function InterestModal({ isOpen, onClose, onSubmit, loading }: InterestModalProps) {
    const [selected, setSelected] = useState<string[]>([]);

    if (!isOpen) return null;

    const toggleInterest = (category: string) => {
        setSelected(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-surface border border-white/10 rounded-2xl p-6 max-w-md w-full relative shadow-2xl">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white"
                >
                    <X size={20} />
                </button>

                <h2 className="text-2xl font-bold text-white mb-2">One last step!</h2>
                <p className="text-gray-400 mb-6 text-sm">
                    Select the topics you are interested in so we can send you relevant API updates.
                </p>

                <div className="grid grid-cols-2 gap-3 mb-8">
                    {CATEGORIES.map(category => (
                        <button
                            key={category}
                            onClick={() => toggleInterest(category)}
                            className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${selected.includes(category)
                                    ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                    : 'bg-white/5 text-gray-300 hover:bg-white/10'
                                }`}
                        >
                            <span>{category}</span>
                            {selected.includes(category) && <Check size={16} />}
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => onSubmit(selected)}
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-primary to-accent rounded-xl text-white font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                    {loading ? 'Subscribing...' : 'Complete Subscription'}
                </button>
            </div>
        </div>
    );
}
