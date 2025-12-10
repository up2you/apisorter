import { ApiStatus } from '@prisma/client';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useCallback, useState, useEffect } from 'react';
import { format } from 'date-fns';

import AddReviewForm from '@/components/AddReviewForm.client';
import ApiCard from '@/components/ApiCard';
import RatingStars from '@/components/RatingStars.client';
import ReviewList from '@/components/ReviewList.client';
import SiteFooter from '@/components/layout/SiteFooter';
import SiteHeader from '@/components/layout/SiteHeader';
import { getDatasetDetail, getDatasetRelated } from '@/lib/catalogData';
import prisma from '@/lib/prisma';
import ClaimButton from '@/components/provider/ClaimButton';

type ApiDetailProps = {
  api: {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    category: string;
    tags: string[];
    docsUrl: string;
    pricingUrl: string | null;
    changelogUrl: string | null;
    freeTier: string | null;
    logoUrl?: string | null;
    metadata: Record<string, unknown> | null;
    provider: { id?: string; name: string | null; website: string | null; logoUrl: string | null; claimStatus?: string | null } | null;
    metrics: { averageRating: number; reviewCount: number; followerCount: number };
    pricingHistory: Array<{ id: string; createdAt: string; newHash: string | null; diff: Record<string, unknown> | null }>;
    source: 'database' | 'dataset';
  };
  related: Array<{
    id: string;
    slug: string;
    name: string;
    category: string;
    tags: string[];
    freeTier: string | null;
    provider: { name: string | null; logoUrl: string | null } | null;
    metrics: { averageRating: number; reviewCount: number };
    source?: 'database' | 'dataset';
  }>;
  initialReviews: Array<{
    id: string;
    nickname: string;
    rating: number;
    comment: string | null;
    createdAt: string;
  }>;
  initialAverage: number;
  initialCount: number;
};

