import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const api = await prisma.api.findFirst({
        where: { name: 'OpenAI Platform' }
    });

    if (api) {
        console.log('Updating OpenAI Platform logo...');
        await prisma.api.update({
            where: { id: api.id },
            data: {
                logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/OpenAI_Logo.svg/1024px-OpenAI_Logo.svg.png'
            }
        });
        console.log('Updated!');
    } else {
        console.log('OpenAI Platform API not found.');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
