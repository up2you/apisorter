import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getSession({ req });

    if (!session || !session.user?.email) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.method === 'PUT') {
        try {
            const { apiUpdateEmails, newsletterEmails } = req.body;

            const user = await prisma.user.findUnique({
                where: { email: session.user.email },
            });

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Upsert notification preferences
            const prefs = await prisma.notificationPreference.upsert({
                where: { userId: user.id },
                update: {
                    apiUpdateEmails,
                    newsletterEmails,
                },
                create: {
                    userId: user.id,
                    apiUpdateEmails: apiUpdateEmails ?? true,
                    newsletterEmails: newsletterEmails ?? false,
                    reviewEmails: true // Default
                },
            });

            return res.status(200).json(prefs);
        } catch (error) {
            console.error('Failed to update settings:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
