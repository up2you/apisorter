import { useState, useEffect } from 'react';
import Head from 'next/head';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { CreditCard, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

interface Subscription {
    id: string;
    status: string;
    startsAt: string;
    endsAt: string | null;
    cancelAt: string | null;
    user: {
        id: string;
        name: string | null;
        email: string;
        image: string | null;
    };
    plan: {
        name: string;
        priceUsd: number;
        billingCycle: string;
    };
}

export default function AdminSubscriptionsPage() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    const fetchSubscriptions = async () => {
        try {
            const res = await fetch('/api/admin/subscriptions');
            if (res.ok) {
                const data = await res.json();
                setSubscriptions(data);
            }
        } catch (error) {
            console.error('Failed to fetch subscriptions', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active': return 'text-green-400 bg-green-400/10 border-green-400/20';
            case 'canceled': return 'text-red-400 bg-red-400/10 border-red-400/20';
            case 'incomplete': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
            case 'past_due': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
            default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
        }
    };

    return (
        <AdminLayout>
            <Head>
                <title>Subscriptions - Admin</title>
            </Head>

            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <CreditCard className="text-primary" size={28} />
                    Subscriptions
                </h1>
                <p className="text-gray-400 mt-2">Manage user subscriptions and billing status.</p>
            </div>

            <div className="bg-surface border border-white/10 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/5">
                                <th className="p-4 text-sm font-medium text-gray-400">User</th>
                                <th className="p-4 text-sm font-medium text-gray-400">Plan</th>
                                <th className="p-4 text-sm font-medium text-gray-400">Status</th>
                                <th className="p-4 text-sm font-medium text-gray-400">Started</th>
                                <th className="p-4 text-sm font-medium text-gray-400">Renews/Expires</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500">Loading subscriptions...</td>
                                </tr>
                            ) : subscriptions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500">No subscriptions found.</td>
                                </tr>
                            ) : (
                                subscriptions.map((sub) => (
                                    <tr key={sub.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs uppercase">
                                                    {sub.user.image ? <img src={sub.user.image} className="w-full h-full rounded-full object-cover" /> : sub.user.email[0]}
                                                </div>
                                                <div>
                                                    <div className="text-white font-medium">{sub.user.name || 'User'}</div>
                                                    <div className="text-xs text-gray-500">{sub.user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-white">{sub.plan.name}</div>
                                            <div className="text-xs text-gray-500">
                                                ${sub.plan.priceUsd} / {sub.plan.billingCycle}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(sub.status)}`}>
                                                {sub.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-400 text-sm">
                                            {format(new Date(sub.startsAt), 'MMM d, yyyy')}
                                        </td>
                                        <td className="p-4 text-gray-400 text-sm">
                                            {sub.endsAt ? format(new Date(sub.endsAt), 'MMM d, yyyy') : <span className="text-green-500 flex items-center gap-1"><Clock size={12} /> Auto-renews</span>}
                                            {sub.cancelAt && <div className="text-xs text-red-400 mt-1">Cancels at period end</div>}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
