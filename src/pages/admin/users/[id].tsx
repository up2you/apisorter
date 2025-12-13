import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
    User, Mail, Calendar, Shield, DollarSign, Activity,
    CreditCard, Heart, Star, ArrowLeft, Send, Trash2, Edit
} from 'lucide-react';
import { format } from 'date-fns';

interface UserDetail {
    id: string;
    name: string;
    email: string;
    image: string;
    role: string;
    createdAt: string;
    stats: {
        totalSpend: number;
        paymentCount: number;
        reviewCount: number;
        favoriteCount: number;
        apiFollowCount: number;
    };
    sessions: any[];
    reviews: any[];
    favorites: any[];
    subscriptions: any[];
}

export default function UserDetailPage() {
    const router = useRouter();
    const { id } = router.query;
    const [user, setUser] = useState<UserDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    // Modals
    const [isEmailOpen, setIsEmailOpen] = useState(false);
    const [emailData, setEmailData] = useState({ subject: '', message: '' });
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editData, setEditData] = useState({ name: '', role: 'USER' });

    useEffect(() => {
        if (id) fetchUser();
    }, [id]);

    const fetchUser = async () => {
        try {
            const res = await fetch(`/api/admin/users/${id}`);
            if (res.ok) {
                const data = await res.json();
                setUser(data);
                setEditData({ name: data.name || '', role: data.role });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`/api/admin/users/${id}/email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(emailData)
            });
            if (res.ok) {
                alert('Email sent successfully!');
                setIsEmailOpen(false);
                setEmailData({ subject: '', message: '' });
            } else {
                alert('Failed to send email');
            }
        } catch (error) {
            alert('Error sending email');
        }
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`/api/admin/users/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editData)
            });
            if (res.ok) {
                alert('User updated successfully!');
                setIsEditOpen(false);
                fetchUser();
            } else {
                alert('Failed to update user');
            }
        } catch (error) {
            alert('Error updating user');
        }
    };

    const handleDeleteUser = async () => {
        if (!confirm('Are you sure you want to PERMANENTLY delete this user? This action cannot be undone.')) return;
        try {
            const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
            if (res.ok) {
                alert('User deleted.');
                router.push('/admin/users');
            } else {
                alert('Failed to delete user');
            }
        } catch (error) {
            alert('Error deleting user');
        }
    };

    if (loading) return <AdminLayout><div className="p-8 text-center text-gray-500">Loading user profile...</div></AdminLayout>;
    if (!user) return <AdminLayout><div className="p-8 text-center text-red-400">User not found</div></AdminLayout>;

    return (
        <AdminLayout>
            <Head>
                <title>{user.name || 'User'} - Admin</title>
            </Head>

            {/* Header */}
            <div className="mb-8">
                <button onClick={() => router.push('/admin/users')} className="flex items-center gap-2 text-gray-500 hover:text-white mb-4 transition-colors">
                    <ArrowLeft size={16} /> Back to Users
                </button>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-surface-light overflow-hidden border-2 border-white/10">
                            {user.image ? (
                                <img src={user.image} alt="" className="h-full w-full object-cover" />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center bg-white/5"><User size={32} className="text-gray-500" /></div>
                            )}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                                {user.name}
                                <span className={`text-xs px-2 py-1 rounded border ${user.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                                    {user.role}
                                </span>
                            </h1>
                            <div className="text-gray-500 flex items-center gap-4 mt-1 text-sm">
                                <span className="flex items-center gap-1"><Mail size={14} /> {user.email}</span>
                                <span className="flex items-center gap-1"><Calendar size={14} /> Joined {format(new Date(user.createdAt), 'MMM d, yyyy')}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button onClick={() => setIsEmailOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded-lg hover:bg-blue-600/30 transition-colors">
                            <Send size={18} /> Email
                        </button>
                        <button onClick={() => setIsEditOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-surface text-gray-300 border border-white/10 rounded-lg hover:bg-white/5 transition-colors">
                            <Edit size={18} /> Edit
                        </button>
                        <button onClick={handleDeleteUser} className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors">
                            <Trash2 size={18} /> Delete
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-surface p-6 rounded-xl border border-white/10">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-green-500/10 rounded-lg"><DollarSign className="text-green-500" size={24} /></div>
                        <span className="text-gray-500 text-sm">Lifetime Value</span>
                    </div>
                    <div className="text-2xl font-bold text-white">${(user.stats.totalSpend / 100).toFixed(2)}</div>
                    <div className="text-sm text-gray-500 mt-1">{user.stats.paymentCount} payments</div>
                </div>
                <div className="bg-surface p-6 rounded-xl border border-white/10">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-purple-500/10 rounded-lg"><Activity className="text-purple-500" size={24} /></div>
                        <span className="text-gray-500 text-sm">Activity</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{user.stats.favoriteCount + user.stats.reviewCount}</div>
                    <div className="text-sm text-gray-500 mt-1">Actions taken</div>
                </div>
                <div className="bg-surface p-6 rounded-xl border border-white/10">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-yellow-500/10 rounded-lg"><Star className="text-yellow-500" size={24} /></div>
                        <span className="text-gray-500 text-sm">Reviews</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{user.stats.reviewCount}</div>
                    <div className="text-sm text-gray-500 mt-1">APIs reviewed</div>
                </div>
                <div className="bg-surface p-6 rounded-xl border border-white/10">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-red-500/10 rounded-lg"><Heart className="text-red-500" size={24} /></div>
                        <span className="text-gray-500 text-sm">Favorites</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{user.stats.favoriteCount}</div>
                    <div className="text-sm text-gray-500 mt-1">APIs saved</div>
                </div>
            </div>

            {/* Content Tabs */}
            <div className="bg-surface border border-white/10 rounded-xl overflow-hidden min-h-[400px]">
                <div className="border-b border-white/10 px-6 pt-4 flex gap-6">
                    {['overview', 'purchases'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-4 text-sm font-medium capitalize transition-colors border-b-2 ${activeTab === tab ? 'text-white border-primary' : 'text-gray-500 border-transparent hover:text-gray-300'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="p-6">
                    {activeTab === 'overview' && (
                        <div className="space-y-8">
                            {/* Favorites List */}
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-4">Recent Favorites</h3>
                                {user.favorites.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {user.favorites.map((fav: any) => (
                                            <div key={fav.id} className="p-4 bg-white/5 rounded-lg border border-white/5 flex items-center gap-3">
                                                <div className="h-10 w-10 bg-white/10 rounded flex items-center justify-center text-xl font-bold">
                                                    {fav.api.name[0]}
                                                </div>
                                                <div>
                                                    <div className="text-white font-medium">{fav.api.name}</div>
                                                    <div className="text-xs text-gray-500">{format(new Date(fav.createdAt), 'MMM d, yyyy')}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : <p className="text-gray-500">No favorites yet.</p>}
                            </div>

                            {/* Reviews List */}
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-4">Recent Reviews</h3>
                                <div className="space-y-4">
                                    {user.reviews.length > 0 ? user.reviews.map((review: any) => (
                                        <div key={review.id} className="p-4 bg-white/5 rounded-lg border border-white/5">
                                            <div className="flex justify-between mb-2">
                                                <span className="text-white font-medium">{review.api.name}</span>
                                                <div className="flex text-yellow-500 text-xs">{'★'.repeat(review.rating)}</div>
                                            </div>
                                            <p className="text-gray-400 text-sm italic">"{review.comment}"</p>
                                        </div>
                                    )) : <p className="text-gray-500">No reviews yet.</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'purchases' && (
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-4">Subscription History</h3>
                            {user.subscriptions.length > 0 ? (
                                <div className="space-y-4">
                                    {user.subscriptions.map((sub: any) => (
                                        <div key={sub.id} className="bg-white/5 p-4 rounded-lg border border-white/5">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-white font-medium text-lg">{sub.plan.name}</span>
                                                <span className={`px-2 py-1 rounded text-xs border ${sub.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                                                    }`}>{sub.status.toUpperCase()}</span>
                                            </div>
                                            <div className="text-sm text-gray-400 mb-4">
                                                Started {format(new Date(sub.createdAt), 'PP')} • Ends {sub.endsAt ? format(new Date(sub.endsAt), 'PP') : 'Never'}
                                            </div>

                                            {/* Payments Table within Sub */}
                                            {sub.payments && sub.payments.length > 0 && (
                                                <table className="w-full text-sm text-left">
                                                    <thead className="text-gray-500 border-b border-white/10">
                                                        <tr>
                                                            <th className="py-2">Date</th>
                                                            <th className="py-2">Amount</th>
                                                            <th className="py-2">Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-white/5">
                                                        {sub.payments.map((payment: any) => (
                                                            <tr key={payment.id}>
                                                                <td className="py-2 text-gray-400">{format(new Date(payment.createdAt), 'MMM d, yyyy')}</td>
                                                                <td className="py-2 text-white font-medium">${(payment.amountUsd / 100).toFixed(2)}</td>
                                                                <td className="py-2 text-gray-400">{payment.status}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : <p className="text-gray-500">No subscriptions found.</p>}
                        </div>
                    )}
                </div>
            </div>

            {/* Email Modal */}
            {isEmailOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-surface border border-white/10 rounded-xl p-6 w-full max-w-lg shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-4">Send Email to {user.name}</h3>
                        <form onSubmit={handleSendEmail} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Subject</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                    value={emailData.subject}
                                    onChange={e => setEmailData({ ...emailData, subject: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Message</label>
                                <textarea
                                    required
                                    rows={5}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                    value={emailData.message}
                                    onChange={e => setEmailData({ ...emailData, message: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsEmailOpen(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">Send Email</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {isEditOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-surface border border-white/10 rounded-xl p-6 w-full max-w-md shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-4">Edit User Profile</h3>
                        <form onSubmit={handleUpdateUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                    value={editData.name}
                                    onChange={e => setEditData({ ...editData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Role</label>
                                <select
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                    value={editData.role}
                                    onChange={e => setEditData({ ...editData, role: e.target.value })}
                                >
                                    <option value="USER">User</option>
                                    <option value="ADMIN">Admin</option>
                                    <option value="MODERATOR">Moderator</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsEditOpen(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
