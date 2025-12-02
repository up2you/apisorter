import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

// Local Database Client
const prismaLocal = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL, // Local URL from .env
        },
    },
});

// Production Database Client
// Hardcoded for safety and specific targeting of the pooler
const PROD_DATABASE_URL = "postgresql://postgres.imjtxkdqlfwkfeqsmaws:L2DKaj3AxTv9vIQE@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres";

const prismaProd = new PrismaClient({
    datasources: {
        db: {
            url: PROD_DATABASE_URL,
        },
    },
});

async function migrate() {
    console.log('Starting migration from Local to Production...');
    console.log('Local DB:', process.env.DATABASE_URL);
    console.log('Prod DB:', PROD_DATABASE_URL);

    try {
        // 1. GlobalSettings
        console.log('Migrating GlobalSettings...');
        const settings = await prismaLocal.globalSettings.findMany();
        for (const item of settings) {
            await prismaProd.globalSettings.upsert({
                where: { id: item.id },
                update: item,
                create: item,
            });
        }

        // 2. User
        console.log('Migrating Users...');
        const users = await prismaLocal.user.findMany();
        for (const item of users) {
            await prismaProd.user.upsert({
                where: { email: item.email },
                update: item,
                create: item,
            });
        }

        // 3. Provider
        console.log('Migrating Providers...');
        const providers = await prismaLocal.provider.findMany();
        for (const item of providers) {
            await prismaProd.provider.upsert({
                where: { id: item.id },
                update: item,
                create: item,
            });
        }

        // 4. Api
        console.log('Migrating APIs...');
        const apis = await prismaLocal.api.findMany();
        for (const item of apis) {
            await prismaProd.api.upsert({
                where: { slug: item.slug },
                update: item as any,
                create: item as any,
            });
        }

        // 5. Review
        console.log('Migrating Reviews...');
        const reviews = await prismaLocal.review.findMany();
        for (const item of reviews) {
            await prismaProd.review.upsert({
                where: { id: item.id },
                update: item,
                create: item,
            });
        }

        // 6. SubscriptionPlan
        console.log('Migrating SubscriptionPlans...');
        const plans = await prismaLocal.subscriptionPlan.findMany();
        for (const item of plans) {
            await prismaProd.subscriptionPlan.upsert({
                where: { slug: item.slug },
                update: item,
                create: item,
            });
        }

        // 7. Subscription
        console.log('Migrating Subscriptions...');
        const subs = await prismaLocal.subscription.findMany();
        for (const item of subs) {
            await prismaProd.subscription.upsert({
                where: { id: item.id },
                update: item,
                create: item,
            });
        }

        // 8. Payment
        console.log('Migrating Payments...');
        const payments = await prismaLocal.payment.findMany();
        for (const item of payments) {
            await prismaProd.payment.upsert({
                where: { id: item.id },
                update: item,
                create: item,
            });
        }

        // 9. Favorite
        console.log('Migrating Favorites...');
        const favorites = await prismaLocal.favorite.findMany();
        for (const item of favorites) {
            await prismaProd.favorite.upsert({
                where: { userId_apiId: { userId: item.userId, apiId: item.apiId } },
                update: item,
                create: item,
            });
        }

        // 10. ApiFollower
        console.log('Migrating ApiFollowers...');
        const followers = await prismaLocal.apiFollower.findMany();
        for (const item of followers) {
            await prismaProd.apiFollower.upsert({
                where: { userId_apiId: { userId: item.userId, apiId: item.apiId } },
                update: item,
                create: item,
            });
        }

        // 11. PricingHistory
        console.log('Migrating PricingHistory...');
        const pricingHistory = await prismaLocal.pricingHistory.findMany();
        for (const item of pricingHistory) {
            await prismaProd.pricingHistory.upsert({
                where: { id: item.id },
                update: item as any,
                create: item as any,
            });
        }

        // 12. AdSlot
        console.log('Migrating AdSlots...');
        const adSlots = await prismaLocal.adSlot.findMany();
        for (const item of adSlots) {
            await prismaProd.adSlot.upsert({
                where: { key: item.key },
                update: item,
                create: item,
            });
        }

        // 13. AdCampaign
        console.log('Migrating AdCampaigns...');
        const campaigns = await prismaLocal.adCampaign.findMany();
        for (const item of campaigns) {
            await prismaProd.adCampaign.upsert({
                where: { id: item.id },
                update: item,
                create: item,
            });
        }

        // 14. DiscoverySource
        console.log('Migrating DiscoverySources...');
        const sources = await prismaLocal.discoverySource.findMany();
        for (const item of sources) {
            await prismaProd.discoverySource.upsert({
                where: { url: item.url },
                update: item,
                create: item,
            });
        }

        // 15. DiscoveryLog
        console.log('Migrating DiscoveryLogs...');
        const logs = await prismaLocal.discoveryLog.findMany();
        for (const item of logs) {
            await prismaProd.discoveryLog.upsert({
                where: { sourceId_url: { sourceId: item.sourceId, url: item.url } },
                update: item,
                create: item,
            });
        }

        // 16. WebhookEvent
        console.log('Migrating WebhookEvents...');
        const events = await prismaLocal.webhookEvent.findMany();
        for (const item of events) {
            await prismaProd.webhookEvent.upsert({
                where: { externalId: item.externalId },
                update: item as any,
                create: item as any,
            });
        }

        console.log('Migration completed successfully!');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await prismaLocal.$disconnect();
        await prismaProd.$disconnect();
    }
}

migrate();
