import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const providers = await prisma.provider.findMany({
        where: {
            logoUrl: null
        },
        select: { id: true, name: true, website: true }
    });

    console.log(`Found ${providers.length} Providers with NO logo.`);
    providers.slice(0, 50).forEach(p => {
        console.log(`${p.name}|${p.website}`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
