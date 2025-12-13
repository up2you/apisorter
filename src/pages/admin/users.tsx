import { useState } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { AdminLayout } from '@/components/admin/AdminLayout';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Search, Mail, Shield, User as UserIcon, Calendar, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';

interface UserData {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    role: string;
    createdAt: string;
    subscriptions: Array<{
        status: string;
        plan: { name: string };
    }>;
}

interface AdminUsersProps {
    users: UserData[];
}

export default function AdminUsers({ users: initialUsers }: AdminUsersProps) {
    const [users, setUsers] = useState(initialUsers);
    const [search, setSearch] = useState('');

    const filteredUsers = users.filter(user =>
        (user.name?.toLowerCase().includes(search.toLowerCase()) || '') ||
        user.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AdminLayout>
            <Head>
                <title>Users - Admin</title>
            </Head>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white">User Management</h1>
                    <p className="text-gray-400">View and manage registered users.</p>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-surface border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-accent outline-none w-full md:w-64"
                    />
                </div>
            </div>

            <div className="bg-surface border border-white/10 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-gray-400">
                            <tr>
                                <th className="px-6 py-4 font-medium">User</th>
                                <th className="px-6 py-4 font-medium">Role</th>
                                <th className="px-6 py-4 font-medium">Subscription</th>
                                <th className="px-6 py-4 font-medium">Joined</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <Link href={`/admin/users/${user.id}`} className="flex items-center gap-3 group">
                                            <div className="h-10 w-10 rounded-full bg-white/10 overflow-hidden flex items-center justify-center group-hover:ring-2 ring-primary transition-all">
                                                {user.image ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={user.image} alt="" className="h-full w-full object-cover" />
                                                ) : (
                                                    <UserIcon size={20} className="text-gray-400" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-medium text-white group-hover:text-primary transition-colors">{user.name || 'No Name'}</div>
                                                <div className="text-gray-500 text-xs flex items-center gap-1">
                                                    <Mail size={10} />
                                                    {user.email}
                                                </div>
                                            </div>
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${user.role === 'ADMIN'
                                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                            : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                                            }`}>
                                            <Shield size={12} />
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.subscriptions && user.subscriptions.length > 0 && user.subscriptions[0].status === 'active' ? (
                                            <span className="inline-flex px-2 py-1 rounded bg-green-500/10 text-green-400 text-xs font-medium border border-green-500/20">
                                                {user.subscriptions[0].plan.name}
                                            </span>
                                        ) : (
                                            <span className="text-gray-500 text-xs">Free Plan</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-gray-400">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar size={14} />
                                            {format(new Date(user.createdAt), 'MMM d, yyyy')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            href={`/admin/users/${user.id}`}
                                            className="text-gray-500 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10 inline-block"
                                        >
                                            <MoreVertical size={16} />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredUsers.length === 0 && (
                    <div className="p-12 text-center text-gray-500">
                        No users found matching your search.
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100, // Limit for now
        select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
            createdAt: true,
            subscriptions: {
                where: { status: 'active' },
                select: {
                    status: true,
                    plan: { select: { name: true } }
                }
            }
        }
    });

    return {
        props: {
            users: JSON.parse(JSON.stringify(users)),
        }
    };
};
