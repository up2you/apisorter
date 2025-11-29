import 'dotenv/config';
import prisma from '@/lib/prisma';

/**
 * Discovery Source Configuration
 * 
 * This array defines the "Sensors" for our Intelligence Platform.
 * To adapt this system for a different domain (e.g., Finance, Real Estate),
 * simply replace these sources with relevant RSS feeds for that industry.
 */
const SOURCES = [
    {
        name: 'Product Hunt (Dev Tools)',
        url: 'https://www.producthunt.com/feed?category=Developer-Tools',
        type: 'RSS',
        enabled: true,
    },
    {
        name: 'Hacker News (Show HN)',
        url: 'https://hnrss.org/newest?q=Show+HN',
        type: 'RSS',
        enabled: true,
    },
    {
        name: 'TechCrunch (Startups)',
        url: 'https://techcrunch.com/category/startups/feed/',
        type: 'RSS',
        enabled: true,
    },
    {
        name: 'Dev.to (API Tag)',
        url: 'https://dev.to/feed/tag/api',
        type: 'RSS',
        enabled: true,
    },
    {
        name: 'Google Developers Blog',
        url: 'https://feeds.feedburner.com/Gdb',
        type: 'RSS',
        enabled: true,
    },
    {
        name: 'API Evangelist',
        url: 'https://apievangelist.com/blog.xml',
        type: 'RSS',
        enabled: true,
    }
] as const;

async function main() {
    console.log('🌱 Seeding Discovery Sources...');

    for (const source of SOURCES) {
        const result = await prisma.discoverySource.upsert({
            where: { url: source.url },
            update: {
                name: source.name,
                enabled: source.enabled,
                type: source.type as any,
            },
            create: {
                name: source.name,
                url: source.url,
                type: source.type as any,
                enabled: source.enabled,
            },
        });
        console.log(`✅ Upserted source: ${result.name}`);
    }

    console.log('\n✨ Discovery Sources seeded successfully!');
    console.log('To run discovery now, use: npx tsx scripts/run-discovery.ts');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
