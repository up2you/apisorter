import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TARGETS = [
    'OpenAI', 'Google', 'Anthropic', 'Microsoft', 'Cohere', 'Stability AI',
    'Hugging Face', 'AssemblyAI', 'ElevenLabs', 'AWS', 'IBM', 'Databricks',
    'Snowflake', 'FactSet', 'Kaggle'
];

async function main() {
    console.log('Checking AI Providers in DB...');

    for (const name of TARGETS) {
        const providers = await prisma.provider.findMany({
            where: { name: { contains: name, mode: 'insensitive' } }
        });

        if (providers.length === 0) {
            console.log(`[MISSING] ${name}`);
        } else {
            for (const p of providers) {
                console.log(`[FOUND] ${p.name} (ID: ${p.id}) - Logo: ${p.logoUrl}`);
            }
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
