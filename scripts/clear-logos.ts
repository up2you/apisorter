import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Clearing Google logos...');
    const result = await prisma.api.updateMany({
        where: {
            logoUrl: {
                contains: 'google.com/s2/favicons'
            }
        },
        data: {
            logoUrl: null
        }
    });
    console.log(`Cleared ${result.count} logos.`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
