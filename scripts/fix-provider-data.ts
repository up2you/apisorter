import prisma from '../src/lib/prisma';

async function main() {
    console.log('Fixing Supabase...');
    await prisma.provider.updateMany({
        where: { name: 'Supabase' },
        data: { website: 'https://supabase.com' }
    });

    console.log('Fixing Mistral...');
    await prisma.provider.updateMany({
        where: { name: 'Mistral 3' },
        data: { name: 'Mistral AI', website: 'https://mistral.ai' }
    });

    console.log('Fixing TrueFoundry...');
    await prisma.provider.updateMany({
        where: { name: 'TrueFoundry AI Gateway' },
        data: { name: 'TrueFoundry', website: 'https://truefoundry.com' }
    });

    console.log('Fixing Transformers v5 -> Hugging Face...');
    await prisma.provider.updateMany({
        where: { name: 'Transformers v5' },
        data: { name: 'Hugging Face', website: 'https://huggingface.co' }
    });

    console.log('Clean up complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
