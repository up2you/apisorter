import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);
    const { id } = req.query;

    if (!session || !session.user || session.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Unauthorized' });
    }

    if (typeof id !== 'string') {
        return res.status(400).json({ message: 'Invalid ID' });
    }

    if (req.method === 'PUT') {
        try {
            const {
                name, category, description, docsUrl, pricingUrl, changelogUrl, status,
                registrationUrl, sourceUrl, freeTier, pricingPlan, pricingModel, supportedRegions, supportChannels, tags, logoUrl
            } = req.body;
            const api = await prisma.api.update({
                where: { id },
                data: {
                    name, category, description, docsUrl, pricingUrl, changelogUrl, status,
                    registrationUrl, sourceUrl, freeTier, pricingPlan, pricingModel, supportedRegions, supportChannels, tags, logoUrl
                },
            });
            res.status(200).json(api);
        } catch (error) {
            console.error('Failed to update API:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    } else if (req.method === 'DELETE') {
        try {
            await prisma.api.delete({
                where: { id },
            });
            res.status(200).json({ message: 'Deleted successfully' });
        } catch (error) {
            console.error('Failed to delete API:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
