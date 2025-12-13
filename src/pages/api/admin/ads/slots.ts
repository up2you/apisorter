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
        const slots = await prisma.adSlot.findMany({
            include: { _count: { select: { campaigns: true } } }
        });
        res.status(200).json(slots);
    }
    else if (req.method === 'POST') {
        const { key, description, width, height } = req.body;
        try {
            const slot = await prisma.adSlot.create({
                data: {
                    key,
                    description,
                    width: width ? parseInt(width) : null,
                    height: height ? parseInt(height) : null
                }
            });
            res.status(200).json(slot);
        } catch (error) {
            res.status(500).json({ error: 'Failed to create slot' });
        }
    }
    else if (req.method === 'DELETE') {
        const { id } = req.query;
        try {
            await prisma.adSlot.delete({ where: { id: String(id) } });
            res.status(200).json({ success: true });
        } catch (error) {
            res.status(500).json({ error: 'Failed to delete slot' });
        }
    }
    else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
