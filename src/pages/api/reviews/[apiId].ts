import crypto from 'crypto';
import type { NextApiRequest, NextApiResponse } from 'next';

import prisma from '@/lib/prisma';

type ReviewsResponse = {
  reviews: Array<{
    id: string;
    nickname: string;
    rating: number;
    comment: string | null;
    createdAt: string;
  }>;
  average: number;
  count: number;
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
  };
};

const MAX_REVIEW_LENGTH = 750;

const getClientIp = (req: NextApiRequest): string => {
  const xff = req.headers['x-forwarded-for'];
  if (Array.isArray(xff)) {
    return xff[0];
  }
  if (typeof xff === 'string') {
    return xff.split(',')[0]?.trim() ?? 'unknown';
  }
  return (req.socket?.remoteAddress ?? 'unknown').replace('::ffff:', '');
};

const buildIpHash = (req: NextApiRequest): string => {
  const ip = getClientIp(req);
  const agent = req.headers['user-agent'] ?? '';
  return crypto.createHash('sha256').update(`${ip}:${agent}`).digest('hex');
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ReviewsResponse | { error: string } | { deleted: string }>,
) {
  const identifierParam = req.query.apiId;
  const identifier = Array.isArray(identifierParam) ? identifierParam[0] : identifierParam;

  if (!identifier) {
    return res.status(400).json({ error: 'Missing api identifier' });
  }

  const api = await prisma.api.findFirst({
    where: {
      OR: [{ id: identifier }, { slug: identifier }],
    },
    select: { id: true, name: true },
  });

  if (!api) {
    return res.status(404).json({ error: 'API not found' });
  }

  switch (req.method) {
    case 'GET': {
      const { page = '1', limit = '50' } = req.query;
      const pageNumber = Math.max(1, Number(page));
      const limitNumber = Math.min(Math.max(1, Number(limit)), 200);
      const skip = (pageNumber - 1) * limitNumber;

      const [total, reviews] = await Promise.all([
        prisma.review.count({ where: { apiId: api.id } }),
        prisma.review.findMany({
          where: { apiId: api.id },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limitNumber,
          select: {
            id: true,
            nickname: true,
            rating: true,
            comment: true,
            createdAt: true,
          },
        }),
      ]);

      const aggregate = await prisma.review.aggregate({
        where: { apiId: api.id },
        _avg: { rating: true },
      });

      return res.status(200).json({
        reviews: reviews.map((review) => ({
          ...review,
          createdAt: review.createdAt.toISOString(),
        })),
        average: Number((aggregate._avg.rating ?? 0).toFixed(2)),
        count: total,
        pagination: {
          page: pageNumber,
          limit: limitNumber,
          totalPages: Math.max(1, Math.ceil(total / limitNumber)),
        },
      });
    }
    case 'POST': {
      const { nickname, rating, comment } = req.body ?? {};

      const trimmedNickname = typeof nickname === 'string' ? nickname.trim() : '';
      const parsedRating = Number(rating);
      const trimmedComment = typeof comment === 'string' ? comment.trim() : null;

      if (!trimmedNickname) {
        return res.status(400).json({ error: 'Nickname is required' });
      }

      if (!Number.isFinite(parsedRating) || parsedRating < 1 || parsedRating > 5) {
        return res.status(400).json({ error: 'Rating must be between 1 and 5' });
      }

      if (trimmedComment && trimmedComment.length > MAX_REVIEW_LENGTH) {
        return res
          .status(400)
          .json({ error: `Comment is too long (max ${MAX_REVIEW_LENGTH} characters)` });
      }

      const review = await prisma.review.create({
        data: {
          apiId: api.id,
          nickname: trimmedNickname.slice(0, 60),
          rating: Math.round(parsedRating),
          comment: trimmedComment,
          ipHash: buildIpHash(req),
        },
        select: {
          id: true,
          nickname: true,
          rating: true,
          comment: true,
          createdAt: true,
        },
      });

      const aggregate = await prisma.review.aggregate({
        where: { apiId: api.id },
        _avg: { rating: true },
        _count: { rating: true },
      });

      return res.status(201).json({
        reviews: [
          {
            ...review,
            createdAt: review.createdAt.toISOString(),
          },
        ],
        average: Number((aggregate._avg.rating ?? review.rating).toFixed(2)),
        count: aggregate._count.rating ?? 1,
        pagination: {
          page: 1,
          limit: 1,
          totalPages: 1,
        },
      });
    }
    case 'DELETE': {
      const adminToken = process.env.ADMIN_API_TOKEN;
      if (!adminToken || req.headers['x-admin-token'] !== adminToken) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { id } = req.body ?? {};
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Review id is required' });
      }

      await prisma.review.delete({ where: { id } });

      return res.status(200).json({ deleted: id });
    }
    default: {
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      return res.status(405).json({ error: 'Method Not Allowed' });
    }
  }
}
