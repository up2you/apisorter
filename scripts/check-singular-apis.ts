import prisma from '../src/lib/prisma';

async function main() {
    console.log('Checking APIs for provider "prov-singular"...');

    const apis = await prisma.api.findMany({
        where: {
            providerId: 'prov-singular',
        },
    });

    if (apis.length > 0) {
        console.log(`Found ${apis.length} APIs for provider Singular:`);
        apis.forEach(api => console.log(`- ${api.name} (ID: ${api.id})`));
    } else {
        console.log('No APIs found for provider Singular.');
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
