import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const statsCount = await prisma.dailySystemStat.count();
    const apiCount = await prisma.api.count();
    const userCount = await prisma.user.count();

    console.log(`DailyStats: ${statsCount}`);
    console.log(`APIs: ${apiCount}`);
    console.log(`Users: ${userCount}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
