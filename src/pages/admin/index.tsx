import { useState } from 'react';
import { GetServerSideProps } from 'next';
import { AdminLayout } from '@/components/admin/AdminLayout';
import prisma from '@/lib/prisma';
import { Database, Server, Users, Activity, CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';
import { DiscoveryLog, DiscoveryStatus } from '@prisma/client';
import { formatDistanceToNow } from 'date-fns';

interface DashboardProps {
    counts: {
        providers: number;
        apis: number;
        users: number;
    };
    recentLogs: (DiscoveryLog & { source: { name: string } })[];
}

export default function AdminDashboard({ counts, recentLogs }: DashboardProps) {
    const [loading, setLoading] = useState(false);
    return (
        <AdminLayout>
            <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-surface p-6 rounded-lg border border-gray-800 flex items-center gap-4">
                    <div className="p-3 bg-primary/20 text-primary rounded-full">
                        <Server size={24} />
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm">Total Providers</p>
                        <p className="text-2xl font-bold">{counts.providers}</p>
                    </div>
                </div>

                <div className="bg-surface p-6 rounded-lg border border-gray-800 flex items-center gap-4">
                    <div className="p-3 bg-purple-500/20 text-purple-500 rounded-full">
                        <Database size={24} />
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm">Total APIs</p>
                        <p className="text-2xl font-bold">{counts.apis}</p>
                    </div>
                </div>

                <div className="bg-surface p-6 rounded-lg border border-gray-800 flex items-center gap-4">
                    <div className="p-3 bg-green-500/20 text-green-500 rounded-full">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm">Total Users</p>
                        <p className="text-2xl font-bold">{counts.users}</p>
                    </div>
                </div>
            </div>

            <div className="mt-12">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Activity size={20} />
                        <span>Recent Activity</span>
                    </h2>
                    <a
                        href="https://github.com/your-username/apisorter/actions"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors text-sm flex items-center gap-2"
                    >
                        <span>View Crawler Status</span>
                        <Activity size={16} />
                    </a>
                </div>
                <div className="bg-surface rounded-lg border border-gray-800 overflow-hidden">
                    {recentLogs.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No recent activity to show.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-white/5 text-gray-400">
                                    <tr>
                                        <th className="p-4 font-medium">Status</th>
                                        <th className="p-4 font-medium">Source</th>
                                        <th className="p-4 font-medium">Title / URL</th>
                                        <th className="p-4 font-medium">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {recentLogs.map((log) => (
                                        <tr key={log.id} className="hover:bg-white/5 transition-colors">
                                            <td className="p-4">
                                                {log.status === DiscoveryStatus.PROCESSED ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500">
                                                        <CheckCircle size={14} /> Processed
                                                    </span>
                                                ) : log.status === DiscoveryStatus.ERROR ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-500">
                                                        <XCircle size={14} /> Error
                                                    </span>
                                                ) : log.status === DiscoveryStatus.IGNORED ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-500/10 text-gray-400">
                                                        <AlertCircle size={14} /> Ignored
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500">
                                                        <Clock size={14} /> Pending
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 text-gray-300">
                                                {log.source.name}
                                            </td>
                                            <td className="p-4 max-w-md">
                                                <div className="truncate font-medium text-white" title={log.title || ''}>
                                                    {log.title || 'No Title'}
                                                </div>
                                                <div className="truncate text-xs text-gray-500" title={log.url}>
                                                    {log.url}
                                                </div>
                                                {log.errorMessage && (
                                                    <div className="text-xs text-red-400 mt-1 truncate" title={log.errorMessage}>
                                                        {log.errorMessage}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-4 text-gray-400 whitespace-nowrap">
                                                {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const [providers, apis, users, recentLogs] = await Promise.all([
        prisma.provider.count(),
        prisma.api.count(),
        prisma.user.count(),
        prisma.discoveryLog.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
                source: {
                    select: { name: true }
                }
            }
        })
    ]);

    return {
        props: {
            counts: {
                providers,
                apis,
                users,
            },
            recentLogs: JSON.parse(JSON.stringify(recentLogs)), // Serialize dates
        },
    };
};
