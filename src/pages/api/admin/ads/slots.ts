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
            const slots = await prisma.adSlot.findMany({
                include: {
                    campaigns: {
                        where: {
                            endsAt: { gt: new Date() }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });
            res.status(200).json(slots);
        } catch (error) {
            res.status(500).json({ message: 'Failed to fetch slots' });
        }
    } else if (req.method === 'POST') {
        try {
            const { key, description, width, height } = req.body;

            // Validate key format (alphanumeric + dashes/underscores)
            if (!/^[a-zA-Z0-9-_]+$/.test(key)) {
                return res.status(400).json({ message: 'Invalid key format' });
            }

            const slot = await prisma.adSlot.create({
                data: {
                    key,
                    description,
                    width: width ? parseInt(width) : null,
                    height: height ? parseInt(height) : null,
                }
            });
            res.status(201).json(slot);
        } catch (error: any) {
            if (error.code === 'P2002') {
                return res.status(400).json({ message: 'Slot key already exists' });
            }
            res.status(500).json({ message: 'Failed to create slot' });
        }
    } else if (req.method === 'DELETE') {
        try {
            const { id } = req.query;
            if (typeof id !== 'string') return res.status(400).json({ message: 'Invalid ID' });

            await prisma.adSlot.delete({ where: { id } });
            res.status(200).json({ message: 'Slot deleted' });
        } catch (error) {
            res.status(500).json({ message: 'Failed to delete slot' });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
