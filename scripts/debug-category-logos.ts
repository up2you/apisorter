import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const category = "AI & Data";
    console.log(`Checking APIs in category: '${category}'...`);

    const apis = await prisma.api.findMany({
        where: {
            category: category
        },
        include: {
            provider: true
        }
    });

    console.log(`Found ${apis.length} APIs in '${category}'.`);

    let missingLogoCount = 0;

    for (const api of apis) {
        const apiLogo = api.logoUrl;
        const providerLogo = api.provider?.logoUrl;
        const hasLogo = apiLogo || providerLogo;

        if (!hasLogo) {
            missingLogoCount++;
            console.log(`[MISSING] ${api.name} (ID: ${api.id})`);
            console.log(`  - API Logo: ${JSON.stringify(apiLogo)}`);
            console.log(`  - Provider: ${api.provider?.name} (ID: ${api.providerId})`);
            console.log(`  - Provider Logo: ${JSON.stringify(providerLogo)}`);
        }
    }

    console.log(`Total missing logos: ${missingLogoCount} / ${apis.length}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
