import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Analyzing generic logo usage...');

    const providers = await prisma.provider.findMany({
        where: {
            logoUrl: {
                startsWith: '/icons/'
            }
        },
        include: {
            apis: {
                select: { name: true }
            }
        }
    });

    console.log(`Found ${providers.length} providers using generic logos.`);

    for (const p of providers) {
        console.log(`[${p.name}] -> ${p.logoUrl}`);
        if (p.website) console.log(`   Website: ${p.website}`);
        if (p.apis.length > 0) console.log(`   APIs: ${p.apis.map(a => a.name).join(', ').slice(0, 100)}...`);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
