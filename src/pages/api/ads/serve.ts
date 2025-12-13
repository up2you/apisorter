import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).end();
    }

    const { slotKey } = req.query;

    if (!slotKey) {
        return res.status(400).json({ error: 'Slot key required' });
    }

    try {
        const slot = await prisma.adSlot.findUnique({
            where: { key: String(slotKey) }
        });

        if (!slot) {
            return res.status(404).json({ error: 'Slot not found' });
        }

        // Find active campaigns for this slot
        // Logic: active date range
        const now = new Date();
        const campaign = await prisma.adCampaign.findFirst({
            where: {
                slotId: slot.id,
                startsAt: { lte: now },
                endsAt: { gte: now }
            },
            // Simple logic: pick the latest created one for now. 
            // Phase 2 could have "weight" or "rotation" logic.
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                imageUrl: true,
                targetUrl: true
            }
        });

        res.status(200).json({ campaign });
    } catch (error) {
        console.error('Ad Serve Error:', error);
        res.status(500).json({ error: 'Failed to serve ad' });
    }
}
