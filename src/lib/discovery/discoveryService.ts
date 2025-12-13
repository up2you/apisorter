import prisma from '@/lib/prisma';
import { NewsFetcher } from '@/lib/discovery/newsFetcher';
import { AIAnalyzer } from '@/lib/discovery/aiAnalyzer';

export class DiscoveryService {
    private fetcher: NewsFetcher;
    private analyzer: AIAnalyzer;

    constructor(apiKey: string) {
        this.fetcher = new NewsFetcher();
        this.analyzer = new AIAnalyzer(apiKey);
    }

    async runDiscovery(maxItems: number = 3) {
        const results = [];
        let sources = await prisma.discoverySource.findMany({
            where: { enabled: true },
        });

        // Initialize default sources if none exist
        if (sources.length === 0) {
            await prisma.discoverySource.createMany({
                data: [
                    { name: 'TechCrunch', url: 'https://techcrunch.com/feed/', type: 'RSS' },
                    { name: 'Hacker News', url: 'https://hnrss.org/newest', type: 'RSS' },
                    { name: 'Product Hunt', url: 'https://www.producthunt.com/feed', type: 'RSS' },
                ],
                skipDuplicates: true,
            });
            sources = await prisma.discoverySource.findMany({ where: { enabled: true } });
        }

        let processedCount = 0;

        for (const source of sources) {
            if (processedCount >= maxItems) break;

            console.log(`Fetching from ${source.name}...`);
            const items = await this.fetcher.fetchFeed(source.url, source.name);

            for (const item of items) {
                if (processedCount >= maxItems) break;

                // Check if already processed
                const existingLog = await prisma.discoveryLog.findUnique({
                    where: {
                        sourceId_url: {
                            sourceId: source.id,
                            url: item.link,
                        },
                    },
                });

                if (existingLog) continue;

                console.log(`Analyzing: ${item.title}`);
                // Analyze with AI
                const analysis = await this.analyzer.analyze(item.content, item.title);

                if (analysis) {
                    console.log(`Found API: ${analysis.name}`);
                    // Create Log
                    await prisma.discoveryLog.create({
                        data: {
                            sourceId: source.id,
                            url: item.link,
                            title: item.title,
                            status: 'PROCESSED',
                        },
                    });

                    // Check for duplicates
                    const slug = analysis.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                    const existingApi = await prisma.api.findFirst({
                        where: {
                            OR: [
                                { name: { equals: analysis.name, mode: 'insensitive' } },
                                { slug: { startsWith: slug } }, // Adjusted to match prefix logic better
                            ]
                        }
                    });

                    if (!existingApi) {
                        // Create Provider
                        const provider = await prisma.provider.create({
                            data: {
                                name: analysis.name,
                                website: analysis.url,
                            }
                        });

                        // Create API
                        const newApi = await prisma.api.create({
                            data: {
                                name: analysis.name,
                                slug: `${slug}-${Date.now().toString().slice(-4)}`,
                                description: analysis.description,
                                category: analysis.category || 'Uncategorized',
                                docsUrl: analysis.url || item.link,
                                providerId: provider.id,
                                status: 'PENDING',
                                source: 'CRAWLED',
                                sourceUrl: item.link,
                                metadata: { ai_confidence: analysis.confidence },
                            }
                        });
                        results.push({ name: newApi.name, status: 'created' });
                    } else {
                        results.push({ name: analysis.name, status: 'skipped_duplicate' });
                    }
                } else {
                    console.log(`Ignored: ${item.title}`);
                    // Log as ignored
                    await prisma.discoveryLog.create({
                        data: {
                            sourceId: source.id,
                            url: item.link,
                            title: item.title,
                            status: 'IGNORED',
                        },
                    });
                }
                processedCount++;
            }

            // Update source lastChecked
            await prisma.discoverySource.update({
                where: { id: source.id },
                data: { lastCheckedAt: new Date() },
            });
        }

        return { processedCount, results };
    }
}
