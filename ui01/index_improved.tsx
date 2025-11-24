import { ApiStatus } from '@prisma/client';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';

import ApiCard from '@/components/ApiCard';
import AdSlot from '@/components/AdSlot';
import CategoryBadge from '@/components/CategoryBadge';
import SiteFooter from '@/components/layout/SiteFooter';
import SiteHeader from '@/components/layout/SiteHeader';
import prisma from '@/lib/prisma';

type FeaturedApi = {
  id: string;
  slug: string;
  name: string;
  category: string;
  tags: string[];
  docsUrl: string;
  freeTier: string | null;
  provider: { name: string | null; logoUrl: string | null } | null;
  metrics: { averageRating: number; reviewCount: number };
};

type CategorySummary = {
  category: string;
  count: number;
};

type SpotlightReview = {
  id: string;
  nickname: string;
  rating: number;
  comment: string | null;
  api: { slug: string; name: string };
  createdAt: string;
};

type HomeProps = {
  featured: FeaturedApi[];
  categories: CategorySummary[];
  spotlightReviews: SpotlightReview[];
};

export default function Home({ featured, categories, spotlightReviews }: HomeProps) {
  return (
    <>
      <Head>
        <title>API Sorter — Discover, Compare & Monitor APIs</title>
        <meta
          name="description"
          content="Browse a curated directory of APIs by category, pricing, and free tiers. Track documentation updates and read community reviews."
        />
      </Head>
      <SiteHeader />
      <main className="relative">
        {/* 英雄區段 */}
        <section className="container-max relative mt-12 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-accent/20 via-midnight to-surface p-12 shadow-lg md:p-16">
          {/* 背景裝飾 */}
          <div className="absolute right-0 top-0 -z-10 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/4 -z-10 h-80 w-80 rounded-full bg-highlight/5 blur-3xl" />

          <div className="relative z-10 max-w-3xl">
            {/* 標籤 */}
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              <span className="text-sm font-semibold text-accent">API CENTER 2.0</span>
            </div>

            {/* 標題 */}
            <h1 className="mt-8 text-5xl font-extrabold leading-tight text-white md:text-6xl">
              Discover, compare & monitor the world's favorite APIs
            </h1>

            {/* 描述 */}
            <p className="mt-6 text-lg text-gray-300">
              Built for developers who move fast. Filter by category, free tiers, and community insights. Stay notified when pricing or docs change.
            </p>

            {/* 特性列表 */}
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
                <span className="text-lg text-accent">★</span>
                <span className="text-sm text-gray-200">Anonymous reviews & ratings</span>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
                <span className="text-lg text-accent">⏱</span>
                <span className="text-sm text-gray-200">Auto link verification every 3 days</span>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
                <span className="text-lg text-accent">🔔</span>
                <span className="text-sm text-gray-200">Resend-powered change alerts</span>
              </div>
            </div>

            {/* CTA 按鈕 */}
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/category/all"
                className="btn btn-primary btn-lg"
              >
                Explore APIs
              </Link>
              <Link
                href="/pricing"
                className="btn btn-secondary btn-lg"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </section>

        {/* 主要內容區段 */}
        <section className="container-max mt-20">
          <div className="flex flex-col gap-12 lg:gap-16 xl:flex-row">
            {/* 精選 APIs */}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-white">Featured APIs</h2>
                  <p className="mt-2 text-gray-400">Discover the most popular and highly-rated APIs</p>
                </div>
                <Link
                  href="/category/all"
                  className="hidden text-sm font-semibold text-accent hover:text-accent-light sm:inline-flex items-center gap-2"
                >
                  View all <span>→</span>
                </Link>
              </div>

              <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {featured.map((api) => (
                  <ApiCard
                    key={api.id}
                    slug={api.slug}
                    name={api.name}
                    category={api.category}
                    tags={api.tags}
                    providerName={api.provider?.name}
                    providerLogo={api.provider?.logoUrl}
                    freeTier={api.freeTier}
                    rating={api.metrics.averageRating}
                    reviewCount={api.metrics.reviewCount}
                  />
                ))}
              </div>

              <div className="mt-8 sm:hidden">
                <Link
                  href="/category/all"
                  className="btn btn-secondary w-full"
                >
                  View all APIs →
                </Link>
              </div>
            </div>

            {/* 側邊欄 */}
            <aside className="w-full space-y-6 lg:w-80">
              {/* 廣告位 */}
              <AdSlot
                title="Promote your API to 50k+ builders"
                description="Reserve this 300×250 spotlight to showcase your platform launch or pricing update."
                size="300×250"
              />

              {/* 分類 */}
              <div className="card p-6">
                <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-400">
                  Browse by Category
                </h3>
                <div className="mt-5 flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Link
                      key={category.category}
                      href={`/category/${encodeURIComponent(category.category)}`}
                    >
                      <CategoryBadge label={category.category} count={category.count} />
                    </Link>
                  ))}
                </div>
              </div>

              {/* 快速開始 */}
              <div className="card p-6">
                <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-400">
                  Quick Start
                </h3>
                <ul className="mt-5 space-y-3 text-sm text-gray-300">
                  <li className="flex items-start gap-3">
                    <span className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent/20 text-xs text-accent">1</span>
                    <span>Browse APIs by category or search</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent/20 text-xs text-accent">2</span>
                    <span>Read community reviews and ratings</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent/20 text-xs text-accent">3</span>
                    <span>Get notified about pricing changes</span>
                  </li>
                </ul>
              </div>
            </aside>
          </div>
        </section>

        {/* 社群評論區段 */}
        <section className="container-max mt-24">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white">Community Spotlight</h2>
              <p className="mt-2 text-gray-400">What developers are saying about their favorite APIs</p>
            </div>
            <Link
              href="/community"
              className="hidden text-sm font-semibold text-accent hover:text-accent-light sm:inline-flex items-center gap-2"
            >
              Browse all reviews <span>→</span>
            </Link>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {spotlightReviews.map((review) => (
              <article
                key={review.id}
                className="card flex h-full flex-col justify-between p-6 transition-all duration-300 hover:border-accent/30"
              >
                <div>
                  <Link
                    href={`/api/${review.api.slug}`}
                    className="inline-block text-sm font-semibold text-accent hover:text-accent-light"
                  >
                    {review.api.name}
                  </Link>
                  <p className="mt-3 text-base text-gray-200">
                    "{review.comment ?? 'No comment provided'}"
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4 text-sm text-gray-400">
                  <span className="font-medium">{review.nickname}</span>
                  <span className="flex items-center gap-1">
                    <span className="text-highlight">⭐</span>
                    <span className="font-semibold text-white">{review.rating}</span>
                    <span>/5</span>
                  </span>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-8 sm:hidden">
            <Link
              href="/community"
              className="btn btn-secondary w-full"
            >
              Browse all reviews →
            </Link>
          </div>
        </section>

        {/* 廣告區段 */}
        <section className="container-max mt-24">
          <AdSlot
            title="Banner slot — 728×90"
            description="Highlight upcoming launches or product announcements on the homepage masthead."
            size="728×90"
          />
        </section>

        {/* 底部 CTA */}
        <section className="container-max mt-24 mb-12">
          <div className="card relative overflow-hidden p-12 text-center md:p-16">
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-accent/10 via-transparent to-highlight/10" />
            
            <h2 className="text-3xl font-bold text-white md:text-4xl">
              Ready to explore the API ecosystem?
            </h2>
            <p className="mt-4 text-lg text-gray-300">
              Join thousands of developers discovering and monitoring the APIs that power their applications.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/category/all"
                className="btn btn-primary btn-lg"
              >
                Start Exploring
              </Link>
              <Link
                href="/pricing"
                className="btn btn-secondary btn-lg"
              >
                View Plans
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

export const getServerSideProps: GetServerSideProps<HomeProps> = async () => {
  const [featuredApis, categoryEntries, reviewSpotlight] = await Promise.all([
    prisma.api.findMany({
      where: { status: ApiStatus.ACTIVE, verified: true },
      take: 6,
      orderBy: [
        { featured: 'desc' },
        { updatedAt: 'desc' },
      ],
      include: {
        provider: {
          select: { name: true, logoUrl: true },
        },
      },
    }),
    prisma.api.findMany({
      where: { status: ApiStatus.ACTIVE, verified: true },
      select: { category: true },
    }),
    prisma.review.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        api: {
          select: { slug: true, name: true },
        },
      },
    }),
  ]);

  const reviewAverages = featuredApis.length
    ? await prisma.review.groupBy({
        by: ['apiId'],
        where: { apiId: { in: featuredApis.map((api) => api.id) } },
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

  const categorySummary = categoryEntries.reduce<Record<string, number>>((acc, entry) => {
    if (!entry.category) return acc;
    acc[entry.category] = (acc[entry.category] ?? 0) + 1;
    return acc;
  }, {});

  return {
    props: {
      featured: featuredApis.map((api) => ({
        id: api.id,
        slug: api.slug,
        name: api.name,
        category: api.category,
        tags: api.tags,
        docsUrl: api.docsUrl,
        freeTier: api.freeTier,
        provider: api.provider,
        metrics: {
          averageRating: Number((averageMap[api.id]?.avg ?? 0).toFixed(2)),
          reviewCount: averageMap[api.id]?.count ?? 0,
        },
      })),
      categories: Object.entries(categorySummary)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 12),
      spotlightReviews: reviewSpotlight.map((review) => ({
        id: review.id,
        nickname: review.nickname,
        rating: review.rating,
        comment: review.comment,
        api: review.api,
        createdAt: review.createdAt.toISOString(),
      })),
    },
  };
};
