import type { NextApiRequest, NextApiResponse } from 'next';
import { lemonSqueezyApiInstance } from '@/utils/lemonSqueezy'; // We'll create this utility
import prisma from '@/lib/prisma';

// Mock variant IDs for now (Replace with real ones from env)
const VARIANTS = {
    coffee: process.env.LEMONSQUEEZY_VARIANT_COFFEE || '123456',
    lunch: process.env.LEMONSQUEEZY_VARIANT_LUNCH || '123457',
    tool: process.env.LEMONSQUEEZY_VARIANT_TOOL || '123458',
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { tier, email } = req.body; // tier: 'coffee' | 'lunch' | 'tool'

    if (!tier || !VARIANTS[tier as keyof typeof VARIANTS]) {
        return res.status(400).json({ message: 'Invalid donation tier' });
    }

    try {
        // In a real implementation, we would call Lemon Squeezy API to create a checkout
        // For now, we'll simulate it or use the SDK if configured

        // const checkout = await createCheckout(storeId, variantId, { checkout_data: { email } });

        // MOCK RESPONSE for development until real keys are set
        const mockCheckoutUrl = `https://apisorter.lemonsqueezy.com/checkout/buy/${VARIANTS[tier as keyof typeof VARIANTS]}?checkout[email]=${email || ''}`;

        // Log the intent (optional)
        await prisma.donation.create({
            data: {
                amount: tier === 'coffee' ? 300 : tier === 'lunch' ? 800 : 2000,
                currency: 'USD',
                status: 'pending',
                donorEmail: email,
            }
        });

        return res.status(200).json({ url: mockCheckoutUrl });

    } catch (error) {
        console.error('Donation checkout error:', error);
        return res.status(500).json({ message: 'Failed to create checkout session' });
    }
}
