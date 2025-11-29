import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Updating OpenAI Platform category...');

    const result = await prisma.api.updateMany({
        where: {
            name: 'OpenAI Platform',
            category: 'AI & Machine Learning'
        },
        data: {
            category: 'AI & Data'
        }
    });

    console.log(`Updated ${result.count} API(s).`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
