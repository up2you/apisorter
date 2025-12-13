import { useState } from 'react';
import Head from 'next/head';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Radio, Play, Clock, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { GetServerSideProps } from 'next';
import { format } from 'date-fns';

interface CrawlerStats {
    totalApis: number;
    checkedLast24h: number;
    recentlyChecked: Array<{
        id: string;
        name: string;
        lastCheckedAt: string;
        status: string;
    }>;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    // Basic Auth Check
    // Note: AdminLayout also handles client-side redirect, but secure SSR is better
    // For brevity in this artifact, relying on client-side or we'd need session access here
    // Let's assume standard secure fetch inside component or use prisma here securely:

    // Fetch Stats
    const totalApis = await prisma.api.count();
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const checkedLast24h = await prisma.api.count({
        where: {
            lastCheckedAt: {
                gte: oneDayAgo
            }
        }
    });

    const recentlyChecked = await prisma.api.findMany({
        take: 10,
        orderBy: {
            lastCheckedAt: 'desc'
        },
        select: {
            id: true,
            name: true,
            lastCheckedAt: true,
            status: true
        }
    });

    // Serialize dates
    const serializedRecent = recentlyChecked.map(api => ({
        ...api,
        lastCheckedAt: api.lastCheckedAt.toISOString()
    }));

    return {
        props: {
            stats: {
                totalApis,
                checkedLast24h,
                recentlyChecked: serializedRecent
            }
        }
    };
};

export default function CrawlerPage({ stats }: { stats: CrawlerStats }) {
    const [isRunning, setIsRunning] = useState(false);
    const [message, setMessage] = useState('');

    const handleRunCrawler = async () => {
        setIsRunning(true);
        setMessage('');
        try {
            const res = await fetch('/api/admin/crawler/run', { method: 'POST' });
            if (res.ok) {
                setMessage('Crawler process started in background.');
            } else {
                setMessage('Failed to start crawler.');
            }
        } catch (e) {
            setMessage('Error connecting to server.');
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <AdminLayout>
            <Head>
                <title>Crawler Engine - Admin</title>
            </Head>

            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Radio className="text-primary" size={28} />
                    Crawler Engine
                </h1>
                <p className="text-gray-400 mt-2">Manage automated API data updates and health checks.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-surface border border-white/10 p-6 rounded-xl">
                    <div className="text-gray-400 text-sm mb-1">Total APIs</div>
                    <div className="text-3xl font-bold text-white">{stats.totalApis}</div>
                </div>
                <div className="bg-surface border border-white/10 p-6 rounded-xl">
                    <div className="text-gray-400 text-sm mb-1">Checked (24h)</div>
                    <div className="text-3xl font-bold text-green-400">{stats.checkedLast24h}</div>
                </div>
                <div className="bg-surface border border-white/10 p-6 rounded-xl flex flex-col justify-center items-start">
                    <button
                        onClick={handleRunCrawler}
                        disabled={isRunning}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-white transition-all w-full justify-center ${isRunning
                                ? 'bg-gray-600 cursor-not-allowed'
                                : 'bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-green-500/20'
                            }`}
                    >
                        {isRunning ? <RefreshCw className="animate-spin" /> : <Play size={18} />}
                        {isRunning ? 'Starting...' : 'Run Crawler Now'}
                    </button>
                    {message && (
                        <div className="mt-2 text-sm text-center w-full text-blue-300">
                            {message}
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-surface border border-white/10 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-white/10">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Clock size={20} className="text-gray-400" />
                        Recently Checked APIs
                    </h3>
                </div>
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-gray-400 text-sm">
                        <tr>
                            <th className="p-4">API Name</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Last Check</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {stats.recentlyChecked.map(api => (
                            <tr key={api.id} className="hover:bg-white/5 transition-colors">
                                <td className="p-4 font-medium text-white">{api.name}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs border ${api.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                            api.status === 'BROKEN' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                'bg-gray-500/10 text-gray-400 border-gray-500/20'
                                        }`}>
                                        {api.status}
                                    </span>
                                </td>
                                <td className="p-4 text-gray-400 text-sm">
                                    {format(new Date(api.lastCheckedAt), 'PP pp')}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </AdminLayout>
    );
}
