import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const badApis = await prisma.api.findMany({
        where: {
            OR: [
                { docsUrl: { contains: 'google.com/search' } },
                { sourceUrl: { contains: 'google.com/search' } }
            ],
            status: 'ACTIVE'
        },
        select: { id: true, name: true, docsUrl: true, provider: { select: { name: true } } },
        take: 50 // Limit to 50 for now
    });

    console.log(`Found ${badApis.length} APIs with placeholder URLs.`);
    badApis.forEach(api => {
        console.log(`${api.id}|${api.name}|${api.provider?.name}`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
