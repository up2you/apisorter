import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user || session.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Unauthorized' });
    }

    if (req.method === 'POST') {
        try {
            const { theme, primaryColor, backgroundColor, surfaceColor, textColor, fontFamily, borderRadius } = req.body;

            const existing = await prisma.globalSettings.findFirst();

            if (existing) {
                await prisma.globalSettings.update({
                    where: { id: existing.id },
                    data: { theme, primaryColor, backgroundColor, surfaceColor, textColor, fontFamily, borderRadius },
                });
            } else {
                await prisma.globalSettings.create({
                    data: { theme, primaryColor, backgroundColor, surfaceColor, textColor, fontFamily, borderRadius },
                });
            }

            res.status(200).json({ message: 'Settings saved' });
        } catch (error) {
            console.error('Failed to save settings:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
