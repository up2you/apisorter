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
        const campaigns = await prisma.adCampaign.findMany({
            include: { slot: true },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(campaigns);
    }
    else if (req.method === 'POST') {
        const { slotId, name, imageUrl, targetUrl, startsAt, endsAt } = req.body;
        try {
            const campaign = await prisma.adCampaign.create({
                data: {
                    slotId,
                    name,
                    imageUrl,
                    targetUrl,
                    startsAt: new Date(startsAt),
                    endsAt: new Date(endsAt)
                }
            });
            res.status(200).json(campaign);
        } catch (error) {
            console.error('Create Campaign Failed:', error);
            res.status(500).json({ error: 'Failed to create campaign' });
        }
    }
    else if (req.method === 'DELETE') {
        const { id } = req.query;
        try {
            await prisma.adCampaign.delete({ where: { id: String(id) } });
            res.status(200).json({ success: true });
        } catch (error) {
            res.status(500).json({ error: 'Failed to delete campaign' });
        }
    }
    else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
