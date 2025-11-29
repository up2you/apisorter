import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Checking for duplicates of "ups" and "now"...');

    const upsApis = await prisma.api.findMany({
        where: {
            name: { contains: 'ups', mode: 'insensitive' }
        },
        select: { id: true, name: true, slug: true, category: true, providerId: true, createdAt: true }
    });

    console.log(`\nAPIs matching "ups" (${upsApis.length}):`);
    upsApis.forEach(api => console.log(JSON.stringify(api, null, 2)));

    const nowApis = await prisma.api.findMany({
        where: {
            name: { contains: 'now', mode: 'insensitive' }
        },
        select: { id: true, name: true, slug: true, category: true, providerId: true, createdAt: true }
    });

    console.log(`\nAPIs matching "now" (${nowApis.length}):`);
    nowApis.forEach(api => console.log(JSON.stringify(api, null, 2)));

    // Also check for exact name duplicates across the whole DB
    const duplicates = await prisma.$queryRaw`
        SELECT name, COUNT(*) 
        FROM "Api" 
        GROUP BY name 
        HAVING COUNT(*) > 1
        ORDER BY COUNT(*) DESC
        LIMIT 20;
    `;
    console.log('\nTop 20 duplicated names:', duplicates);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
