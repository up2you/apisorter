import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { email, interests } = req.body;

    if (!email || !email.includes('@')) {
        return res.status(400).json({ message: 'Invalid email address' });
    }

    try {
        // Upsert to handle re-subscription or updates
        const subscriber = await prisma.newsletterSubscriber.upsert({
            where: { email },
            update: {
                active: true,
                interests: interests || [],
            },
            create: {
                email,
                interests: interests || [],
                active: true,
            },
        });

        res.status(200).json({ message: 'Subscribed successfully', id: subscriber.id });
    } catch (error) {
        console.error('Newsletter subscription error:', error);
        res.status(500).json({ message: 'Failed to subscribe' });
    }
}
