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
            const { slotId } = req.query;
            const where = slotId ? { slotId: slotId as string } : {};

            const campaigns = await prisma.adCampaign.findMany({
                where,
                include: { slot: true },
                orderBy: { createdAt: 'desc' }
            });
            res.status(200).json(campaigns);
        } catch (error) {
            res.status(500).json({ message: 'Failed to fetch campaigns' });
        }
    } else if (req.method === 'POST') {
        try {
            const { slotId, name, imageUrl, targetUrl, startsAt, endsAt } = req.body;

            const campaign = await prisma.adCampaign.create({
                data: {
                    slotId,
                    name,
                    imageUrl,
                    targetUrl,
                    startsAt: new Date(startsAt),
                    endsAt: new Date(endsAt),
                }
            });
            res.status(201).json(campaign);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Failed to create campaign' });
        }
    } else if (req.method === 'DELETE') {
        try {
            const { id } = req.query;
            if (typeof id !== 'string') return res.status(400).json({ message: 'Invalid ID' });

            await prisma.adCampaign.delete({ where: { id } });
            res.status(200).json({ message: 'Campaign deleted' });
        } catch (error) {
            res.status(500).json({ message: 'Failed to delete campaign' });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