export default function ApiDetailPage({ api, related, initialReviews, initialAverage, initialCount }: ApiDetailProps) {
  const [reviews, setReviews] = useState(initialReviews);
  const [average, setAverage] = useState(initialAverage);
  const [count, setCount] = useState(initialCount);
  const isDatasetSource = api.source === 'dataset';

  // Analytics: Track View
  useEffect(() => {
    // Fire and forget
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'view', apiId: api.id })
    }).catch(err => console.error('View track error', err));
  }, [api.id]);

  const handleTrackClick = () => {
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'click', apiId: api.id })
    }).catch(err => console.error('Click track error', err));
  };

  const refreshReviews = useCallback(async () => {
    if (api.source === 'dataset') {
      return;
    }
    const response = await fetch(`/api/reviews/${api.slug}?limit=50`);
    if (!response.ok) return;
    const payload = await response.json();
    setReviews(payload.reviews ?? []);
    setAverage(payload.average ?? 0);
    setCount(payload.count ?? 0);
  }, [api.slug, api.source]);

  return (
    <>
      <Head>
        <title>{api.name} — API Sorter</title>
        <meta
          name="description"
          content={`Discover ${api.name} API details, pricing tiers, documentation links, and community reviews.`}
        />
      </Head>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-6 pb-20">
        <section className="mt-12 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
          <div className="rounded-[32px] border border-white/10 bg-gradient-to-br from-white/[0.08] via-surface to-transparent p-8 md:p-10 shadow-2xl backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/10 text-2xl text-white overflow-hidden">
                {api.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={api.logoUrl} alt={api.name} className="h-full w-full object-cover" />
                ) : api.provider?.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={api.provider.logoUrl} alt={api.provider.name ?? api.name} className="h-10 w-10" />
                ) : (
                  api.name.slice(0, 2).toUpperCase()
                )}
              </div>
              <div>
                <h1 className="text-3xl font-semibold text-white">{api.name}</h1>
                <div className="flex items-center gap-3">
                  <p className="text-sm text-gray-400">{api.provider?.name ?? 'Independent provider'}</p>
                  {api.provider && api.provider.id && (
                    <ClaimButton
                      providerId={api.provider.id}
                      providerName={api.provider.name || ''}
                      claimStatus={api.provider.claimStatus || 'UNCLAIMED'}
                    />
                  )}
                </div>
              </div>
            </div>
            {api.description && <p className="mt-6 max-w-3xl text-sm text-gray-300">{api.description}</p>}
            {isDatasetSource && (
              <div className="mt-4 rounded-2xl border border-accent/20 bg-accent/10 px-4 py-3 text-xs text-accent">
                This entry is sourced from organized Excel data and currently provides basic information and external search links only.
              </div>
            )}
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="rounded-full bg-accent/20 px-4 py-1 text-xs font-semibold text-accent">{api.category}</span>
              {api.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-white/10 px-3 py-1 text-xs text-gray-300">
                  #{tag}
                </span>
              ))}
              {api.freeTier && (
                <span className="rounded-full bg-highlight/20 px-3 py-1 text-xs text-highlight">Free tier</span>
              )}
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-6 text-sm text-gray-300">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1">
                ⭐ {average.toFixed(2)}
                <span className="text-xs text-gray-500">({count} reviews)</span>
              </span>
              <a
                href={api.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleTrackClick}
                className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-midnight transition-colors hover:bg-highlight"
              >
                View docs ↗
              </a>
              {api.pricingUrl && (
                <a
                  href={api.pricingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleTrackClick}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-gray-200 hover:border-accent"
                >
                  Pricing ↗
                </a>
              )}
              {api.provider?.website && (
                <a
                  href={api.provider.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleTrackClick}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-gray-200 hover:border-accent"
                >
                  Provider ↗
                </a>
              )}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md">
              <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-400">Ratings</h2>
              <div className="mt-4 flex items-center gap-3 text-3xl font-semibold text-white">
                {average.toFixed(2)}
                <RatingStars rating={average} size="lg" />
              </div>
              <p className="mt-2 text-sm text-gray-400">Based on {count} anonymous reviews.</p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-sm text-gray-300 backdrop-blur-md">
              <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-400">Metadata</h3>
              <dl className="mt-4 space-y-3">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Followers</dt>
                  <dd className="font-semibold text-white">{api.metrics.followerCount}</dd>
                </div>
                {/* Views & Clicks (Optional to show publicly? Maybe not. Keep internal.) */}
                {api.metadata && Object.keys(api.metadata).length > 0 &&
                  Object.entries(api.metadata).slice(0, 4).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <dt className="text-gray-500">{key}</dt>
                      <dd className="font-semibold text-white">
                        {typeof value === 'string' ? value : JSON.stringify(value)}
                      </dd>
                    </div>
                  ))}
              </dl>
            </div>
          </aside>
        </section>

        <section className="mt-14 grid gap-10 lg:grid-cols-[1.7fr_1.3fr]">
          <div>
            <h2 className="text-xl font-semibold text-white">Community Reviews</h2>
            <div className="mt-4">
              <ReviewList reviews={reviews} />
            </div>
          </div>
          {!isDatasetSource && (
            <div>
              <AddReviewForm apiId={api.slug} onSubmitted={refreshReviews} />
            </div>
          )}
        </section>

        <section className="mt-16">
          <h2 className="text-xl font-semibold text-white">Documentation updates</h2>
          {api.pricingHistory.length === 0 ? (
            <p className="mt-3 text-sm text-gray-400">No tracked documentation changes yet.</p>
          ) : (
            <ol className="mt-6 space-y-4">
              {api.pricingHistory.map((history) => (
                <li key={history.id} className="rounded-3xl border border-white/5 bg-white/5 p-6">
                  <div className="text-sm text-gray-500">
                    {format(new Date(history.createdAt), 'PPPpp')}
                  </div>
                  <p className="mt-2 text-sm text-gray-300">Documentation hash updated to {history.newHash ?? 'N/A'}.</p>
                  {history.diff && Object.keys(history.diff).length > 0 && (
                    <pre className="mt-3 overflow-x-auto rounded-2xl bg-midnight/60 p-4 text-xs text-gray-300">
                      {JSON.stringify(history.diff, null, 2)}
                    </pre>
                  )}
                </li>
              ))}
            </ol>
          )}
        </section>

        {related.length > 0 && (
          <section className="mt-16">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Similar APIs</h2>
              <Link href={`/category/${encodeURIComponent(api.category)}`} className="text-sm text-gray-400 hover:text-white">
                View more in {api.category} →
              </Link>
            </div>
            <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {related.map((item) => (
                <ApiCard
                  key={item.id}
                  slug={item.slug}
                  name={item.name}
                  category={item.category}
                  tags={item.tags}
                  providerName={item.provider?.name}
                  providerLogo={item.provider?.logoUrl}
                  freeTier={item.freeTier}
                  rating={item.metrics.averageRating}
                  reviewCount={item.metrics.reviewCount}
                />
              ))}
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  );
}

