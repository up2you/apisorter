import type { NextApiRequest, NextApiResponse } from 'next';
import { DiscoveryService } from '@/lib/discovery/discoveryService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Authorization check
    const secret = process.env.CRON_SECRET_TOKEN;
    if (secret) {
        const headerToken = req.headers['x-cron-secret'] ?? req.headers.authorization;
        const authorized = Array.isArray(headerToken)
            ? headerToken.some(t => t === secret || t === `Bearer ${secret}`)
            : headerToken === secret || headerToken === `Bearer ${secret}`;

        if (!authorized) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
    }

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'GOOGLE_GENERATIVE_AI_API_KEY not configured' });
    }

    try {
        const service = new DiscoveryService(apiKey);
        const { processedCount, results } = await service.runDiscovery(5); // Run slightly more for Cron

        res.status(200).json({ success: true, processed: processedCount, results });
    } catch (error: any) {
        console.error('Discovery Cron Failed:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}
