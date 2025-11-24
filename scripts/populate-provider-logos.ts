import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const providers = await prisma.provider.findMany({
        where: {
            logoUrl: null,
            website: { not: null }
        }
    });

    console.log(`Found ${providers.length} providers to populate.`);

    for (const provider of providers) {
        const targetUrl = provider.website;
        if (!targetUrl) continue;

        try {
            const urlObj = new URL(targetUrl);
            const hostname = urlObj.hostname;

            if (hostname.includes('google.com') && targetUrl.includes('/search')) {
                console.log(`Skipping ${provider.name}: Google Search URL`);
                continue;
            }

            const logoUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;

            console.log(`Updating ${provider.name} with logo: ${logoUrl}`);

            await prisma.provider.update({
                where: { id: provider.id },
                data: { logoUrl: logoUrl }
            });

        } catch (error) {
            console.error(`Error processing ${provider.name}:`, error);
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
