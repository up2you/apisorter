import 'dotenv/config';
import prisma from '@/lib/prisma';

async function main() {
    console.log('Checking Discovery Logs...');

    const logs = await prisma.discoveryLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { source: true }
    });

    console.log(`Found ${logs.length} logs.`);
    logs.forEach(log => {
        console.log(`[${log.createdAt.toISOString()}] ${log.status} - ${log.title} (${log.source.name})`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
