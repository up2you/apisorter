import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Plus, Trash2, Layout, Image as ImageIcon } from 'lucide-react';
import { useRouter } from 'next/router';

interface AdSlot {
    id: string;
    key: string;
    description: string;
    width: number | null;
    height: number | null;
    campaigns: any[];
}

export default function AdminAds() {
    const [slots, setSlots] = useState<AdSlot[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNewSlot, setShowNewSlot] = useState(false);
    const [newSlot, setNewSlot] = useState({ key: '', description: '', width: '', height: '' });
    const router = useRouter();

    useEffect(() => {
        fetchSlots();
    }, []);

    const fetchSlots = async () => {
        try {
            const res = await fetch('/api/admin/ads/slots');
            if (res.ok) {
                const data = await res.json();
                setSlots(data);
            }
        } catch (error) {
            console.error('Failed to fetch slots', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSlot = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/admin/ads/slots', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSlot),
            });
            if (res.ok) {
                setShowNewSlot(false);
                setNewSlot({ key: '', description: '', width: '', height: '' });
                fetchSlots();
            } else {
                alert('Failed to create slot');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteSlot = async (id: string) => {
        if (!confirm('Are you sure? This will delete all campaigns in this slot.')) return;
        try {
            const res = await fetch(`/api/admin/ads/slots?id=${id}`, { method: 'DELETE' });
            if (res.ok) fetchSlots();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <AdminLayout>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Ad Manager</h1>
                <button
                    onClick={() => setShowNewSlot(true)}
                    className="px-4 py-2 bg-primary text-white rounded-lg flex items-center gap-2 hover:bg-primary/90"
                >
                    <Plus size={20} />
                    New Ad Slot
                </button>
            </div>

            {showNewSlot && (
                <div className="bg-surface border border-white/10 rounded-xl p-6 mb-8">
                    <h2 className="text-xl font-bold mb-4">Create New Slot</h2>
                    <form onSubmit={handleCreateSlot} className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Slot Key (e.g., sidebar-top)</label>
                            <input
                                type="text"
                                required
                                pattern="[a-zA-Z0-9-_]+"
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white"
                                value={newSlot.key}
                                onChange={e => setNewSlot({ ...newSlot, key: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Description</label>
                            <input
                                type="text"
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white"
                                value={newSlot.description}
                                onChange={e => setNewSlot({ ...newSlot, description: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Width (px)</label>
                            <input
                                type="number"
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white"
                                value={newSlot.width}
                                onChange={e => setNewSlot({ ...newSlot, width: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Height (px)</label>
                            <input
                                type="number"
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white"
                                value={newSlot.height}
                                onChange={e => setNewSlot({ ...newSlot, height: e.target.value })}
                            />
                        </div>
                        <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                            <button
                                type="button"
                                onClick={() => setShowNewSlot(false)}
                                className="px-4 py-2 text-gray-400 hover:text-white"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-primary text-white rounded-lg"
                            >
                                Create Slot
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid gap-6">
                {slots.map(slot => (
                    <div key={slot.id} className="bg-surface border border-white/10 rounded-xl p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/20 text-blue-500 rounded-lg">
                                    <Layout size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">{slot.key}</h3>
                                    <p className="text-sm text-gray-400">{slot.description || 'No description'}</p>
                                    <div className="text-xs text-gray-500 mt-1">
                                        Size: {slot.width || 'Auto'} x {slot.height || 'Auto'}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDeleteSlot(slot.id)}
                                className="text-gray-500 hover:text-red-500 transition-colors"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>

                        <div className="border-t border-white/5 pt-4">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="font-medium text-gray-300">Active Campaigns ({slot.campaigns.length})</h4>
                                <button
                                    onClick={() => router.push(`/admin/ads/campaigns/new?slotId=${slot.id}`)}
                                    className="text-sm text-primary hover:text-primary-light flex items-center gap-1"
                                >
                                    <Plus size={14} /> Add Campaign
                                </button>
                            </div>

                            {slot.campaigns.length > 0 ? (
                                <div className="space-y-3">
                                    {slot.campaigns.map((campaign: any) => (
                                        <div key={campaign.id} className="flex items-center gap-4 bg-black/20 p-3 rounded-lg">
                                            <div className="h-10 w-10 relative rounded overflow-hidden bg-gray-800">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={campaign.imageUrl} alt={campaign.name} className="object-cover w-full h-full" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-white">{campaign.name}</p>
                                                <div className="flex gap-4 text-xs text-gray-500">
                                                    <span>👁 {campaign.impressions}</span>
                                                    <span>👆 {campaign.clicks}</span>
                                                </div>
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                Ends: {new Date(campaign.endsAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 italic">No active campaigns</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </AdminLayout>
    );
}
