import { PrismaClient } from '@prisma/client';

const dbUrl = 'postgresql://postgres:L2DKaj3AxTv9vIQE@db.imjtxkdqlfwkfeqsmaws.supabase.co:5432/postgres';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: dbUrl,
        },
    },
});

async function main() {
    console.log('Testing connection to Production DB...');
    try {
        const count = await prisma.user.count();
        console.log('Successfully connected!');
        console.log(`User count: ${count}`);
    } catch (e) {
        console.error('Connection failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
