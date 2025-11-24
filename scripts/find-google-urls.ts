import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Checking for providers with Google Search URLs...');

    const providers = await prisma.provider.findMany({
        where: {
            website: {
                contains: 'google.com/search'
            }
        },
        select: {
            id: true,
            name: true,
            website: true,
            logoUrl: true
        }
    });

    console.log(`Found ${providers.length} providers with Google Search URLs.`);

    // List top 50 to give an idea
    for (const p of providers.slice(0, 50)) {
        console.log(`[${p.name}] ${p.website} (Logo: ${p.logoUrl})`);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
