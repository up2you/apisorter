import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

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
                    // Here we could also update the provider's contact email to the claim email
                    contact: provider.claimEmail,
                },
            });
        } else {
            await prisma.provider.update({
                where: { id: providerId },
                data: {
                    claimStatus: 'REJECTED',
                    // Optional: Clear the claim info so they can try again? 
                    // Or keep it as rejected history. Let's keep it rejected for now.
                    // If we want them to retry, we might want to set it back to UNCLAIMED or similar.
                    // Let's set it to REJECTED, and maybe clear the user link so someone else can claim?
                    // For simplicity, let's just mark REJECTED.
                },
            });
        }

        return res.status(200).json({ message: `Claim ${action}D` });

    } catch (error) {
        console.error('Review claim error:', error);
        return res.status(500).json({ message: 'Failed to process claim review' });
    }
}
