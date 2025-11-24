import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting logo population using Google Favicon API...');

    // Fetch APIs without logos
    const apis = await prisma.api.findMany({
        where: {
            logoUrl: null,
            status: 'ACTIVE',
        },
        take: 100, // Can process more since we aren't crawling
    });

    console.log(`Found ${apis.length} APIs to process.`);

    for (const api of apis) {
        const targetUrl = api.docsUrl || api.sourceUrl;
        if (!targetUrl) {
            console.log(`Skipping ${api.name}: No URL found`);
            continue;
        }

        try {
            const urlObj = new URL(targetUrl);
            const hostname = urlObj.hostname;

            if (hostname.includes('google.com') && targetUrl.includes('/search')) {
                console.log(`Skipping ${api.name}: Google Search URL`);
                continue;
            }

            const logoUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;

            console.log(`Updating ${api.name} with logo: ${logoUrl}`);

            await prisma.api.update({
                where: { id: api.id },
                data: { logoUrl },
            });

        } catch (error) {
            console.error(`Error processing ${api.name} (${targetUrl}):`, error);
        }
    }

    await prisma.$disconnect();
    console.log('Done!');
}

main().catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});
