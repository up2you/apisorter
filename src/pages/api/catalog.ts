import { ApiStatus, Prisma } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';

import prisma from '@/lib/prisma';

type CatalogResponse = {
  data: Array<{
    id: string;
    slug: string;
    name: string;
    category: string;
    tags: string[];
    docsUrl: string;
    pricingUrl: string | null;
    freeTier: string | null;
    status: string;
    verified: boolean;
    featured: boolean;
    provider: {
      id: string;
      name: string;
      logoUrl: string | null;
    } | null;
    metrics: {
      averageRating: number;
      reviewCount: number;
      followerCount: number;
    };
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

const DEFAULT_LIMIT = 24;
const MAX_LIMIT = 100;

const toBoolean = (value?: string | string[]) => {
  if (!value) return false;
  const normalized = Array.isArray(value) ? value[0] : value;
  return ['1', 'true', 'yes'].includes(normalized.toLowerCase());
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CatalogResponse | { error: string }>,
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { category, q, tags, page = '1', limit = DEFAULT_LIMIT.toString(), free } = req.query;

  const pageNumber = Math.max(1, Number(page));
  const limitNumber = Math.min(Math.max(1, Number(limit)), MAX_LIMIT);
  const skip = (pageNumber - 1) * limitNumber;

  const filters: Prisma.ApiWhereInput = {
    status: ApiStatus.ACTIVE,
    verified: true,
  };

  if (category) {
    filters.category = Array.isArray(category) ? category[0] : category;
  }

  const searchTerm = Array.isArray(q) ? q[0] : q;
  if (searchTerm) {
    filters.OR = [
      { name: { contains: searchTerm, mode: 'insensitive' } },
      { description: { contains: searchTerm, mode: 'insensitive' } },
      { tags: { has: searchTerm.toLowerCase() } },
    ];
  }

  if (tags) {
    const tagList = (Array.isArray(tags) ? tags : tags.split(',')).map((tag) => tag.trim().toLowerCase());
    if (tagList.length) {
      filters.tags = { hasSome: tagList };
    }
  }

  if (toBoolean(free)) {
    filters.freeTier = { not: null };
  }

  const [total, apis] = await Promise.all([
    prisma.api.count({ where: filters }),
    prisma.api.findMany({
      where: filters,
      take: limitNumber,
      skip,
      orderBy: [
        { featured: 'desc' },
        { name: 'asc' },
      ],
      include: {
        provider: {
          select: { id: true, name: true, logoUrl: true },
        },
        followers: {
          select: { id: true },
        },
      },
    }),
  ]);

  const reviewAverages = apis.length
    ? await prisma.review.groupBy({
        by: ['apiId'],
        where: { apiId: { in: apis.map((api) => api.id) } },
        _avg: { rating: true },
        _count: { rating: true },
      })
    : [];

  const averageMap = reviewAverages.reduce<Record<string, { avg: number; count: number }>>((acc, curr) => {
    acc[curr.apiId] = {
      avg: curr._avg.rating ?? 0,
      count: curr._count.rating ?? 0,
    };
    return acc;
  }, {});

  const data = apis.map((api) => {
    const metrics = averageMap[api.id] ?? { avg: 0, count: 0 };
    return {
      id: api.id,
      slug: api.slug,
      name: api.name,
      category: api.category,
      tags: api.tags,
      docsUrl: api.docsUrl,
      pricingUrl: api.pricingUrl,
      freeTier: api.freeTier,
      status: api.status,
      verified: api.verified,
      featured: api.featured,
      provider: api.provider,
      metrics: {
        averageRating: Number(metrics.avg.toFixed(2)),
        reviewCount: metrics.count,
        followerCount: api.followers.length,
      },
    };
  });

  const pagination = {
    page: pageNumber,
    limit: limitNumber,
    total,
    totalPages: Math.max(1, Math.ceil(total / limitNumber)),
  };

  return res.status(200).json({ data, pagination });
}
