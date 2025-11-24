import type { NextApiRequest, NextApiResponse } from 'next';

import prisma from '@/lib/prisma';

type ApiDetailResponse = {
  api: {
    id: string;
    slug: string;
    name: string;
    category: string;
    description: string | null;
    docsUrl: string;
    pricingUrl: string | null;
    changelogUrl: string | null;
    freeTier: string | null;
    status: string;
    source: string;
    verified: boolean;
    featured: boolean;
    lastCheckedAt: string;
    tags: string[];
    metadata: unknown;
    provider: {
      id: string;
      name: string;
      website: string | null;
      logoUrl: string | null;
    } | null;
    metrics: {
      averageRating: number;
      reviewCount: number;
      followerCount: number;
    };
    reviews: Array<{
      id: string;
      nickname: string;
      rating: number;
      comment: string | null;
      createdAt: string;
    }>;
    pricingHistory: Array<{
      id: string;
      previousHash: string | null;
      newHash: string | null;
      diff: unknown;
      snapshot: unknown;
      createdAt: string;
    }>;
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiDetailResponse | { error: string }>,
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { id } = req.query;
  const identifier = Array.isArray(id) ? id[0] : id;

  if (!identifier) {
    return res.status(400).json({ error: 'Missing id' });
  }

  const api = await prisma.api.findFirst({
    where: {
      OR: [{ id: identifier }, { slug: identifier }],
    },
    include: {
      provider: {
        select: { id: true, name: true, website: true, logoUrl: true },
      },
      followers: {
        select: { id: true },
      },
      reviews: {
        select: {
          id: true,
          nickname: true,
          rating: true,
          comment: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      },
      pricingHistory: {
        select: {
          id: true,
          previousHash: true,
          newHash: true,
          diff: true,
          snapshot: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
    },
  });

  if (!api) {
    return res.status(404).json({ error: 'API not found' });
  }

  const aggregated = await prisma.review.aggregate({
    where: { apiId: api.id },
    _avg: { rating: true },
    _count: { rating: true },
  });

  const payload: ApiDetailResponse = {
    api: {
      id: api.id,
      slug: api.slug,
      name: api.name,
      category: api.category,
      description: api.description,
      docsUrl: api.docsUrl,
      pricingUrl: api.pricingUrl,
      changelogUrl: api.changelogUrl,
      freeTier: api.freeTier,
      status: api.status,
      source: api.source,
      verified: api.verified,
      featured: api.featured,
      lastCheckedAt: api.lastCheckedAt.toISOString(),
      tags: api.tags,
      metadata: api.metadata,
      provider: api.provider,
      metrics: {
        averageRating: Number((aggregated._avg.rating ?? 0).toFixed(2)),
        reviewCount: aggregated._count.rating ?? 0,
        followerCount: api.followers.length,
      },
      reviews: api.reviews.map((review) => ({
        id: review.id,
        nickname: review.nickname,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt.toISOString(),
      })),
      pricingHistory: api.pricingHistory.map((history) => ({
        id: history.id,
        previousHash: history.previousHash,
        newHash: history.newHash,
        diff: history.diff,
        snapshot: history.snapshot,
        createdAt: history.createdAt.toISOString(),
      })),
    },
  };

  return res.status(200).json(payload);
}
