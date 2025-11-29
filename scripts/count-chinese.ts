
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const count = await prisma.api.count({
        where: {
            description: {
                contains: '。', // Common Chinese period
            },
        },
    });

    console.log(`Found ${count} APIs with Chinese descriptions (checking for '。').`);

    const sample = await prisma.api.findMany({
        where: {
            description: {
                contains: '。',
            },
        },
        take: 5,
        select: { name: true, description: true }
    });
    console.log('Sample:', JSON.stringify(sample, null, 2));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
