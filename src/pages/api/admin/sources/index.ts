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
            const sources = await prisma.discoverySource.findMany({
                orderBy: { createdAt: 'desc' }
            });
            res.status(200).json(sources);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch sources' });
        }
    } else if (req.method === 'POST') {
        try {
            const { name, url, type = 'RSS' } = req.body;
            if (!name || !url) {
                return res.status(400).json({ error: 'Name and URL are required' });
            }

            const source = await prisma.discoverySource.create({
                data: { name, url, type }
            });
            res.status(201).json(source);
        } catch (error: any) {
            if (error.code === 'P2002') {
                return res.status(400).json({ error: 'URL already exists' });
            }
            res.status(500).json({ error: 'Failed to create source' });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
