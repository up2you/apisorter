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
            const { name, website, logoUrl, contact } = req.body;
            const provider = await prisma.provider.update({
                where: { id },
                data: { name, website, logoUrl, contact },
            });
            res.status(200).json(provider);
        } catch (error) {
            console.error('Failed to update provider:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    } else if (req.method === 'DELETE') {
        try {
            await prisma.provider.delete({
                where: { id },
            });
            res.status(200).json({ message: 'Deleted successfully' });
        } catch (error) {
            console.error('Failed to delete provider:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
