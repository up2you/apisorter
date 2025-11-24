import prisma from '../src/lib/prisma';

async function main() {
    console.log('Checking database for "Singular"...');

    const api = await prisma.api.findFirst({
        where: {
            name: {
                contains: 'Singular',
                mode: 'insensitive',
            },
        },
        include: {
            provider: true,
        },
    });

    if (api) {
        console.log('Found API in database:', api);
    } else {
        console.log('API "Singular" NOT found in database.');
    }

    const provider = await prisma.provider.findFirst({
        where: {
            name: {
                contains: 'Singular',
                mode: 'insensitive',
            },
        },
    });

    if (provider) {
        console.log('Found Provider in database:', provider);
    } else {
        console.log('Provider "Singular" NOT found in database.');
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
