import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import prisma from '@/lib/prisma';
import { slugify } from '@/lib/slugify';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user || session.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Unauthorized' });
    }

    if (req.method === 'GET') {
        // Basic pagination or search could go here
        const providers = await prisma.provider.findMany({
            orderBy: { createdAt: 'desc' },
            take: 100,
        });
        res.status(200).json(providers);
    } else if (req.method === 'POST') {
        try {
            const { name, website, logoUrl, contact } = req.body;
            const id = `prov-${slugify(name)}`;

            const provider = await prisma.provider.create({
                data: {
                    id,
                    name,
                    website,
                    logoUrl,
                    contact,
                },
            });
            res.status(201).json(provider);
        } catch (error) {
            console.error('Failed to create provider:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
