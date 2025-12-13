import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Plus, Trash2, Layout, Image as ImageIcon, Calendar, MousePointer, Eye, Loader2, UploadCloud } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminAdsPage() {
    const [slots, setSlots] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('campaigns');

    // Slot Modal
    const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
    const [slotData, setSlotData] = useState({ key: '', description: '', width: '', height: '' });

    // Campaign Modal
    const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
    const [campaignData, setCampaignData] = useState({ slotId: '', name: '', imageUrl: '', targetUrl: '', startsAt: '', endsAt: '' });
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [slotsRes, campaignsRes] = await Promise.all([
                fetch('/api/admin/ads/slots'),
                fetch('/api/admin/ads/campaigns')
            ]);
            if (slotsRes.ok && campaignsRes.ok) {
                const slotsData = await slotsRes.json();
                const campaignsData = await campaignsRes.json();
                setSlots(slotsData);
                setCampaigns(campaignsData);
            }
        } catch (error) {
            console.error(error);
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
                body: JSON.stringify(slotData)
            });
            if (res.ok) {
                setIsSlotModalOpen(false);
                setSlotData({ key: '', description: '', width: '', height: '' });
                fetchData();
            }
        } catch (error) {
            alert('Error creating slot');
        }
    };

    const handleDeleteSlot = async (id: string) => {
        if (!confirm('Start deletion?')) return;
        try {
            await fetch(`/api/admin/ads/slots?id=${id}`, { method: 'DELETE' });
            fetchData();
        } catch (error) { /* ignore */ }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        try {
            const res = await fetch('/api/admin/upload', {
                method: 'POST',
                body: formData,
            });
            if (res.ok) {
                const data = await res.json();
                setCampaignData({ ...campaignData, imageUrl: data.url });
            } else {
                alert('Upload failed');
            }
        } catch (error) {
            console.error(error);
            alert('Upload error');
        } finally {
            setUploading(false);
        }
    };

    const handleCreateCampaign = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/admin/ads/campaigns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(campaignData)
            });
            if (res.ok) {
                setIsCampaignModalOpen(false);
                setCampaignData({ slotId: '', name: '', imageUrl: '', targetUrl: '', startsAt: '', endsAt: '' });
                fetchData();
            } else {
                alert('Failed to create campaign');
            }
        } catch (error) {
            alert('Error creating campaign');
        }
    };

    const handleDeleteCampaign = async (id: string) => {
        if (!confirm('Delete this ad?')) return;
        try {
            await fetch(`/api/admin/ads/campaigns?id=${id}`, { method: 'DELETE' });
            fetchData();
        } catch (error) { /* ignore */ }
    };

    return (
        <AdminLayout>
            <Head>
                <title>Ad Management - Admin</title>
            </Head>

            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white">Ad Management</h1>
                    <p className="text-gray-400">Manage ad slots and active campaigns.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsSlotModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-surface border border-white/10 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                        <Layout size={18} /> New Slot
                    </button>
                    <button
                        onClick={() => {
                            if (slots.length === 0) {
                                alert('Please create an Ad Slot first.');
                                return;
                            }
                            setIsCampaignModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
                    >
                        <Plus size={18} /> New Campaign
                    </button>
                </div>
            </div>

            <div className="border-b border-white/10 mb-6 flex gap-6">
                <button
                    onClick={() => setActiveTab('campaigns')}
                    className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'campaigns' ? 'text-white border-primary' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
                >
                    All Campaigns
                </button>
                <button
                    onClick={() => setActiveTab('slots')}
                    className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'slots' ? 'text-white border-primary' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
                >
                    Ad Slots
                </button>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-500">Loading ads...</div>
            ) : (
                <>
                    {/* Campaigns Tab */}
                    {activeTab === 'campaigns' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {campaigns.map((ad: any) => (
                                <div key={ad.id} className="bg-surface border border-white/10 rounded-xl overflow-hidden group">
                                    <div className="h-40 bg-black/40 relative">
                                        <img src={ad.imageUrl} alt={ad.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                        <div className="absolute top-2 right-2 flex gap-1">
                                            <button
                                                onClick={() => handleDeleteCampaign(ad.id)}
                                                className="p-1.5 bg-black/60 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                        <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-xs text-white">
                                            {ad.slot.key}
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-white text-lg truncate pr-2">{ad.name}</h3>
                                            <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded whitespace-nowrap">
                                                {format(new Date(ad.startsAt), 'MMM d')} - {format(new Date(ad.endsAt), 'MMM d')}
                                            </span>
                                        </div>
                                        <a href={ad.targetUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline truncate block mb-4">
                                            {ad.targetUrl}
                                        </a>
                                        <div className="grid grid-cols-2 gap-2 text-center text-sm">
                                            <div className="bg-white/5 rounded p-2">
                                                <div className="text-gray-500 text-xs flex items-center justify-center gap-1 mb-0.5"><Eye size={10} /> Impressions</div>
                                                <div className="font-bold text-white">{ad.impressions}</div>
                                            </div>
                                            <div className="bg-white/5 rounded p-2">
                                                <div className="text-gray-500 text-xs flex items-center justify-center gap-1 mb-0.5"><MousePointer size={10} /> Clicks</div>
                                                <div className="font-bold text-white">{ad.clicks}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {campaigns.length === 0 && (
                                <div className="col-span-full py-12 text-center text-gray-500 bg-surface border border-white/10 rounded-xl">
                                    No active campaigns. Click "New Campaign" to create one.
                                </div>
                            )}
                        </div>
                    )}

                    {/* Slots Tab */}
                    {activeTab === 'slots' && (
                        <div className="bg-surface border border-white/10 rounded-xl overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-white/5 text-gray-400">
                                    <tr>
                                        <th className="px-6 py-4 font-medium">Slot Key</th>
                                        <th className="px-6 py-4 font-medium">Dimensions</th>
                                        <th className="px-6 py-4 font-medium">Active Ads</th>
                                        <th className="px-6 py-4 font-medium">Description</th>
                                        <th className="px-6 py-4 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {slots.map((slot: any) => (
                                        <tr key={slot.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 font-medium text-white">{slot.key}</td>
                                            <td className="px-6 py-4 text-gray-400">{slot.width}x{slot.height}</td>
                                            <td className="px-6 py-4 text-white">
                                                {slot._count?.campaigns || 0}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">{slot.description}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => handleDeleteSlot(slot.id)} className="text-gray-500 hover:text-red-400 transition-colors p-2">
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {slots.length === 0 && (
                                        <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No ad slots defined.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}

            {/* Create Slot Modal */}
            {isSlotModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-surface border border-white/10 rounded-xl p-6 w-full max-w-md shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-4">New Ad Slot</h3>
                        <form onSubmit={handleCreateSlot} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Slot Key (Unique)</label>
                                <input
                                    type="text"
                                    placeholder="e.g., homepage-top"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-primary outline-none"
                                    value={slotData.key}
                                    onChange={e => setSlotData({ ...slotData, key: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Width (px)</label>
                                    <input type="number" required className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white outline-none"
                                        value={slotData.width} onChange={e => setSlotData({ ...slotData, width: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Height (px)</label>
                                    <input type="number" required className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white outline-none"
                                        value={slotData.height} onChange={e => setSlotData({ ...slotData, height: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                                <textarea className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white outline-none"
                                    value={slotData.description} onChange={e => setSlotData({ ...slotData, description: e.target.value })} />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsSlotModalOpen(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg">Create Slot</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Create Campaign Modal */}
            {isCampaignModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-surface border border-white/10 rounded-xl p-6 w-full max-w-lg shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-4">New Ad Campaign</h3>
                        <form onSubmit={handleCreateCampaign} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Campaign Name</label>
                                <input type="text" required className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white outline-none"
                                    value={campaignData.name} onChange={e => setCampaignData({ ...campaignData, name: e.target.value })} />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Ad Slot</label>
                                <select required className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white outline-none"
                                    value={campaignData.slotId} onChange={e => setCampaignData({ ...campaignData, slotId: e.target.value })}>
                                    <option value="">Select a slot...</option>
                                    {slots.map((s: any) => <option key={s.id} value={s.id}>{s.key} ({s.width}x{s.height})</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Ad Image</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="file"
                                        hidden
                                        ref={fileInputRef}
                                        accept="image/*"
                                        onChange={handleUpload}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploading}
                                        className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
                                    >
                                        {uploading ? <Loader2 size={18} className="animate-spin" /> : <UploadCloud size={18} />}
                                        {uploading ? 'Uploading...' : 'Upload Image'}
                                    </button>
                                    {campaignData.imageUrl && (
                                        <div className="flex-1 text-xs text-green-400 truncate">
                                            Image uploaded successfully
                                        </div>
                                    )}
                                </div>
                                {campaignData.imageUrl && (
                                    <div className="mt-2 h-24 bg-black/40 rounded-lg overflow-hidden border border-white/5">
                                        <img src={campaignData.imageUrl} alt="Preview" className="h-full w-full object-contain" />
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Target URL</label>
                                <input type="url" required placeholder="https://" className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white outline-none"
                                    value={campaignData.targetUrl} onChange={e => setCampaignData({ ...campaignData, targetUrl: e.target.value })} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Start Date</label>
                                    <input type="date" required className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white outline-none"
                                        value={campaignData.startsAt} onChange={e => setCampaignData({ ...campaignData, startsAt: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">End Date</label>
                                    <input type="date" required className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white outline-none"
                                        value={campaignData.endsAt} onChange={e => setCampaignData({ ...campaignData, endsAt: e.target.value })} />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsCampaignModalOpen(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
                                <button type="submit" disabled={!campaignData.imageUrl} className="px-4 py-2 bg-primary text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
                                    Launch Campaign
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </AdminLayout>
    );
}
