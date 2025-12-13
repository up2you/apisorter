import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user || session.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Unauthorized' });
    }

    if (req.method === 'GET') {
        try {
            const subscriptions = await prisma.subscription.findMany({
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            image: true,
                        }
                    },
                    plan: {
                        select: {
                            name: true,
                            priceUsd: true,
                            billingCycle: true,
                        }
                    },
                    payments: {
                        orderBy: { createdAt: 'desc' },
                        take: 1
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });

            return res.status(200).json(subscriptions);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Failed to fetch subscriptions' });
        }
    } else {
        return res.status(405).json({ message: 'Method not allowed' });
    }
}
