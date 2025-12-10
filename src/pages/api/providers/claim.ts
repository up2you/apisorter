import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { sendAdminClaimAlert } from '@/lib/email';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user?.email) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { providerId, claimEmail } = req.body;

    if (!providerId || !claimEmail) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const provider = await prisma.provider.findUnique({
            where: { id: providerId },
        });

        if (!provider) {
            return res.status(404).json({ message: 'Provider not found' });
        }

        if (provider.claimStatus === 'APPROVED') {
            return res.status(400).json({ message: 'Provider already claimed' });
        }

        // Domain Verification Logic
        let isDomainMatch = false;
        try {
            if (provider.website) {
                const websiteDomain = new URL(provider.website).hostname.replace('www.', '');
                const emailDomain = claimEmail.split('@')[1];

                // Simple check: email domain ends with website domain
                // e.g. john@stripe.com matches stripe.com
                if (emailDomain && websiteDomain && emailDomain.includes(websiteDomain)) {
                    isDomainMatch = true;
                }
            }
        } catch (e) {
            console.error('Domain parsing error', e);
        }

        // Update Provider with claim info
        await prisma.provider.update({
            where: { id: providerId },
            data: {
                claimStatus: 'PENDING',
                claimEmail: claimEmail,
                claimedByUserId: session.user.id as string,
                claimedAt: new Date(),
                // We could store isDomainMatch in metadata or a separate field if we want to flag it for admin
            }
        });

        // Notify Admin
        await sendAdminClaimAlert(provider.name, claimEmail, providerId);

        return res.status(200).json({
            message: 'Claim request submitted',
            domainMatch: isDomainMatch
        });

    } catch (error) {
        console.error('Claim request error:', error);
        return res.status(500).json({ message: 'Failed to submit claim request' });
    }
}
