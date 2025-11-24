import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Checking APIs for OpenAI...');

    const provider = await prisma.provider.findFirst({
        where: { name: 'OpenAI' },
        include: { apis: true }
    });

    if (provider) {
        console.log(`Provider: ${provider.name}, Logo: ${provider.logoUrl}`);
        for (const api of provider.apis) {
            console.log(`  API: ${api.name} (ID: ${api.id})`);
            console.log(`    Logo: ${api.logoUrl}`);
        }
    } else {
        console.log('OpenAI provider not found.');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
