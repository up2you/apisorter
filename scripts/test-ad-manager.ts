import 'dotenv/config';
import prisma from '@/lib/prisma';
import axios from 'axios';

async function main() {
    console.log('Testing Ad Manager...');

    const slotKey = 'test-slot-' + Date.now();

    // 1. Create Slot (Directly via Prisma to bypass Auth)
    console.log('Creating Test Slot...');
    const slot = await prisma.adSlot.create({
        data: {
            key: slotKey,
            description: 'Test Slot',
            width: 300,
            height: 250,
        }
    });

    // 2. Create Campaign
    console.log('Creating Test Campaign...');
    const campaign = await prisma.adCampaign.create({
        data: {
            slotId: slot.id,
            name: 'Test Campaign',
            imageUrl: 'https://via.placeholder.com/300x250',
            targetUrl: 'https://example.com',
            startsAt: new Date(Date.now() - 10000), // Started 10s ago
            endsAt: new Date(Date.now() + 100000), // Ends in future
        }
    });

    // 3. Test Render API
    console.log('Testing Render API...');
    try {
        const renderRes = await axios.get(`http://localhost:3000/api/ads/render?slotKey=${slotKey}`);
        if (renderRes.data.id === campaign.id) {
            console.log('✅ Render API returned correct campaign');
        } else {
            console.error('❌ Render API returned wrong campaign:', renderRes.data);
        }
    } catch (error: any) {
        console.error('❌ Render API failed:', error.message);
    }

    // 4. Test Track API
    console.log('Testing Track API...');
    try {
        await axios.post(`http://localhost:3000/api/ads/track`, {
            campaignId: campaign.id,
            type: 'impression'
        });

        // Verify DB
        const updatedCampaign = await prisma.adCampaign.findUnique({ where: { id: campaign.id } });
        if (updatedCampaign?.impressions === 1) {
            console.log('✅ Tracking (Impression) worked');
        } else {
            console.error('❌ Tracking failed. Impressions:', updatedCampaign?.impressions);
        }
    } catch (error: any) {
        console.error('❌ Track API failed:', error.message);
    }

    // Cleanup
    console.log('Cleaning up...');
    await prisma.adCampaign.delete({ where: { id: campaign.id } });
    await prisma.adSlot.delete({ where: { id: slot.id } });
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
