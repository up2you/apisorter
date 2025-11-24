import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const settings = await prisma.globalSettings.findFirst();
        res.status(200).json(settings || {});
    } catch (error) {
        console.error('Failed to fetch settings:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
