import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const noLogoApis = await prisma.api.findMany({
        where: {
            logoUrl: null,
            provider: {
                logoUrl: null
            }
        },
        select: { id: true, name: true, provider: { select: { name: true } } }
    });

    console.log(`Found ${noLogoApis.length} APIs with NO logo (neither API nor Provider).`);
    noLogoApis.forEach(api => {
        console.log(`${api.name} (Provider: ${api.provider?.name})`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
