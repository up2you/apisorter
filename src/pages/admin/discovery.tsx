import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
    Globe,
    Play,
    Plus,
    Trash2,
    RefreshCw,
    CheckCircle,
    XCircle,
    Power,
    Loader2
} from 'lucide-react';
import Head from 'next/head';
import { formatDistanceToNow } from 'date-fns';

interface Source {
    id: string;
    name: string;
    url: string;
    type: string;
    enabled: boolean;
    lastCheckedAt: string | null;
}

export default function AdminDiscovery() {
    const [sources, setSources] = useState<Source[]>([]);
    const [loading, setLoading] = useState(true);
    const [runningDiscovery, setRunningDiscovery] = useState(false);
    const [runningCrawler, setRunningCrawler] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Modal state
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newSource, setNewSource] = useState({ name: '', url: '', type: 'RSS' });

    useEffect(() => {
        fetchSources();
    }, []);

    const fetchSources = async () => {
        try {
            const res = await fetch('/api/admin/sources');
            if (res.ok) {
                setSources(await res.json());
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSource = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/admin/sources', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSource)
            });

            if (res.ok) {
                setIsAddOpen(false);
                setNewSource({ name: '', url: '', type: 'RSS' });
                fetchSources();
                setMessage({ type: 'success', text: 'Source added successfully' });
            } else {
                setMessage({ type: 'error', text: 'Failed to add source' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Error adding source' });
        }
    };

    const toggleSource = async (id: string, currentEnabled: boolean) => {
        try {
            const res = await fetch(`/api/admin/sources/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ enabled: !currentEnabled })
            });
            if (res.ok) fetchSources();
        } catch (err) {
            console.error(err);
        }
    };

    const deleteSource = async (id: string) => {
        if (!confirm('Are you sure you want to delete this source?')) return;
        try {
            const res = await fetch(`/api/admin/sources/${id}`, { method: 'DELETE' });
            if (res.ok) fetchSources();
        } catch (err) {
            console.error(err);
        }
    };

    const runDiscovery = async () => {
        setRunningDiscovery(true);
        setMessage(null);
        try {
            const res = await fetch('/api/admin/discovery/run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ maxItems: 3 })
            });
            const data = await res.json();
            if (res.ok) {
                setMessage({ type: 'success', text: `Discovery complete. Processed ${data.processed} items. Found: ${data.results.length} results.` });
                fetchSources(); // Update last checked times
            } else {
                setMessage({ type: 'error', text: data.error || 'Discovery failed' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Network error during discovery' });
        } finally {
            setRunningDiscovery(false);
        }
    };

    const runCrawler = async () => {
        setRunningCrawler(true);
        setMessage(null);
        try {
            const res = await fetch('/api/admin/crawler/run', { method: 'POST' });
            if (res.ok) {
                setMessage({ type: 'success', text: 'Deep crawler started in background.' });
            } else {
                setMessage({ type: 'error', text: 'Failed to start crawler' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Network error starting crawler' });
        } finally {
            setRunningCrawler(false);
        }
    };

    return (
        <AdminLayout>
            <Head>
                <title>Discovery & Crawler - Admin</title>
            </Head>

            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Globe className="text-blue-400" />
                        Discovery & Crawler
                    </h1>
                    <p className="text-gray-400">Manage API discovery sources and trigger crawlers.</p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={runDiscovery}
                        disabled={runningDiscovery}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                        {runningDiscovery ? <Loader2 className="animate-spin" size={18} /> : <Play size={18} />}
                        Run Discovery (RSS)
                    </button>
                    <button
                        onClick={runCrawler}
                        disabled={runningCrawler}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                        {runningCrawler ? <Loader2 className="animate-spin" size={18} /> : <RefreshCw size={18} />}
                        Run Deep Crawler
                    </button>
                </div>
            </div>

            {message && (
                <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                    {message.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
                    {message.text}
                </div>
            )}

            <div className="bg-surface border border-white/10 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-white">Discovery Sources</h2>
                    <button
                        onClick={() => setIsAddOpen(true)}
                        className="flex items-center gap-2 text-sm bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-md transition-colors"
                    >
                        <Plus size={16} />
                        Add Source
                    </button>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading sources...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white/5 text-gray-400">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Name</th>
                                    <th className="px-6 py-3 font-medium">URL</th>
                                    <th className="px-6 py-3 font-medium">Type</th>
                                    <th className="px-6 py-3 font-medium">Last Checked</th>
                                    <th className="px-6 py-3 font-medium">Status</th>
                                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {sources.map((source) => (
                                    <tr key={source.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-medium text-white">{source.name}</td>
                                        <td className="px-6 py-4 text-gray-400 truncate max-w-xs" title={source.url}>{source.url}</td>
                                        <td className="px-6 py-4 text-gray-400">
                                            <span className="px-2 py-1 bg-white/10 rounded text-xs">{source.type}</span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-400">
                                            {source.lastCheckedAt
                                                ? formatDistanceToNow(new Date(source.lastCheckedAt), { addSuffix: true })
                                                : 'Never'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => toggleSource(source.id, source.enabled)}
                                                className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium border ${source.enabled
                                                        ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                                        : 'bg-gray-500/10 text-gray-500 border-gray-500/20'
                                                    }`}
                                            >
                                                <Power size={12} />
                                                {source.enabled ? 'Enabled' : 'Disabled'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => deleteSource(source.id)}
                                                className="text-gray-500 hover:text-red-400 transition-colors p-1"
                                                title="Delete Source"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {sources.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-gray-500">
                                            No discovery sources configured. Add one to start finding APIs.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add Source Modal */}
            {isAddOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-surface border border-white/10 rounded-xl p-6 w-full max-w-md shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-4">Add Discovery Source</h3>
                        <form onSubmit={handleAddSource} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Source Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                    placeholder="e.g. TechCrunch"
                                    value={newSource.name}
                                    onChange={e => setNewSource({ ...newSource, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">RSS/Feed URL</label>
                                <input
                                    type="url"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                    placeholder="https://"
                                    value={newSource.url}
                                    onChange={e => setNewSource({ ...newSource, url: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsAddOpen(false)}
                                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors font-medium"
                                >
                                    Add Source
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
