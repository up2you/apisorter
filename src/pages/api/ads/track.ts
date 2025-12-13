import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).end();
    }

    const { campaignId, type } = req.body; // type: 'impression' | 'click'

    if (!campaignId || !['impression', 'click'].includes(type)) {
        return res.status(400).json({ error: 'Invalid request' });
    }

    try {
        if (type === 'impression') {
            await prisma.adCampaign.update({
                where: { id: campaignId },
                data: { impressions: { increment: 1 } }
            });
        } else {
            await prisma.adCampaign.update({
                where: { id: campaignId },
                data: { clicks: { increment: 1 } }
            });
        }
        res.status(200).json({ success: true });
    } catch (error) {
        // Fail silently for tracking to not impact UX
        console.error('Ad Tracking Failed', error);
        res.status(400).end();
    }
}
