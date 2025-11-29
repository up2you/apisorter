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
        include: {
            provider: true,
        },
        take: 1000,
    });

    console.log(`Found ${apis.length} APIs to process.`);

    for (const api of apis) {
        let targetUrl = api.docsUrl || api.sourceUrl;
        let usedProviderUrl = false;

        // Check if API URL is valid
        const isGoogleSearch = (url: string) => {
            try {
                const u = new URL(url);
                return u.hostname.includes('google.com') && url.includes('/search');
            } catch {
                return false;
            }
        };

        if (!targetUrl || isGoogleSearch(targetUrl)) {
            // Try to use provider info
            if (api.provider.logoUrl) {
                console.log(`Using provider logo for ${api.name}: ${api.provider.logoUrl}`);
                await prisma.api.update({
                    where: { id: api.id },
                    data: { logoUrl: api.provider.logoUrl },
                });
                continue;
            }

            if (api.provider.website && !isGoogleSearch(api.provider.website)) {
                console.log(`Using provider website for ${api.name}: ${api.provider.website}`);
                targetUrl = api.provider.website;
                usedProviderUrl = true;
            } else {
                console.log(`Skipping ${api.name}: No valid URL found (API: ${targetUrl}, Provider: ${api.provider.website})`);
                continue;
            }
        }

        try {
            const urlObj = new URL(targetUrl);
            const hostname = urlObj.hostname;

            const logoUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;

            console.log(`Updating ${api.name} with logo: ${logoUrl}`);

            await prisma.api.update({
                where: { id: api.id },
                data: { logoUrl },
            });

            // If we used the provider's website and the provider has no logo, update the provider too
            if (usedProviderUrl && !api.provider.logoUrl) {
                await prisma.provider.update({
                    where: { id: api.provider.id },
                    data: { logoUrl },
                });
            }

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
