import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import prisma from '@/lib/prisma';
import { slugify } from '@/lib/slugify';

import { z } from 'zod';

const apiSchema = z.object({
    name: z.string().min(1, "Name is required"),
    providerId: z.string().min(1, "Provider ID is required"),
    category: z.string().min(1, "Category is required"),
    description: z.string().optional(),
    docsUrl: z.string().url("Invalid Docs URL"),
    pricingUrl: z.string().url("Invalid Pricing URL").optional().or(z.literal('')),
    changelogUrl: z.string().url("Invalid Changelog URL").optional().or(z.literal('')),
    registrationUrl: z.string().url("Invalid Registration URL").optional().or(z.literal('')),
    sourceUrl: z.string().url("Invalid Source URL").optional().or(z.literal('')),
    logoUrl: z.string().url("Invalid Logo URL").optional().or(z.literal('')),
    freeTier: z.string().optional(),
    pricingPlan: z.string().optional(),
    pricingModel: z.string().optional(),
    supportedRegions: z.string().optional(),
    supportChannels: z.string().optional(),
    tags: z.array(z.string()).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING', 'BROKEN']).optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user || session.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Unauthorized' });
    }

    if (req.method === 'GET') {
        const apis = await prisma.api.findMany({
            orderBy: { createdAt: 'desc' },
            take: 100,
            include: { provider: true },
        });
        res.status(200).json(apis);
    } else if (req.method === 'POST') {
        try {
            const validationResult = apiSchema.safeParse(req.body);

            if (!validationResult.success) {
                return res.status(400).json({
                    message: 'Validation Error',
                    errors: validationResult.error.flatten().fieldErrors
                });
            }

            const {
                name, providerId, category, description, docsUrl, pricingUrl, changelogUrl, status,
                registrationUrl, sourceUrl, freeTier, pricingPlan, pricingModel, supportedRegions, supportChannels, tags, logoUrl
            } = validationResult.data;

            const slug = slugify(`${name}-${Date.now()}`); // Ensure unique slug

            const api = await prisma.api.create({
                data: {
                    slug,
                    name,
                    providerId,
                    category,
                    description,
                    docsUrl,
                    pricingUrl: pricingUrl || null,
                    changelogUrl: changelogUrl || null,
                    registrationUrl: registrationUrl || null,
                    sourceUrl: sourceUrl || null,
                    logoUrl: logoUrl || null,
                    freeTier,
                    pricingPlan,
                    pricingModel,
                    supportedRegions,
                    supportChannels,
                    tags: tags || [],
                    status: (status as any) || 'ACTIVE',
                },
            });
            res.status(201).json(api);
        } catch (error) {
            console.error('Failed to create API:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
