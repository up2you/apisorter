import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Checking for Chinese characters in API descriptions...');

    // Regex for Chinese characters
    const chineseRegex = /[\u4e00-\u9fa5]/;

    const apis = await prisma.api.findMany({
        where: {
            status: 'ACTIVE',
        },
        select: {
            id: true,
            name: true,
            description: true,
        },
        take: 1000,
    });

    let chineseCount = 0;
    const examples: any[] = [];

    for (const api of apis) {
        if (api.description && chineseRegex.test(api.description)) {
            chineseCount++;
            if (examples.length < 5) {
                examples.push({ name: api.name, description: api.description.substring(0, 50) + '...' });
            }
        }
    }

    console.log(`Total APIs checked: ${apis.length}`);
    console.log(`APIs with Chinese descriptions: ${chineseCount}`);

    if (examples.length > 0) {
        console.log('\nExamples:');
        examples.forEach(e => console.log(`- ${e.name}: ${e.description}`));
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
