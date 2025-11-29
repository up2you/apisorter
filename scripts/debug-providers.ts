import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Checking OpenAI API...');
    const openaiApi = await prisma.api.findFirst({
        where: { name: { contains: 'OpenAI' } },
        include: { provider: true }
    });

    if (openaiApi) {
        console.log('OpenAI API found:');
        console.log('API Name:', openaiApi.name);
        console.log('API Docs URL:', openaiApi.docsUrl);
        console.log('Provider Name:', openaiApi.provider.name);
        console.log('Provider Website:', openaiApi.provider.website);
    } else {
        console.log('OpenAI API not found.');
    }

    console.log('\nChecking providers with Google URLs...');
    const googleProviders = await prisma.provider.findMany({
        where: { website: { contains: 'google.com/search' } },
        take: 10
    });

    console.log(`Found ${googleProviders.length} providers with Google URLs.`);
    googleProviders.forEach(p => console.log(`- ${p.name}: ${p.website}`));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
