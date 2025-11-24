import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const total = await prisma.api.count();
    const withLogo = await prisma.api.count({
        where: {
            logoUrl: { not: null }
        }
    });

    console.log(`Total APIs: ${total}`);
    console.log(`APIs with Logo: ${withLogo}`);

    const featured = await prisma.api.findMany({
        where: {
            status: 'ACTIVE',
            featured: true
        },
        take: 6,
        select: {
            name: true,
            logoUrl: true,
            provider: {
                select: {
                    name: true,
                    logoUrl: true
                }
            }
        }
    });

    console.log('\nFeatured APIs status:');
    featured.forEach(api => {
        console.log(`- ${api.name}:`);
        console.log(`  API Logo: ${api.logoUrl}`);
        console.log(`  Provider Logo: ${api.provider?.logoUrl}`);
    });

    const sample = await prisma.api.findMany({
        where: { logoUrl: { not: null } },
        take: 10,
        select: { name: true, logoUrl: true, docsUrl: true }
    });

    console.log('\nRandom Sample:');
    sample.forEach(api => {
        console.log(`- ${api.name}`);
        console.log(`  URL: ${api.docsUrl}`);
        console.log(`  Logo: ${api.logoUrl}`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
