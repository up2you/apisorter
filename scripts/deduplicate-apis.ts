import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting API deduplication...');

    // 1. Fetch all APIs
    const allApis = await prisma.api.findMany({
        select: {
            id: true,
            name: true,
            description: true,
            createdAt: true
        }
    });

    console.log(`Fetched ${allApis.length} APIs.`);

    // 2. Group by normalized name
    const groups: Record<string, typeof allApis> = {};

    for (const api of allApis) {
        const key = api.name.trim().toLowerCase();
        if (!groups[key]) {
            groups[key] = [];
        }
        groups[key].push(api);
    }

    let deletedCount = 0;

    // 3. Process groups
    for (const [name, group] of Object.entries(groups)) {
        if (group.length > 1) {
            console.log(`Found ${group.length} duplicates for "${name}"`);

            // Sort: Longest description first, then oldest created date
            group.sort((a, b) => {
                const lenA = a.description?.length || 0;
                const lenB = b.description?.length || 0;
                if (lenB !== lenA) return lenB - lenA; // Descending length
                return a.createdAt.getTime() - b.createdAt.getTime(); // Ascending date
            });

            const keeper = group[0];
            const toDelete = group.slice(1);

            console.log(`  Keeping: ${keeper.id} (Desc Len: ${keeper.description?.length || 0})`);

            for (const api of toDelete) {
                console.log(`  Deleting: ${api.id} (Desc Len: ${api.description?.length || 0})`);

                // Delete related records first (manual cascade)
                await prisma.review.deleteMany({ where: { apiId: api.id } });
                await prisma.pricingHistory.deleteMany({ where: { apiId: api.id } });
                await prisma.favorite.deleteMany({ where: { apiId: api.id } });
                await prisma.apiFollower.deleteMany({ where: { apiId: api.id } });

                // Delete the API
                await prisma.api.delete({ where: { id: api.id } });
                deletedCount++;
            }
        }
    }

    console.log(`\nDeduplication complete. Deleted ${deletedCount} duplicate APIs.`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
