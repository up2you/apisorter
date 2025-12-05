import 'dotenv/config';
import prisma from '@/lib/prisma';

async function main() {
    const count = await prisma.api.count();
    console.log(`Total APIs in DB: ${count}`);

    const withEmbeddings = await prisma.api.count({
        where: {
            descriptionEmbedding: { not: null }
        }
    });
    console.log(`APIs with embeddings: ${withEmbeddings}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
