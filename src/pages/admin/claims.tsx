import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Check, X, ShieldAlert, ShieldCheck, ExternalLink } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { format } from 'date-fns';

interface ClaimRequest {
    id: string;
    name: string;
    website: string | null;
    claimEmail: string | null;
    claimedAt: string;
    claimedByUserId: string;
    isDomainMatch: boolean;
}

export default function AdminClaimsPage() {
    const [claims, setClaims] = useState<ClaimRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);

    const fetchClaims = async () => {
        try {
            const res = await fetch('/api/admin/claims');
            if (res.ok) {
                const data = await res.json();
                setClaims(data.claims);
            }
        } catch (error) {
            console.error('Failed to fetch claims', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClaims();
    }, []);

    const handleReview = async (providerId: string, action: 'APPROVE' | 'REJECT') => {
        if (!confirm(`Are you sure you want to ${action} this claim?`)) return;

        setProcessing(providerId);
        try {
            const res = await fetch('/api/admin/claims/review', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ providerId, action }),
            });

            if (res.ok) {
                // Remove from list
                setClaims(prev => prev.filter(c => c.id !== providerId));
            } else {
                alert('Failed to process request');
            }
        } catch (error) {
            console.error('Review failed', error);
        } finally {
            setProcessing(null);
        }
    };

    return (
        <AdminLayout>
            <Head>
                <title>Claim Requests - Admin</title>
            </Head>

            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white">Provider Claim Requests</h1>
                <p className="text-gray-400">Review and verify ownership claims from API providers.</p>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-500">Loading requests...</div>
            ) : claims.length === 0 ? (
                <div className="rounded-xl border border-white/5 bg-white/5 p-12 text-center">
                    <ShieldCheck className="mx-auto h-12 w-12 text-gray-600 mb-4" />
                    <h3 className="text-lg font-medium text-white">No Pending Claims</h3>
                    <p className="text-gray-400">All caught up! There are no pending claim requests.</p>
                </div>
            ) : (
                <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0d1117]">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-gray-400">
                            <tr>
                                <th className="px-6 py-4 font-medium">Provider</th>
                                <th className="px-6 py-4 font-medium">Website</th>
                                <th className="px-6 py-4 font-medium">Claimant Email</th>
                                <th className="px-6 py-4 font-medium">Verification</th>
                                <th className="px-6 py-4 font-medium">Date</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {claims.map((claim) => (
                                <tr key={claim.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 font-medium text-white">{claim.name}</td>
                                    <td className="px-6 py-4 text-gray-300">
                                        {claim.website ? (
                                            <a href={claim.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-accent">
                                                {new URL(claim.website).hostname}
                                                <ExternalLink size={12} />
                                            </a>
                                        ) : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-gray-300">{claim.claimEmail}</td>
                                    <td className="px-6 py-4">
                                        {claim.isDomainMatch ? (
                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-400/10 px-2.5 py-0.5 text-xs font-medium text-green-400 border border-green-400/20">
                                                <Check size={12} />
                                                Domain Match
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-400/10 px-2.5 py-0.5 text-xs font-medium text-yellow-400 border border-yellow-400/20">
                                                <ShieldAlert size={12} />
                                                Mismatch
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {format(new Date(claim.claimedAt), 'MMM d, yyyy')}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleReview(claim.id, 'APPROVE')}
                                                disabled={!!processing}
                                                className="rounded-lg bg-green-500/10 p-2 text-green-400 hover:bg-green-500/20 transition-colors disabled:opacity-50"
                                                title="Approve"
                                            >
                                                <Check size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleReview(claim.id, 'REJECT')}
                                                disabled={!!processing}
                                                className="rounded-lg bg-red-500/10 p-2 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                                                title="Reject"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </AdminLayout>
    );
}
