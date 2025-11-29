import { useState } from 'react';
import { GetServerSideProps } from 'next';
import { AdminLayout } from '@/components/admin/AdminLayout';
import prisma from '@/lib/prisma';
import { Database, Server, Users, Activity } from 'lucide-react';

interface DashboardProps {
    counts: {
        providers: number;
        apis: number;
        users: number;
    };
}

export default function AdminDashboard({ counts }: DashboardProps) {
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
                <div className="bg-surface rounded-lg border border-gray-800 p-8 text-center text-gray-500">
                    No recent activity to show.
                </div>
            </div>
        </AdminLayout>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const [providers, apis, users] = await Promise.all([
        prisma.provider.count(),
        prisma.api.count(),
        prisma.user.count(),
    ]);

    return {
        props: {
            counts: {
                providers,
                apis,
                users,
            },
        },
    };
};
