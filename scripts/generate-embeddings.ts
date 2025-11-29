import 'dotenv/config';
import prisma from '@/lib/prisma';
import { pipeline } from '@xenova/transformers';

async function main() {
    console.log('Loading embedding model...');
    // Use a small, efficient model suitable for CPU
    const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

    console.log('Fetching APIs...');
    const apis = await prisma.api.findMany({
        where: {
            descriptionEmbedding: { equals: Prisma.DbNull } // Only process those without embeddings
        },
        select: {
            id: true,
            name: true,
            description: true,
            category: true,
            tags: true,
        }
    });

    console.log(`Found ${apis.length} APIs to process.`);

    for (const api of apis) {
        const textToEmbed = `
      Name: ${api.name}
      Category: ${api.category}
      Tags: ${api.tags.join(', ')}
      Description: ${api.description || ''}
    `.trim();

        try {
            const output = await extractor(textToEmbed, { pooling: 'mean', normalize: true });
            const embedding = Array.from(output.data);

            await prisma.api.update({
                where: { id: api.id },
                data: {
                    descriptionEmbedding: embedding
                }
            });
            console.log(`Updated embedding for ${api.name}`);
        } catch (error) {
            console.error(`Failed to generate embedding for ${api.name}:`, error);
        }
    }

    console.log('Done!');
}

// Helper for Prisma Json null check
import { Prisma } from '@prisma/client';

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
