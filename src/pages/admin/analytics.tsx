import { useState } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { AdminLayout } from '@/components/admin/AdminLayout';
import prisma from '@/lib/prisma';
import { TrendingUp, DollarSign, MousePointer, Eye, Cpu, Users, Tag, CalendarDays } from 'lucide-react';
import { format, startOfDay, startOfWeek } from 'date-fns';

interface AnalyticsProps {
    topApis: Array<{ name: string; views: number; clicks: number }>;
    dailyStats: Array<{
        date: string;
        apiViews: number;
        totalAiCost: number;
        totalRevenue: number;
        newUsers: number;
    }>;
    categoryStats: Array<{ category: string; count: number }>;
    totalRevenue: number;
    todayRevenue: number;
    weekRevenue: number;
    totalAiCost: number;
}

export default function AdminAnalytics({ topApis, dailyStats, categoryStats, totalRevenue, todayRevenue, weekRevenue, totalAiCost }: AnalyticsProps) {
    // Simple bar chart renderer using CSS
    const renderBarChart = (data: any[], valueKey: string, colorClass: string, height: number = 64) => {
        if (!data || data.length === 0) return <div className="text-gray-500 text-sm">No data available</div>;

        const maxValue = Math.max(...data.map(d => d[valueKey] || 0), 1);

        return (
            <div className={`flex items-end gap-1 h-${height} mt-4`}>
                {data.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col justify-end group relative">
                        <div
                            className={`w-full rounded-t-sm ${colorClass} opacity-80 group-hover:opacity-100 transition-all`}
                            style={{ height: `${Math.max((d[valueKey] / maxValue) * 100, 5)}%` }}
                        ></div>
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10 bg-black border border-white/20 p-2 rounded text-xs whitespace-nowrap shadow-xl">
                            <div className="font-bold mb-1">{format(new Date(d.date), 'MMM d')}</div>
                            <div>{d[valueKey].toLocaleString()}</div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <AdminLayout>
            <Head>
                <title>Analytics - Admin</title>
            </Head>

            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white">Analytics</h1>
                <p className="text-gray-400">System performance, revenue, and usage trends.</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-surface border border-white/10 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-500/20 text-green-500 rounded-lg">
                            <DollarSign size={20} />
                        </div>
                        <span className="text-gray-400 text-sm">Total Revenue</span>
                    </div>
                    <div className="text-2xl font-bold text-white">${totalRevenue.toFixed(2)}</div>
                </div>

                <div className="bg-surface border border-white/10 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-500/20 text-emerald-500 rounded-lg">
                            <CalendarDays size={20} />
                        </div>
                        <span className="text-gray-400 text-sm">Today's Revenue</span>
                    </div>
                    <div className="text-2xl font-bold text-white">${todayRevenue.toFixed(2)}</div>
                </div>

                <div className="bg-surface border border-white/10 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-teal-500/20 text-teal-500 rounded-lg">
                            <CalendarDays size={20} />
                        </div>
                        <span className="text-gray-400 text-sm">This Week</span>
                    </div>
                    <div className="text-2xl font-bold text-white">${weekRevenue.toFixed(2)}</div>
                </div>

                <div className="bg-surface border border-white/10 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-500/20 text-purple-500 rounded-lg">
                            <Cpu size={20} />
                        </div>
                        <span className="text-gray-400 text-sm">AI Cost (Est.)</span>
                    </div>
                    <div className="text-2xl font-bold text-white">${totalAiCost.toFixed(4)}</div>
                </div>

                <div className="bg-surface border border-white/10 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-500/20 text-blue-500 rounded-lg">
                            <Eye size={20} />
                        </div>
                        <span className="text-gray-400 text-sm">Page Views (Today)</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                        {dailyStats.length > 0 ? dailyStats[dailyStats.length - 1].apiViews : 0}
                    </div>
                </div>

                <div className="bg-surface border border-white/10 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-orange-500/20 text-orange-500 rounded-lg">
                            <Users size={20} />
                        </div>
                        <span className="text-gray-400 text-sm">New Users (Today)</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                        {dailyStats.length > 0 ? dailyStats[dailyStats.length - 1].newUsers : 0}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* AI Cost Trend */}
                <div className="bg-surface border border-white/10 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Cpu size={18} className="text-purple-400" />
                        AI Cost Trend (30 Days)
                    </h3>
                    <div className="h-48 flex items-end">
                        {renderBarChart(dailyStats, 'totalAiCost', 'bg-purple-500')}
                    </div>
                </div>

                {/* Revenue Trend */}
                <div className="bg-surface border border-white/10 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <DollarSign size={18} className="text-green-400" />
                        Revenue Trend (30 Days)
                    </h3>
                    <div className="h-48 flex items-end">
                        {renderBarChart(dailyStats, 'totalRevenue', 'bg-green-500')}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Page Views Trend */}
                <div className="bg-surface border border-white/10 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Eye size={18} className="text-blue-400" />
                        Page Views Trend
                    </h3>
                    <div className="h-48 flex items-end">
                        {renderBarChart(dailyStats, 'apiViews', 'bg-blue-500')}
                    </div>
                </div>

                {/* New Users Trend */}
                <div className="bg-surface border border-white/10 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Users size={18} className="text-orange-400" />
                        New Users Growth
                    </h3>
                    <div className="h-48 flex items-end">
                        {renderBarChart(dailyStats, 'newUsers', 'bg-orange-500')}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Top APIs Table */}
                <div className="lg:col-span-2 bg-surface border border-white/10 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <TrendingUp size={18} className="text-accent" />
                        Top APIs by Traffic
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white/5 text-gray-400">
                                <tr>
                                    <th className="px-6 py-3 font-medium">API Name</th>
                                    <th className="px-6 py-3 font-medium text-right">Views</th>
                                    <th className="px-6 py-3 font-medium text-right">Clicks</th>
                                    <th className="px-6 py-3 font-medium text-right">CTR</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {topApis.map((api, i) => {
                                    const ctr = api.views > 0 ? (api.clicks / api.views) * 100 : 0;
                                    return (
                                        <tr key={i} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-3 font-medium text-white">{api.name}</td>
                                            <td className="px-6 py-3 text-right text-gray-300">{api.views}</td>
                                            <td className="px-6 py-3 text-right text-gray-300">{api.clicks}</td>
                                            <td className="px-6 py-3 text-right text-gray-300">{ctr.toFixed(1)}%</td>
                                        </tr>
                                    );
                                })}
                                {topApis.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No traffic data yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Category Distribution */}
                <div className="bg-surface border border-white/10 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <Tag size={18} className="text-pink-400" />
                        API Categories
                    </h3>
                    <div className="space-y-4">
                        {categoryStats.map((stat, i) => {
                            const maxCount = Math.max(...categoryStats.map(c => c.count));
                            const percentage = (stat.count / maxCount) * 100;

                            return (
                                <div key={i}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-white font-medium">{stat.category}</span>
                                        <span className="text-gray-400">{stat.count}</span>
                                    </div>
                                    <div className="w-full bg-white/5 rounded-full h-2">
                                        <div
                                            className="bg-pink-500 h-2 rounded-full"
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                        {categoryStats.length === 0 && (
                            <div className="text-center text-gray-500 py-4">No categories found.</div>
                        )}
                    </div>
                </div>
            </div>

        </AdminLayout>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    // 1. Get Top APIs
    const topApis = await prisma.api.findMany({
        orderBy: { views: 'desc' },
        take: 10,
        select: { name: true, views: true, clicks: true }
    });

    // 2. Get Daily Stats (Last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyStats = await prisma.dailySystemStat.findMany({
        where: { date: { gte: thirtyDaysAgo } },
        orderBy: { date: 'asc' },
    });

    // 3. Totals
    const aiCostAgg = await prisma.aiUsageLog.aggregate({
        _sum: { cost: true }
    });

    // Total Revenue from Payments
    const revenueAgg = await prisma.payment.aggregate({
        where: { status: 'paid' },
        _sum: { amountUsd: true }
    });

    // Today Revenue
    const todayStart = startOfDay(new Date());
    const todayRevenueAgg = await prisma.payment.aggregate({
        where: {
            status: 'paid',
            createdAt: { gte: todayStart }
        },
        _sum: { amountUsd: true }
    });

    // Week Revenue
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday start
    const weekRevenueAgg = await prisma.payment.aggregate({
        where: {
            status: 'paid',
            createdAt: { gte: weekStart }
        },
        _sum: { amountUsd: true }
    });

    // 4. Category Statistics
    const categoryGroups = await prisma.api.groupBy({
        by: ['category'],
        _count: {
            category: true
        },
    });

    const categoryStats = categoryGroups
        .map(group => ({
            category: group.category,
            count: group._count.category
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Top 10 categories

    return {
        props: {
            topApis,
            dailyStats: JSON.parse(JSON.stringify(dailyStats)),
            categoryStats,
            totalRevenue: revenueAgg._sum.amountUsd || 0,
            todayRevenue: todayRevenueAgg._sum.amountUsd || 0,
            weekRevenue: weekRevenueAgg._sum.amountUsd || 0,
            totalAiCost: aiCostAgg._sum.cost || 0,
        }
    };
};