export const getServerSideProps: GetServerSideProps<ApiDetailProps> = async (context) => {
  const slug = typeof context.params?.slug === 'string' ? context.params.slug : '';
  if (!slug) {
    return { notFound: true };
  }

  const api = await prisma.api.findFirst({
    where: { OR: [{ slug }, { id: slug }] },
    include: {
      provider: {
        select: { id: true, name: true, website: true, logoUrl: true, claimStatus: true },
      },
      pricingHistory: {
        select: { id: true, createdAt: true, newHash: true, diff: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      followers: {
        select: { id: true },
      },
    },
  });

  if (!api) {
    const datasetDetail = getDatasetDetail(slug);
    if (!datasetDetail) {
      return { notFound: true };
    }

    const relatedDataset = getDatasetRelated(datasetDetail.category, datasetDetail.slug, 6);

    return {
      props: {
        api: {
          id: datasetDetail.id,
          slug: datasetDetail.slug,
          name: datasetDetail.name,
          description: datasetDetail.summary.apiProduct || datasetDetail.description,
          category: datasetDetail.category,
          tags: datasetDetail.tags,
          docsUrl: datasetDetail.docsUrl,
          pricingUrl: datasetDetail.pricingUrl,
          changelogUrl: datasetDetail.changelogUrl,
          freeTier: datasetDetail.freeTier,
          metadata: datasetDetail.metadata,
          provider: datasetDetail.provider
            ? { ...datasetDetail.provider, website: datasetDetail.provider.website ?? null }
            : null,
          metrics: {
            averageRating: datasetDetail.metrics.averageRating,
            reviewCount: datasetDetail.metrics.reviewCount,
            followerCount: datasetDetail.metrics.followerCount,
          },
          pricingHistory: [],
          source: 'dataset',
        },
        related: relatedDataset.map((item) => ({
          id: item.id,
          slug: item.slug,
          name: item.name,
          category: item.category,
          tags: item.tags,
          freeTier: item.freeTier,
          provider: item.provider,
          metrics: item.metrics,
          source: item.source,
        })),
        initialReviews: [],
        initialAverage: 0,
        initialCount: 0,
      },
    };
  }

  const [aggregated, reviews, related] = await Promise.all([
    prisma.review.aggregate({
      where: { apiId: api.id },
      _avg: { rating: true },
      _count: { rating: true },
    }),
    prisma.review.findMany({
      where: { apiId: api.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    prisma.api.findMany({
      where: {
        id: { not: api.id },
        category: api.category,
        status: ApiStatus.ACTIVE,
        verified: true,
      },
      take: 6,
      include: {
        provider: {
          select: { name: true, logoUrl: true, id: true, claimStatus: true }, // Added id and claimStatus
        },
      },
    }),
  ]);

  const relatedMetrics = related.length
    ? await prisma.review.groupBy({
      by: ['apiId'],
      where: { apiId: { in: related.map((item) => item.id) } },
      _avg: { rating: true },
      _count: { rating: true },
    })
    : [];

  const relatedRatingMap = relatedMetrics.reduce<Record<string, { avg: number; count: number }>>((acc, entry) => {
    acc[entry.apiId] = {
      avg: entry._avg.rating ?? 0,
      count: entry._count.rating ?? 0,
    };
    return acc;
  }, {});

  return {
    props: {
      api: {
        id: api.id,
        slug: api.slug,
        name: api.name,
        description: api.description,
        category: api.category,
        tags: api.tags,
        docsUrl: api.docsUrl,
        pricingUrl: api.pricingUrl,
        changelogUrl: api.changelogUrl,
        freeTier: api.freeTier,
        logoUrl: api.logoUrl,
        metadata: api.metadata as Record<string, unknown> | null,
        provider: api.provider,
        metrics: {
          averageRating: Number((aggregated._avg.rating ?? 0).toFixed(2)),
          reviewCount: aggregated._count.rating ?? 0,
          followerCount: api.followers.length,
        },
        pricingHistory: api.pricingHistory.map((entry) => ({
          id: entry.id,
          createdAt: entry.createdAt.toISOString(),
          newHash: entry.newHash,
          diff: entry.diff as Record<string, unknown> | null,
        })),
        source: 'database',
      },
      related: related.map((item) => ({
        id: item.id,
        slug: item.slug,
        name: item.name,
        category: item.category,
        tags: item.tags,
        freeTier: item.freeTier,
        logoUrl: item.logoUrl,
        provider: item.provider,
        metrics: {
          averageRating: Number((relatedRatingMap[item.id]?.avg ?? 0).toFixed(2)),
          reviewCount: relatedRatingMap[item.id]?.count ?? 0,
        },
        source: 'database' as const,
      })),
      initialReviews: reviews.map((review) => ({
        id: review.id,
        nickname: review.nickname,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt.toISOString(),
      })),
      initialAverage: Number((aggregated._avg.rating ?? 0).toFixed(2)),
      initialCount: aggregated._count.rating ?? 0,
    },
  };
};

