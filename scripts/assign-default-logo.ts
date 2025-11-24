import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Assigning DEFAULT logo to remaining entities...');
    const defaultIcon = '/icons/categories/default_icon.svg';

    // 1. Update Providers with no logo
    const providers = await prisma.provider.findMany({
        where: { logoUrl: null }
    });

    console.log(`Found ${providers.length} Providers without logo. Updating...`);

    if (providers.length > 0) {
        await prisma.provider.updateMany({
            where: { logoUrl: null },
            data: { logoUrl: defaultIcon }
        });
        console.log(`Updated ${providers.length} Providers.`);
    }

    // 2. Update APIs with no logo
    // Since providerId is required in schema, all APIs have a provider.
    // We just need to check if any API has no logoUrl AND its provider has no logoUrl (which we just fixed).
    // But strictly speaking, we can just ensure all APIs have a fallback if needed.
    // For now, we are good since we updated all providers.
    console.log('Provider logo update complete.');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
