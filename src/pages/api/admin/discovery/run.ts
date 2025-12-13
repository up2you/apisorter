import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { DiscoveryService } from '@/lib/discovery/discoveryService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user || session.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Unauthorized' });
    }

    if (req.method === 'POST') {
        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'GOOGLE_GENERATIVE_AI_API_KEY not configured' });
        }

        try {
            const service = new DiscoveryService(apiKey);
            const maxItems = typeof req.body.maxItems === 'number' ? req.body.maxItems : 3;
            const { processedCount, results } = await service.runDiscovery(maxItems);

            res.status(200).json({ success: true, processed: processedCount, results });
        } catch (error: any) {
            console.error('Manual Discovery Failed:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
