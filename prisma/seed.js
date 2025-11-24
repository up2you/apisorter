require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const hashPassword = async (plain) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
};

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .substring(0, 60);

async function seedProviders() {
  const providers = [
    {
      id: 'prov-openai',
      name: 'OpenAI',
      website: 'https://openai.com',
      logoUrl: 'https://cdn.apisorter.com/providers/openai.png',
      contact: 'support@openai.com',
    },
    {
      id: 'prov-google',
      name: 'Google Cloud',
      website: 'https://cloud.google.com',
      logoUrl: 'https://cdn.apisorter.com/providers/google-cloud.png',
      contact: 'https://cloud.google.com/contact',
    },
    {
      id: 'prov-stripe',
      name: 'Stripe',
      website: 'https://stripe.com',
      logoUrl: 'https://cdn.apisorter.com/providers/stripe.png',
      contact: 'support@stripe.com',
    },
    {
      id: 'prov-twilio',
      name: 'Twilio',
      website: 'https://www.twilio.com',
      logoUrl: 'https://cdn.apisorter.com/providers/twilio.png',
      contact: 'help@twilio.com',
    },
    {
      id: 'prov-mapbox',
      name: 'Mapbox',
      website: 'https://www.mapbox.com',
      logoUrl: 'https://cdn.apisorter.com/providers/mapbox.png',
      contact: 'https://www.mapbox.com/contact',
    },
  ];

  for (const provider of providers) {
    await prisma.provider.upsert({
      where: { id: provider.id },
      update: {
        name: provider.name,
        website: provider.website,
        logoUrl: provider.logoUrl,
        contact: provider.contact,
      },
      create: provider,
    });
  }
}

async function seedApis() {
  const apiSeeds = [
    {
      name: 'OpenAI Platform',
      providerId: 'prov-openai',
      category: 'AI & Machine Learning',
      tags: ['llm', 'chat', 'embeddings'],
      docsUrl: 'https://platform.openai.com/docs',
      pricingUrl: 'https://platform.openai.com/pricing',
      changelogUrl: 'https://platform.openai.com/docs/deprecations',
      freeTier: '$5 free credit for new accounts',
      featured: true,
      metadata: {
        pricing_unit: 'per 1K tokens',
        models: ['gpt-4o-mini', 'gpt-4.1', 'o1-preview'],
      },
    },
    {
      name: 'Google Maps Platform',
      providerId: 'prov-google',
      category: 'Maps & Geolocation',
      tags: ['maps', 'geocoding', 'places'],
      docsUrl: 'https://developers.google.com/maps',
      pricingUrl: 'https://mapsplatform.google.com/pricing/',
      changelogUrl: 'https://developers.google.com/maps/support/release-notes',
      freeTier: '$200 monthly credit',
      metadata: {
        pricing_unit: 'per 1K requests',
        services: ['Maps SDK', 'Geocoding', 'Places'],
      },
    },
    {
      name: 'Stripe Payments',
      providerId: 'prov-stripe',
      category: 'Payments & Finance',
      tags: ['payments', 'billing', 'checkout'],
      docsUrl: 'https://stripe.com/docs/api',
      pricingUrl: 'https://stripe.com/pricing',
      changelogUrl: 'https://stripe.com/docs/upgrades',
      freeTier: 'No monthly fee; pay only per transaction',
      metadata: {
        pricing_unit: 'per transaction',
        rates: {
          card: '2.9% + $0.30',
          international: '3.9% + $0.30',
        },
      },
    },
    {
      name: 'Twilio Programmable SMS',
      providerId: 'prov-twilio',
      category: 'Communication & Messaging',
      tags: ['sms', 'messaging'],
      docsUrl: 'https://www.twilio.com/docs/sms',
      pricingUrl: 'https://www.twilio.com/sms/pricing',
      changelogUrl: 'https://www.twilio.com/docs/usage/notifications/changelog',
      freeTier: '$15 trial credit',
      metadata: {
        pricing_unit: 'per message',
        sample_rate_usd: '0.0075',
      },
    },
    {
      name: 'Mapbox Tiles API',
      providerId: 'prov-mapbox',
      category: 'Maps & Geolocation',
      tags: ['tiles', 'routing'],
      docsUrl: 'https://docs.mapbox.com/api/maps/',
      pricingUrl: 'https://www.mapbox.com/pricing',
      changelogUrl: 'https://docs.mapbox.com/help/changelog/maps/',
      freeTier: '50,000 map loads / month',
      metadata: {
        pricing_unit: 'map loads',
      },
    },
  ];

  for (const api of apiSeeds) {
    const slug = slugify(api.name);
    await prisma.api.upsert({
      where: { slug },
      update: {
        name: api.name,
        category: api.category,
        tags: api.tags,
        description: api.description,
        docsUrl: api.docsUrl,
        pricingUrl: api.pricingUrl,
        changelogUrl: api.changelogUrl,
        freeTier: api.freeTier,
        featured: Boolean(api.featured),
        metadata: api.metadata,
        provider: { connect: { id: api.providerId } },
      },
      create: {
        slug,
        name: api.name,
        category: api.category,
        tags: api.tags,
        description: api.description,
        docsUrl: api.docsUrl,
        pricingUrl: api.pricingUrl,
        changelogUrl: api.changelogUrl,
        freeTier: api.freeTier,
        featured: Boolean(api.featured),
        metadata: api.metadata,
        provider: { connect: { id: api.providerId } },
      },
    });
  }
}

