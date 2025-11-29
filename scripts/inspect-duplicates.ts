import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const apis = await prisma.api.findMany({
        where: { name: 'Sendbird' },
        include: { provider: true }
    });

    console.log(`Found ${apis.length} Sendbird APIs:`);
    apis.forEach(api => {
        console.log('--------------------------------------------------');
        console.log(`ID: ${api.id}`);
        console.log(`Name: ${api.name}`);
        console.log(`Slug: ${api.slug}`);
        console.log(`Created At: ${api.createdAt}`);
        console.log(`Description: ${api.description?.substring(0, 50)}...`);
        console.log(`Logo URL: ${api.logoUrl}`);
        console.log(`Provider: ${api.provider?.name}`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
