
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const apis = await prisma.api.findMany({
        where: {
            OR: [
                { name: { contains: 'Tawk.to' } },
                { name: { contains: 'PubNub' } },
                { name: { contains: 'Twilio' } },
                { name: { contains: 'Sendbird' } },
                { name: { contains: 'HubSpot' } },
                { name: { contains: 'Freshdesk' } },
                { name: { contains: 'Intercom' } },
                { name: { contains: 'Zendesk' } },
                { name: { contains: 'Flexport' } },
                { name: { contains: '17track' } },
            ],
        },
        select: {
            id: true,
            name: true,
            description: true,
        },
    });

    console.log('Found APIs:', JSON.stringify(apis, null, 2));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