async function seedUsers() {
  const users = [
    {
      email: 'alex@example.com',
      name: 'Alex Chen',
      nickname: 'Alex',
      role: 'ADMIN',
      password: await hashPassword('Password123!'),
      emailVerified: new Date(),
    },
    {
      email: 'sam@example.com',
      name: 'Sam Lee',
      nickname: 'Sam',
      role: 'USER',
      password: await hashPassword('Password123!'),
      emailVerified: new Date(),
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        nickname: user.nickname,
        role: user.role,
        password: user.password,
        emailVerified: new Date(),
      },
      create: user,
    });
  }
}

async function seedReviews() {
  const alex = await prisma.user.findUnique({ where: { email: 'alex@example.com' } });
  const sam = await prisma.user.findUnique({ where: { email: 'sam@example.com' } });
  const openai = await prisma.api.findUnique({ where: { slug: slugify('OpenAI Platform') } });
  const stripe = await prisma.api.findUnique({ where: { slug: slugify('Stripe Payments') } });

  if (!openai || !stripe) {
    throw new Error('Seed APIs missing while creating reviews');
  }

  const seedData = [
    {
      apiId: openai.id,
      nickname: 'Alex',
      rating: 5,
      comment: 'Latency is excellent and documentation stays current.',
      userId: alex?.id,
      ipHash: 'hash_openai_1',
    },
    {
      apiId: stripe.id,
      nickname: 'Sam',
      rating: 4,
      comment: 'Great tooling, onboarding takes some effort.',
      userId: sam?.id,
      ipHash: 'hash_stripe_1',
    },
  ];

  for (const review of seedData) {
    await prisma.review.upsert({
      where: {
        // unique composite helper on nickname + api for deterministic seeding
        id: `${review.apiId}-${review.nickname}`,
      },
      update: {
        rating: review.rating,
        comment: review.comment,
        userId: review.userId ?? null,
        ipHash: review.ipHash,
      },
      create: {
        apiId: review.apiId,
        nickname: review.nickname,
        rating: review.rating,
        comment: review.comment,
        userId: review.userId ?? null,
        ipHash: review.ipHash,
        id: `${review.apiId}-${review.nickname}`,
      },
    });
  }
}

async function seedSubscriptions() {
  const plans = [
    {
      id: 'plan-free',
      name: 'Free',
      slug: 'free',
      priceUsd: 0,
      billingCycle: 'lifetime',
      benefits: ['Explore public APIs', 'Bookmark up to 20 APIs'],
      stripePriceId: null,
    },
    {
      id: 'plan-pro',
      name: 'Pro',
      slug: 'pro',
      priceUsd: 9.99,
      billingCycle: 'monthly',
      benefits: ['Unlimited bookmarks', 'Email alerts', 'CSV export'],
      stripePriceId: process.env.STRIPE_PRICE_PRO || null,
    },
    {
      id: 'plan-enterprise',
      name: 'Enterprise',
      slug: 'enterprise',
      priceUsd: 99.0,
      billingCycle: 'monthly',
      benefits: ['Team seats', 'Webhook alerts', 'Priority support'],
      stripePriceId: process.env.STRIPE_PRICE_ENTERPRISE || null,
    },
  ];

  for (const plan of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { slug: plan.slug },
      update: {
        name: plan.name,
        priceUsd: plan.priceUsd,
        billingCycle: plan.billingCycle,
        benefits: plan.benefits,
        stripePriceId: plan.stripePriceId,
      },
      create: plan,
    });
  }

  const proPlan = await prisma.subscriptionPlan.findUnique({ where: { slug: 'pro' } });
  const user = await prisma.user.findUnique({ where: { email: 'alex@example.com' } });

  if (!proPlan || !user) {
    return;
  }

  const startsAt = new Date();
  const endsAt = new Date();
  endsAt.setMonth(endsAt.getMonth() + 1);

  const subscription = await prisma.subscription.upsert({
    where: { id: 'sub-alex-pro' },
    update: {
      planId: proPlan.id,
      status: 'active',
      stripeCustomerId: 'cus_demo_123',
      stripeSubscriptionId: 'sub_demo_123',
      startsAt,
      endsAt,
    },
    create: {
      id: 'sub-alex-pro',
      userId: user.id,
      planId: proPlan.id,
      status: 'active',
      stripeCustomerId: 'cus_demo_123',
      stripeSubscriptionId: 'sub_demo_123',
      startsAt,
      endsAt,
    },
  });

  await prisma.payment.upsert({
    where: { id: 'pay-alex-pro-1' },
    update: {
      amountUsd: proPlan.priceUsd,
      status: 'paid',
      paidAt: new Date(),
    },
    create: {
      id: 'pay-alex-pro-1',
      subscriptionId: subscription.id,
      amountUsd: proPlan.priceUsd,
      status: 'paid',
      paidAt: new Date(),
      stripePaymentIntentId: 'pi_demo_123',
    },
  });
}

