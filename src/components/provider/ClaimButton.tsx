import { useState } from 'react';
import { ShieldCheck, Loader2, CheckCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface ClaimButtonProps {
    providerId: string;
    providerName: string;
    claimStatus: string; // 'UNCLAIMED' | 'PENDING' | 'APPROVED'
}

export default function ClaimButton({ providerId, providerName, claimStatus }: ClaimButtonProps) {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    if (claimStatus === 'APPROVED') {
        return (
            <div className="flex items-center gap-2 text-green-400 bg-green-400/10 px-3 py-1.5 rounded-full text-sm font-medium border border-green-400/20">
                <ShieldCheck size={16} />
                <span>Official Verified</span>
            </div>
        );
    }

    if (claimStatus === 'PENDING') {
        return (
            <div className="flex items-center gap-2 text-yellow-400 bg-yellow-400/10 px-3 py-1.5 rounded-full text-sm font-medium border border-yellow-400/20">
                <Loader2 size={16} className="animate-spin" />
                <span>Verification Pending</span>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/providers/claim', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ providerId, claimEmail: email }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to submit claim');
            }

            setSuccess(true);
            setTimeout(() => {
                setIsOpen(false);
                // In a real app, we might want to trigger a refresh or update local state
            }, 2000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
            >
                <ShieldCheck size={16} />
                <span>Claim this Provider</span>
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-[#161b22] border border-white/10 rounded-xl shadow-2xl p-6">
                        <h3 className="text-xl font-bold text-white mb-2">Claim {providerName}</h3>

                        {!session ? (
                            <div className="text-center py-4">
                                <p className="text-gray-400 mb-4">Please sign in to claim this provider.</p>
                                <button onClick={() => setIsOpen(false)} className="text-accent hover:underline">Close</button>
                            </div>
                        ) : success ? (
                            <div className="text-center py-8">
                                <CheckCircle className="mx-auto text-green-400 mb-4" size={48} />
                                <h4 className="text-lg font-bold text-white">Request Submitted!</h4>
                                <p className="text-gray-400">We will review your request shortly.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <p className="text-sm text-gray-400 mb-4">
                                    To verify your identity, please enter your work email address associated with <strong>{providerName}</strong>.
                                </p>

                                <div className="mb-4">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Work Email</label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-[#0d1117] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-accent outline-none"
                                        placeholder="you@company.com"
                                    />
                                </div>

                                {error && (
                                    <p className="text-red-400 text-sm mb-4">{error}</p>
                                )}

                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsOpen(false)}
                                        className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-4 py-2 bg-accent hover:bg-accent-light text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {loading && <Loader2 className="animate-spin" size={16} />}
                                        Submit Request
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
