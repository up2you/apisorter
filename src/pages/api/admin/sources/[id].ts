import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user || session.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Unauthorized' });
    }

    const { id } = req.query;

    if (req.method === 'DELETE') {
        try {
            await prisma.discoverySource.delete({
                where: { id: String(id) }
            });
            res.status(204).end();
        } catch (error) {
            res.status(500).json({ error: 'Failed to delete source' });
        }
    } else if (req.method === 'PUT') {
        try {
            const { enabled, url, name } = req.body;
            const source = await prisma.discoverySource.update({
                where: { id: String(id) },
                data: { enabled, url, name }
            });
            res.status(200).json(source);
        } catch (error) {
            res.status(500).json({ error: 'Failed to update source' });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
