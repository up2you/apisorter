import 'dotenv/config';
import prisma from '@/lib/prisma';
import { NewsFetcher } from '@/lib/discovery/newsFetcher';
import { AIAnalyzer } from '@/lib/discovery/aiAnalyzer';

async function main() {
    console.log('Starting AI Discovery...');

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        console.error('OPENAI_API_KEY not found in environment variables.');
        process.exit(1);
    }

    const fetcher = new NewsFetcher();
    const analyzer = new AIAnalyzer(apiKey);

    // 1. Get enabled sources
    const sources = await prisma.discoverySource.findMany({
        where: { enabled: true },
    });

    if (sources.length === 0) {
        console.log('No enabled discovery sources found. Adding default sources...');
        // Add some defaults if none exist
        await prisma.discoverySource.createMany({
            data: [
                { name: 'TechCrunch', url: 'https://techcrunch.com/feed/', type: 'RSS' },
                { name: 'Hacker News', url: 'https://hnrss.org/newest', type: 'RSS' },
                { name: 'Product Hunt', url: 'https://www.producthunt.com/feed', type: 'RSS' },
            ],
            skipDuplicates: true,
        });
        // Re-fetch
        sources.push(...await prisma.discoverySource.findMany({ where: { enabled: true } }));
    }

    console.log(`Found ${sources.length} sources.`);

    for (const source of sources) {
        console.log(`Fetching from ${source.name}...`);
        const items = await fetcher.fetchFeed(source.url, source.name);
        console.log(`Found ${items.length} items.`);

        for (const item of items) {
            // Check if already processed
            const existingLog = await prisma.discoveryLog.findUnique({
                where: {
                    sourceId_url: {
                        sourceId: source.id,
                        url: item.link,
                    },
                },
            });

            if (existingLog) {
                continue;
            }

            console.log(`Analyzing: ${item.title}`);

            // Analyze with AI
            const analysis = await analyzer.analyze(item.content, item.title);

            if (analysis) {
                console.log(`>>> FOUND API: ${analysis.name} (${analysis.confidence})`);

                // Create Log
                const log = await prisma.discoveryLog.create({
                    data: {
                        sourceId: source.id,
                        url: item.link,
                        title: item.title,
                        status: 'PROCESSED',
                    },
                });

                // Check if API already exists (by name or slug)
                // Simple check by name for now
                const slug = analysis.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                const existingApi = await prisma.api.findFirst({
                    where: {
                        OR: [
                            { name: { equals: analysis.name, mode: 'insensitive' } },
                            { slug: slug },
                        ]
                    }
                });

                if (existingApi) {
                    console.log(`API ${analysis.name} already exists. Skipping creation.`);
                } else {
                    // Create Provider and API
                    // We need a provider. For now, create a placeholder provider or try to guess.
                    // Let's create a new provider with the same name as the API for simplicity, 
                    // or "Unknown Provider" if we want to be safe. 
                    // But usually the API name is a good proxy for the provider name initially.

                    const provider = await prisma.provider.create({
                        data: {
                            name: analysis.name,
                            website: analysis.url,
                        }
                    });

                    await prisma.api.create({
                        data: {
                            name: analysis.name,
                            slug: slug + '-' + Date.now().toString().slice(-4), // Ensure uniqueness
                            description: analysis.description,
                            category: analysis.category || 'Uncategorized',
                            docsUrl: analysis.url || item.link, // Fallback to news link if no URL found
                            providerId: provider.id,
                            status: 'PENDING',
                            source: 'CRAWLED',
                            sourceUrl: item.link,
                        }
                    });

                    // Update log with foundApiId
                    // (Skipping for brevity, but good to have)
                }

            } else {
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
        }

        // Update source lastChecked
        await prisma.discoverySource.update({
            where: { id: source.id },
            data: { lastCheckedAt: new Date() },
        });
    }

    console.log('Discovery complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
