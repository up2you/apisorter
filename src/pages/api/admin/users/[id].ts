import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import prisma from '@/lib/prisma';
import { UserRole } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user || session.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Unauthorized' });
    }

    const { id } = req.query;
    const userId = String(id);

    if (req.method === 'GET') {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: {
                    accounts: { select: { provider: true } },
                    subscriptions: {
                        include: {
                            plan: true,
                            payments: { orderBy: { createdAt: 'desc' }, take: 5 }
                        },
                        orderBy: { createdAt: 'desc' }
                    },
                    reviews: { orderBy: { createdAt: 'desc' }, take: 5, include: { api: true } },
                    favorites: { orderBy: { createdAt: 'desc' }, take: 5, include: { api: true } },
                    sessions: { orderBy: { createdAt: 'desc' }, take: 1 },
                }
            });

            if (!user) return res.status(404).json({ error: 'User not found' });

            // Calculate extra stats
            const totalPayments = await prisma.payment.aggregate({
                where: { subscription: { userId: userId } },
                _sum: { amountUsd: true },
                _count: { id: true }
            });

            const stats = {
                totalSpend: totalPayments._sum.amountUsd || 0,
                paymentCount: totalPayments._count.id,
                reviewCount: await prisma.review.count({ where: { userId: userId } }),
                favoriteCount: await prisma.favorite.count({ where: { userId: userId } }),
                apiFollowCount: await prisma.apiFollower.count({ where: { userId: userId } })
            };

            res.status(200).json({ ...user, stats });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch user details' });
        }
    }
    else if (req.method === 'PUT') {
        try {
            const { name, role } = req.body;

            // Validate Role
            if (role && !Object.values(UserRole).includes(role)) {
                return res.status(400).json({ error: 'Invalid role' });
            }

            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: { name, role }
            });

            res.status(200).json(updatedUser);
        } catch (error) {
            res.status(500).json({ error: 'Failed to update user' });
        }
    }
    else if (req.method === 'DELETE') {
        // Prevent deleting self
        if (userId === session.user.id) {
            return res.status(400).json({ error: 'Cannot delete your own admin account' });
        }

        try {
            await prisma.user.delete({
                where: { id: userId }
            });
            res.status(200).json({ success: true });
        } catch (error) {
            console.error('Delete User Failed:', error);
            res.status(500).json({ error: 'Failed to delete user' });
        }
    }
    else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
