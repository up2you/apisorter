import 'dotenv/config';
import prisma from '@/lib/prisma';
import axios from 'axios';

async function main() {
    console.log('Testing Ad Slot Integration...');

    const slots = ['home-hero-ad', 'category-header-ad', 'footer-banner'];

    for (const key of slots) {
        console.log(`Checking slot: ${key}`);

        // 1. Create Slot if not exists
        const slot = await prisma.adSlot.upsert({
            where: { key },
            update: {},
            create: {
                key,
                description: `Auto-created slot for ${key}`,
                width: 300,
                height: 250,
            }
        });
        console.log(`✅ Slot verified in DB: ${slot.id}`);

        // 2. Create Test Campaign
        const campaign = await prisma.adCampaign.create({
            data: {
                slotId: slot.id,
                name: `Test Campaign for ${key}`,
                imageUrl: 'https://via.placeholder.com/300x250',
                targetUrl: 'https://example.com',
                startsAt: new Date(Date.now() - 10000),
                endsAt: new Date(Date.now() + 100000),
            }
        });

        // 3. Test Render
        try {
            const renderRes = await axios.get(`http://localhost:3000/api/ads/render?slotKey=${key}`);
            if (renderRes.data.id === campaign.id) {
                console.log(`✅ Render API working for ${key}`);
            } else {
                console.error(`❌ Render API returned wrong campaign for ${key}`);
            }
        } catch (error: any) {
            console.error(`❌ Render API failed for ${key}:`, error.message);
        }

        // Cleanup
        await prisma.adCampaign.delete({ where: { id: campaign.id } });
    }
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
