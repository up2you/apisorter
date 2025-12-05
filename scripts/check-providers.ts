import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const count = await prisma.provider.count();
        console.log(`Total Providers: ${count}`);

        const withContact = await prisma.provider.count({
            where: { contact: { not: null } }
        });
        console.log(`Providers with Contact Info: ${withContact}`);

        const providers = await prisma.provider.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            select: { name: true, contact: true }
        });

        console.log('Latest 10 Providers Contact Info:');
        providers.forEach(p => {
            console.log(`- ${p.name}: ${p.contact || 'NULL'}`);
        });
    } catch (error) {
        console.error('Error fetching providers:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