async function seedEngagement() {
  const sam = await prisma.user.findUnique({ where: { email: 'sam@example.com' } });
  const openai = await prisma.api.findUnique({ where: { slug: slugify('OpenAI Platform') } });
  const stripe = await prisma.api.findUnique({ where: { slug: slugify('Stripe Payments') } });

  if (!sam || !openai || !stripe) {
    return;
  }

  await prisma.favorite.upsert({
    where: { userId_apiId: { userId: sam.id, apiId: openai.id } },
    update: {},
    create: { userId: sam.id, apiId: openai.id },
  });

  await prisma.apiFollower.upsert({
    where: { userId_apiId: { userId: sam.id, apiId: stripe.id } },
    update: { notificationMethod: 'email' },
    create: { userId: sam.id, apiId: stripe.id, notificationMethod: 'email' },
  });

  await prisma.notificationPreference.upsert({
    where: { userId: sam.id },
    update: { apiUpdateEmails: true },
    create: {
      userId: sam.id,
      reviewEmails: true,
      apiUpdateEmails: true,
      newsletterEmails: false,
    },
  });
}

async function seedAdvertising() {
  const slots = [
    { id: 'slot-home-hero', key: 'homepage-hero', description: 'Homepage hero banner', width: 970, height: 250 },
    { id: 'slot-home-sidebar', key: 'homepage-sidebar', description: 'Homepage sidebar medium rectangle', width: 300, height: 250 },
    { id: 'slot-api-footer', key: 'api-footer', description: 'API detail footer banner', width: 728, height: 90 },
  ];

  for (const slot of slots) {
    await prisma.adSlot.upsert({
      where: { key: slot.key },
      update: {
        description: slot.description,
        width: slot.width,
        height: slot.height,
      },
      create: slot,
    });
  }

  await prisma.adCampaign.upsert({
    where: { id: 'ad-openai-hero' },
    update: {
      impressions: 1200,
      clicks: 45,
    },
    create: {
      id: 'ad-openai-hero',
      slotId: 'slot-home-hero',
      name: 'OpenAI Enterprise CTA',
      imageUrl: 'https://cdn.apisorter.com/ads/openai-hero.png',
      targetUrl: 'https://platform.openai.com/overview',
      startsAt: new Date(),
      endsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
    },
  });
}

async function seedPricingHistory() {
  const openai = await prisma.api.findUnique({ where: { slug: slugify('OpenAI Platform') } });
  if (!openai) return;

  await prisma.pricingHistory.upsert({
    where: { id: 'ph-openai-001' },
    update: {
      newHash: 'hash_v2',
      snapshot: {
        pricingUrl: 'https://platform.openai.com/pricing',
        tiers: [
          { model: 'gpt-4o-mini', prompt: 0.00015, completion: 0.0006 },
          { model: 'gpt-4o', prompt: 0.0025, completion: 0.01 },
        ],
      },
    },
    create: {
      id: 'ph-openai-001',
      apiId: openai.id,
      previousHash: 'hash_v1',
      newHash: 'hash_v2',
      snapshot: {
        pricingUrl: 'https://platform.openai.com/pricing',
        tiers: [
          { model: 'gpt-4o-mini', prompt: 0.00015, completion: 0.0006 },
          { model: 'gpt-4o', prompt: 0.0025, completion: 0.01 },
        ],
      },
      diff: {
        added: ['gpt-4o-mini'],
        updated: ['gpt-4o'],
      },
      changedSource: 'CRAWLED',
    },
  });
}

async function seedWebhookEvents() {
  await prisma.webhookEvent.upsert({
    where: { externalId: 'evt_stripe_demo_001' },
    update: {
      status: 'processed',
      processedAt: new Date(),
    },
    create: {
      externalId: 'evt_stripe_demo_001',
      provider: 'stripe',
      payload: {
        type: 'invoice.payment_succeeded',
        data: { object: { amount_paid: 999 } },
      },
      status: 'processed',
      processedAt: new Date(),
    },
  });
}

async function main() {
  await seedProviders();
  await seedApis();
  await seedUsers();
  await seedReviews();
  await seedSubscriptions();
  await seedEngagement();
  await seedAdvertising();
  await seedPricingHistory();
  await seedWebhookEvents();
}

main()
  .then(() => {
    console.log('Database seeded successfully.');
  })
  .catch((error) => {
    console.error('Error seeding database', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

