import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { slotKey } = req.query;

    if (!slotKey || typeof slotKey !== 'string') {
        return res.status(400).json({ message: 'Missing slotKey' });
    }

    try {
        // Find the slot and active campaigns
        const slot = await prisma.adSlot.findUnique({
            where: { key: slotKey },
            include: {
                campaigns: {
                    where: {
                        startsAt: { lte: new Date() },
                        endsAt: { gte: new Date() },
                    },
                    orderBy: { createdAt: 'desc' }, // Or random?
                }
            }
        });

        if (!slot || slot.campaigns.length === 0) {
            return res.status(404).json({ message: 'No active ads' });
        }

        // Simple logic: Pick the most recently created active campaign
        // Future: Add weights or rotation
        const campaign = slot.campaigns[0];

        res.status(200).json({
            id: campaign.id,
            imageUrl: campaign.imageUrl,
            targetUrl: campaign.targetUrl,
            width: slot.width,
            height: slot.height,
            name: campaign.name,
        });

    } catch (error) {
        console.error('Ad Render Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
