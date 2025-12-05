import { PrismaClient } from '@prisma/client';
import { ContentParser } from '../src/lib/crawler/contentParser';
import { Scheduler } from '../src/lib/crawler/scheduler';
import { CrawlResult } from '../src/lib/crawler/crawlerEngine';

const prisma = new PrismaClient();

async function main() {
    const testProviderId = 'prov-test-contact';
    const testApiId = 'api-test-contact';

    try {
        // 1. Setup: Create dummy provider and API
        console.log('Setting up test data...');
        await prisma.api.deleteMany({ where: { id: testApiId } });
        await prisma.provider.deleteMany({ where: { id: testProviderId } });

        await prisma.provider.create({
            data: {
                id: testProviderId,
                name: 'Test Provider',
                website: 'https://example.com',
            }
        });

        await prisma.api.create({
            data: {
                id: testApiId,
                slug: 'test-api-contact',
                name: 'Test API',
                providerId: testProviderId,
                category: 'Test',
                description: 'Test Description',
                docsUrl: 'https://example.com/docs',
                status: 'ACTIVE',
                source: 'MANUAL',
            }
        });

        // 2. Simulate Crawl Result
        console.log('Simulating crawl result...');
        const mockCrawlResult: CrawlResult = {
            url: 'https://example.com/docs',
            title: 'Test Documentation',
            content: 'Contact us at support@example.com',
            links: [],
            metaImages: [],
            icons: [],
            contactLinks: ['support@example.com', 'sales@example.com'],
        };

        // 3. Parse
        console.log('Parsing content...');
        const parser = new ContentParser();
        const info = await parser.parse(mockCrawlResult);
        console.log('Parsed Info:', info);

        // 4. Update Database
        console.log('Updating database...');
        const scheduler = new Scheduler();
        await scheduler.updateApiInfo(testApiId, info);

        // 5. Verify
        console.log('Verifying provider contact info...');
        const updatedProvider = await prisma.provider.findUnique({
            where: { id: testProviderId }
        });

        if (updatedProvider?.contact === 'support@example.com, sales@example.com') {
            console.log('SUCCESS: Provider contact info updated correctly!');
            console.log(`Contact: ${updatedProvider.contact}`);
        } else {
            console.error('FAILURE: Provider contact info mismatch.');
            console.error(`Expected: support@example.com, sales@example.com`);
            console.error(`Actual: ${updatedProvider?.contact}`);
            process.exit(1);
        }

    } catch (error) {
        console.error('Test failed:', error);
        process.exit(1);
    } finally {
        // Cleanup
        await prisma.api.deleteMany({ where: { id: testApiId } });
        await prisma.provider.deleteMany({ where: { id: testProviderId } });
        await prisma.$disconnect();
    }
}

main();
