import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // 1. Check APIs in the specific "AI & Machine Learning" category
    const aiApis = await prisma.api.findMany({
        where: {
            category: {
                contains: 'AI',
                mode: 'insensitive'
            }
        },
        select: { id: true, name: true, category: true }
    });

    console.log(`\nAPIs with 'AI' in category (${aiApis.length}):`);
    aiApis.forEach(api => console.log(`- ${api.name} (${api.category})`));

    // 2. Search for potential AI APIs by name or description that are NOT in an AI category
    const potentialAiApis = await prisma.api.findMany({
        where: {
            OR: [
                { name: { contains: 'AI', mode: 'insensitive' } },
                { name: { contains: 'GPT', mode: 'insensitive' } },
                { name: { contains: 'Claude', mode: 'insensitive' } },
                { name: { contains: 'Gemini', mode: 'insensitive' } },
                { name: { contains: 'Stable Diffusion', mode: 'insensitive' } },
                { description: { contains: 'Machine Learning', mode: 'insensitive' } },
                { description: { contains: 'Artificial Intelligence', mode: 'insensitive' } },
            ],
            NOT: {
                category: { contains: 'AI', mode: 'insensitive' }
            }
        },
        select: { id: true, name: true, category: true }
    });

    console.log(`\nPotential AI APIs currently in other categories (${potentialAiApis.length}):`);
    potentialAiApis.forEach(api => console.log(`- ${api.name} (${api.category})`));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
