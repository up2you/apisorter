import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { CrawlerEngine } from '@/lib/crawler/crawlerEngine';
import { ContentParser } from '@/lib/crawler/contentParser';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user || session.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Unauthorized' });
    }

    if (req.method === 'POST') {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({ message: 'URL is required' });
        }

        try {
            const engine = new CrawlerEngine();
            const parser = new ContentParser();

            await engine.init();
            const result = await engine.crawl(url);
            await engine.close();

            if (result.error) {
                return res.status(500).json({ message: `Crawling failed: ${result.error}` });
            }

            const info = parser.parse(result);

            return res.status(200).json(info);
        } catch (error: any) {
            console.error('Autofill failed:', error);
            return res.status(500).json({ message: error.message });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
