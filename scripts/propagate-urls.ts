import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Propagating API URLs to Providers...');

    // Find all providers with bad websites
    const providers = await prisma.provider.findMany({
        where: {
            OR: [
                { website: { contains: 'google.com/search' } },
                { website: null }
            ]
        },
        include: {
            apis: true // Fetch all APIs and filter in code
        }
    });

    console.log(`Found ${providers.length} providers with bad websites.`);

    for (const provider of providers) {
        // Find a valid API to use as source
        const validApi = provider.apis.find(api =>
            api.docsUrl &&
            !api.docsUrl.includes('google.com/search')
        );

        if (validApi && validApi.docsUrl) {
            try {
                const urlObj = new URL(validApi.docsUrl);
                const cleanUrl = `${urlObj.protocol}//${urlObj.hostname}`;

                await prisma.provider.update({
                    where: { id: provider.id },
                    data: { website: cleanUrl, logoUrl: null }
                });
                console.log(`Updated Provider ${provider.name} -> ${cleanUrl} (from API: ${validApi.name})`);
            } catch (e) {
                console.log(`Skipping ${provider.name}: Invalid URL ${validApi.docsUrl}`);
            }
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
