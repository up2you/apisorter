import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const session = await getServerSession(req, res, authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const pendingClaims = await prisma.provider.findMany({
            where: {
                claimStatus: 'PENDING',
            },
            select: {
                id: true,
                name: true,
                website: true,
                claimEmail: true,
                claimedAt: true,
                claimStatus: true,
                // We can't select claimedByUserId directly if we want the user object, 
                // but we don't have a direct relation defined in schema for 'claimedBy' back to User yet 
                // (we only added the scalar field). 
                // For now, we'll just return the ID. 
                // Ideally, we should add a relation: claimedBy User @relation(...)
                claimedByUserId: true,
            },
            orderBy: {
                claimedAt: 'desc',
            },
        });

        // Helper to check domain match
        const claimsWithVerification = pendingClaims.map(claim => {
            let isDomainMatch = false;
            try {
                if (claim.website && claim.claimEmail) {
                    const websiteDomain = new URL(claim.website).hostname.replace('www.', '');
                    const emailDomain = claim.claimEmail.split('@')[1];
                    if (emailDomain && websiteDomain && emailDomain.includes(websiteDomain)) {
                        isDomainMatch = true;
                    }
                }
            } catch (e) {
                // ignore parsing errors
            }
            return { ...claim, isDomainMatch };
        });

        return res.status(200).json({ claims: claimsWithVerification });

    } catch (error) {
        console.error('Fetch claims error:', error);
        return res.status(500).json({ message: 'Failed to fetch claims' });
    }
}
