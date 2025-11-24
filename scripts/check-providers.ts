import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const topApis = await prisma.api.findMany({
        where: { status: 'ACTIVE' },
        orderBy: [{ featured: 'desc' }, { reviews: { _count: 'desc' } }],
        take: 10,
        select: { id: true, name: true }
    });

    console.log('Top APIs to fix:');
    topApis.forEach(api => console.log(`${api.id}|${api.name}`));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
