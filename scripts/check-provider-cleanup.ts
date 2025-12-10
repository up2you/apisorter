import prisma from '../src/lib/prisma';

async function main() {
    const providers = await prisma.provider.findMany({
        where: {
            OR: [
                { name: { contains: 'Transformers' } },
                { name: { contains: 'PubNub' } },
                { name: { contains: 'Mistral' } },
                { name: { contains: 'TrueFoundry' } }
            ]
        },
        include: {
            apis: {
                select: { name: true }
            }
        }
    });

    console.log(JSON.stringify(providers, null, 2));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
