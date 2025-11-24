import type { NextApiRequest, NextApiResponse } from 'next';
import type StripeType from 'stripe';

import prisma from '@/lib/prisma';
import stripe from '@/lib/stripe';

export const config = {
  api: {
    bodyParser: false,
  },
};

const buffer = async (readable: NextApiRequest) => {
  const chunks: Uint8Array[] = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
};

async function recordWebhookEvent(event: StripeType.Event, status: string) {
  try {
    await prisma.webhookEvent.upsert({
      where: { externalId: event.id },
      update: {
        status,
        processedAt: new Date(),
      },
      create: {
        externalId: event.id,
        provider: 'stripe',
        payload: event as any,
        status,
        processedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('[stripe webhook] failed to record event', event.id, error);
  }
}

async function handleCheckoutCompleted(session: StripeType.Checkout.Session) {
  if (!session.metadata?.planId || !session.metadata?.userId) {
    return;
  }

  const planId = session.metadata.planId;
  const userId = session.metadata.userId;
  const stripeSubscriptionId = typeof session.subscription === 'string' ? session.subscription : undefined;
  const stripeCustomerId = typeof session.customer === 'string' ? session.customer : undefined;

  await prisma.$transaction(async (tx) => {
    if (stripeCustomerId) {
      await tx.user.update({
        where: { id: userId },
        data: { stripeCustomerId },
      });
    }

    const existing = await tx.subscription.findFirst({
      where: { userId, planId },
    });

    const now = new Date();

    if (existing) {
      await tx.subscription.update({
        where: { id: existing.id },
        data: {
          status: 'active',
          stripeSubscriptionId,
          stripeCustomerId: stripeCustomerId ?? existing.stripeCustomerId,
          startsAt: existing.startsAt ?? now,
          endsAt: null,
        },
      });
    } else {
      await tx.subscription.create({
        data: {
          userId,
          planId,
          status: 'active',
          stripeSubscriptionId: stripeSubscriptionId ?? null,
          stripeCustomerId: stripeCustomerId ?? null,
          startsAt: now,
          endsAt: null,
        },
      });
    }
  });
}

async function handleInvoicePaid(invoice: StripeType.Invoice) {
  const stripeSubscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : undefined;
  if (!stripeSubscriptionId) return;

  const subscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId },
  });

  if (!subscription) return;

  await prisma.subscription.update({
    where: { id: subscription.id },
    data: { status: 'active' },
  });

  const paymentIntentId = typeof invoice.payment_intent === 'string' ? invoice.payment_intent : undefined;

  await prisma.payment.upsert({
    where: { id: paymentIntentId ?? `${invoice.id}` },
    update: {
      amountUsd: (invoice.amount_paid ?? 0) / 100,
      status: invoice.paid ? 'paid' : 'pending',
      paidAt: invoice.paid ? new Date() : null,
      stripePaymentIntentId: paymentIntentId,
    },
    create: {
      id: paymentIntentId ?? `${invoice.id}`,
      subscriptionId: subscription.id,
      amountUsd: (invoice.amount_paid ?? 0) / 100,
      status: invoice.paid ? 'paid' : 'pending',
      paidAt: invoice.paid ? new Date() : null,
      stripePaymentIntentId: paymentIntentId,
    },
  });
}

async function handleSubscriptionDeleted(subscriptionObject: StripeType.Subscription) {
  const stripeSubscriptionId = subscriptionObject.id;
  const subscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId },
  });

  if (!subscription) return;

  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      status: 'cancelled',
      endsAt: subscriptionObject.ended_at
        ? new Date(subscriptionObject.ended_at * 1000)
        : new Date(),
      cancelAt: subscriptionObject.canceled_at
        ? new Date(subscriptionObject.canceled_at * 1000)
        : new Date(),
    },
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!stripe) {
    return res.status(500).json({ error: 'Stripe is not configured' });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return res.status(500).json({ error: 'Stripe webhook secret not configured' });
  }

  const rawBody = await buffer(req);
  const signature = req.headers['stripe-signature'];

  let event: StripeType.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature as string, webhookSecret);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(400).json({ error: `Webhook Error: ${message}` });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as StripeType.Checkout.Session);
        break;
      case 'invoice.payment_succeeded':
        await handleInvoicePaid(event.data.object as StripeType.Invoice);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as StripeType.Subscription);
        break;
      default:
        break;
    }

    await recordWebhookEvent(event, 'processed');

    return res.status(200).json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    await recordWebhookEvent(event, `error: ${message}`);
    console.error('[stripe webhook] handler error', message);
    return res.status(500).json({ error: message });
  }
}

