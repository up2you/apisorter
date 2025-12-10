import 'dotenv/config';
import prisma from '@/lib/prisma';
import axios from 'axios';

async function main() {
    console.log('Testing Newsletter Subscription...');

    const testEmail = `test-newsletter-${Date.now()}@example.com`;
    const testInterests = ['AI & Machine Learning', 'DevTools'];

    // 1. Test Subscribe API
    try {
        console.log(`Subscribing ${testEmail}...`);
        const res = await axios.post('http://localhost:3000/api/newsletter/subscribe', {
            email: testEmail,
            interests: testInterests
        });

        if (res.status === 200 && res.data.id) {
            console.log('✅ API returned success');
        } else {
            console.error('❌ API failed:', res.data);
        }
    } catch (error: any) {
        console.error('❌ API request failed:', error.message);
    }

    // 2. Verify in DB
    const subscriber = await prisma.newsletterSubscriber.findUnique({
        where: { email: testEmail }
    });

    if (subscriber) {
        console.log(`✅ Subscriber found in DB: ${subscriber.id}`);
        console.log(`   Interests: ${JSON.stringify(subscriber.interests)}`);

        if (subscriber.interests.length === 2 && subscriber.interests.includes('DevTools')) {
            console.log('✅ Interests saved correctly');
        } else {
            console.error('❌ Interests mismatch');
        }
    } else {
        console.error('❌ Subscriber not found in DB');
    }

    // 3. Cleanup
    if (subscriber) {
        await prisma.newsletterSubscriber.delete({ where: { id: subscriber.id } });
        console.log('🧹 Cleanup complete');
    }
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
