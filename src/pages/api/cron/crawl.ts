import type { NextApiRequest, NextApiResponse } from 'next';
import { CrawlerEngine } from '@/lib/crawler/crawlerEngine';
import { ContentParser } from '@/lib/crawler/contentParser';
import { Scheduler } from '@/lib/crawler/scheduler';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Basic authorization check (same as check-links)
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

    const engine = new CrawlerEngine();
    const parser = new ContentParser();
    const scheduler = new Scheduler();

    try {
        await engine.init();
        const apis = await scheduler.getApisToCrawl(5); // Limit to 5 per run to avoid timeouts

        const results = [];

        for (const api of apis) {
            try {
                const result = await engine.crawl(api.docsUrl);

                if (result.error) {
                    await scheduler.updateApiStatus(api.id, api.status, 0); // Update checked time
                    results.push({ name: api.name, status: 'error', error: result.error });
                    continue;
                }

                const info = parser.parse(result);
                await scheduler.updateApiInfo(api.id, info);
                results.push({ name: api.name, status: 'updated', info });
            } catch (e: any) {
                console.error(`Failed to process ${api.name}:`, e);
                results.push({ name: api.name, status: 'failed', error: e.message });
            }
        }

        res.status(200).json({ success: true, processed: results.length, results });

    } catch (error: any) {
        console.error('Crawler Cron Failed:', error);
        res.status(500).json({ success: false, error: error.message });
    } finally {
        await engine.close();
    }
}
