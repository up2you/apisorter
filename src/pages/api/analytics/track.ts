import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { type, apiId } = req.body; // type: 'view' | 'click'

    if (!apiId || !['view', 'click'].includes(type)) {
        return res.status(400).json({ message: 'Invalid request' });
    }

    try {
        if (type === 'view') {
            // Increment view count
            await prisma.api.update({
                where: { id: apiId },
                data: { views: { increment: 1 } }
            });

            // Update Daily Stat (Optional: separate call or aggregated later)
            // For simplicity and performance, we might skip detailed daily stats on every view 
            // to avoid lock contention on the single DailySystemStat row.
            // But if needed, we could upsert to DailySystemStat where date = today.

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            await prisma.dailySystemStat.upsert({
                where: { date: today },
                update: { apiViews: { increment: 1 } },
                create: {
                    date: today,
                    apiViews: 1,
                    apiClicks: 0,
                    totalRevenue: 0,
                    totalAiCost: 0,
                    newUsers: 0
                }
            });

        } else if (type === 'click') {
            await prisma.api.update({
                where: { id: apiId },
                data: { clicks: { increment: 1 } }
            });

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            await prisma.dailySystemStat.upsert({
                where: { date: today },
                update: { apiClicks: { increment: 1 } },
                create: {
                    date: today,
                    apiViews: 0,
                    apiClicks: 1,
                    totalRevenue: 0,
                    totalAiCost: 0,
                    newUsers: 0
                }
            });
        }

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Analytics error:', error);
        // Don't fail the client request if analytics fails
        return res.status(200).json({ success: true, error: 'ignored' });
    }
}
