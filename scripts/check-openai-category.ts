import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const api = await prisma.api.findFirst({
        where: { name: 'OpenAI Platform' },
        select: { id: true, name: true, category: true }
    });

    console.log('OpenAI Platform API:', api);

    const specificCategoryApis = await prisma.api.findMany({
        where: { category: 'AI & Machine Learning' },
        select: { id: true, name: true }
    });

    console.log(`\nAPIs in 'AI & Machine Learning' category (${specificCategoryApis.length}):`);
    specificCategoryApis.forEach(a => console.log(`- ${a.name}`));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
