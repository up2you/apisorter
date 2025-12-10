import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { sendClaimStatusNotification } from '@/lib/email';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const session = await getServerSession(req, res, authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { providerId, action } = req.body; // action: 'APPROVE' | 'REJECT'

    if (!providerId || !['APPROVE', 'REJECT'].includes(action)) {
        return res.status(400).json({ message: 'Invalid request' });
    }

    try {
        const provider = await prisma.provider.findUnique({
            where: { id: providerId },
        });

        if (!provider) {
            return res.status(404).json({ message: 'Provider not found' });
        }

        if (action === 'APPROVE') {
            await prisma.provider.update({
                where: { id: providerId },
                data: {
                    claimStatus: 'APPROVED',
                    contact: provider.claimEmail, // Set regular contact to claim email
                },
            });
        } else {
            await prisma.provider.update({
                where: { id: providerId },
                data: {
                    claimStatus: 'REJECTED',
                },
            });
        }

        // Notify User
        if (provider.claimEmail) {
            await sendClaimStatusNotification(provider.claimEmail, provider.name, action as 'APPROVED' | 'REJECTED');
        }

        return res.status(200).json({ message: `Claim ${action}D` });

    } catch (error) {
        console.error('Review claim error:', error);
        return res.status(500).json({ message: 'Failed to process claim review' });
    }
}
