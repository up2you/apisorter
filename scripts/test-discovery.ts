import 'dotenv/config';
import prisma from '@/lib/prisma';
import { NewsFetcher, NewsItem } from '@/lib/discovery/newsFetcher';
import { AIAnalyzer, ExtractedApi } from '@/lib/discovery/aiAnalyzer';

// Mock dependencies
class MockNewsFetcher extends NewsFetcher {
    async fetchFeed(url: string, sourceName: string): Promise<NewsItem[]> {
        return [
            {
                title: 'New API: SuperData',
                link: 'https://example.com/superdata',
                content: 'SuperData launches a new API for real-time analytics.',
                pubDate: new Date().toISOString(),
                source: sourceName,
            }
        ];
    }
}

class MockAIAnalyzer extends AIAnalyzer {
    constructor() {
        super('mock-key');
    }

    async analyze(text: string, title: string): Promise<ExtractedApi | null> {
        return {
            name: 'SuperData',
            description: 'Real-time analytics API',
            url: 'https://example.com/superdata',
            category: 'Analytics',
            confidence: 0.95
        };
    }
}

async function test() {
    console.log('Starting Discovery Test...');

    // Use mocks
    const fetcher = new MockNewsFetcher();
    const analyzer = new MockAIAnalyzer();

    // Create a test source
    const source = await prisma.discoverySource.upsert({
        where: { url: 'https://test.com/feed' },
        update: {},
        create: {
            name: 'Test Source',
            url: 'https://test.com/feed',
            type: 'RSS',
        }
    });

    console.log('Fetching from Test Source...');
    const items = await fetcher.fetchFeed(source.url, source.name);

    for (const item of items) {
        console.log(`Analyzing: ${item.title}`);
        const analysis = await analyzer.analyze(item.content, item.title);

        if (analysis) {
            console.log(`>>> FOUND API: ${analysis.name}`);

            // Verify DB creation logic
            const slug = analysis.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

            // Clean up previous test run
            await prisma.api.deleteMany({ where: { slug: { startsWith: slug } } });
            await prisma.provider.deleteMany({ where: { name: analysis.name } });

            const provider = await prisma.provider.create({
                data: {
                    name: analysis.name,
                    website: analysis.url,
                }
            });

            const api = await prisma.api.create({
                data: {
                    name: analysis.name,
                    slug: slug + '-test',
                    description: analysis.description,
                    category: analysis.category,
                    docsUrl: analysis.url,
                    providerId: provider.id,
                    status: 'PENDING',
                    source: 'CRAWLED',
                }
            });

            console.log(`Created API: ${api.name} (ID: ${api.id}) with status ${api.status}`);

            if (api.status === 'PENDING') {
                console.log('SUCCESS: API created in PENDING state.');
            } else {
                console.error('FAILURE: API status is not PENDING.');
            }
        }
    }
}

test()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
