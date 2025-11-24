import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Checking for APIs with missing metadata fields...');

    const apis = await prisma.api.findMany({
        include: {
            provider: true
        }
    });

    let missingProviderCount = 0;
    let missingTagsCount = 0;
    let missingDescriptionCount = 0; // Even if not on card, good to have
    let missingFreeTierCount = 0; // Optional, but good to know

    for (const api of apis) {
        const issues = [];

        if (!api.provider && !api.providerId) {
            missingProviderCount++;
            issues.push('Missing Provider');
        }

        if (!api.tags || api.tags.length === 0) {
            missingTagsCount++;
            issues.push('Missing Tags');
        }

        if (!api.description) {
            missingDescriptionCount++;
            issues.push('Missing Description');
        }

        // Just logging sample of issues
        if (issues.length > 0 && Math.random() < 0.1) {
            console.log(`[${api.name}] Issues: ${issues.join(', ')}`);
        }
    }

    console.log('--- Summary ---');
    console.log(`Total APIs: ${apis.length}`);
    console.log(`Missing Provider: ${missingProviderCount}`);
    console.log(`Missing Tags: ${missingTagsCount}`);
    console.log(`Missing Description: ${missingDescriptionCount}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
