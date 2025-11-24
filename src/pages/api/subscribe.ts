import type { NextApiRequest, NextApiResponse } from 'next';

import prisma from '@/lib/prisma';
import stripe from '@/lib/stripe';

type SubscribeRequest = {
  planSlug?: string;
  userId?: string;
  successUrl?: string;
  cancelUrl?: string;
};

type SubscribeResponse =
  | {
      checkoutUrl: string | null;
      sessionId: string | null;
      status: 'checkout' | 'activated';
      message?: string;
    }
  | { error: string };

const ensureAbsoluteUrl = (input: string | undefined, fallback: string): string => {
  if (!input) return fallback;
  if (input.startsWith('http://') || input.startsWith('https://')) {
    return input;
  }
  return `${fallback.replace(/\/$/, '')}/${input.replace(/^\//, '')}`;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SubscribeResponse>,
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const body = req.body as SubscribeRequest | undefined;
  const planSlug = body?.planSlug?.trim();
  const userId = body?.userId?.trim();

  if (!planSlug || !userId) {
    return res.status(400).json({ error: 'planSlug and userId are required' });
  }

  const [plan, user] = await Promise.all([
    prisma.subscriptionPlan.findUnique({ where: { slug: planSlug } }),
    prisma.user.findUnique({ where: { id: userId } }),
  ]);

  if (!plan) {
    return res.status(404).json({ error: `Subscription plan ${planSlug} not found` });
  }

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.apisorter.com';
  const successUrl = ensureAbsoluteUrl(body?.successUrl, `${siteUrl}/billing/success`);
  const cancelUrl = ensureAbsoluteUrl(body?.cancelUrl, `${siteUrl}/billing/cancelled`);

  if (plan.priceUsd === 0 || !plan.stripePriceId) {
    const existing = await prisma.subscription.findFirst({
      where: { userId: user.id, planId: plan.id },
    });

    const now = new Date();
    const subscription = existing
      ? await prisma.subscription.update({
          where: { id: existing.id },
          data: {
            status: 'active',
            startsAt: existing.startsAt ?? now,
            endsAt: null,
            cancelAt: null,
          },
        })
      : await prisma.subscription.create({
          data: {
            userId: user.id,
            planId: plan.id,
            status: 'active',
            stripeSubscriptionId: null,
            stripeCustomerId: user.stripeCustomerId,
            startsAt: now,
            endsAt: null,
          },
        });

    return res.status(200).json({
      checkoutUrl: null,
      sessionId: subscription.id,
      status: 'activated',
      message: 'Free plan activated successfully',
    });
  }

  if (!stripe) {
    return res.status(500).json({ error: 'Stripe is not configured' });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [
      {
        price: plan.stripePriceId,
        quantity: 1,
      },
    ],
    success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
    metadata: {
      planId: plan.id,
      planSlug: plan.slug,
      userId: user.id,
    },
    customer: user.stripeCustomerId ?? undefined,
    customer_email: user.stripeCustomerId ? undefined : user.email,
  });

  return res.status(200).json({
    checkoutUrl: checkoutSession.url,
    sessionId: checkoutSession.id,
    status: 'checkout',
  });
}





