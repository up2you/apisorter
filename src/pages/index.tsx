import { useMemo, useState } from 'react';
import { ApiStatus } from '@prisma/client';
import { getCategoryIcon } from '@/lib/categoryIcons';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';

import ApiCard from '@/components/ApiCard';
import AdSlot from '@/components/AdSlot';
import SiteFooter from '@/components/layout/SiteFooter';
import SiteHeader from '@/components/layout/SiteHeader';
import { CATEGORY_NAMES } from '@/data/categories';
import { getDatasetCatalog, getDatasetCategoriesCounts } from '@/lib/catalogData';
import prisma from '@/lib/prisma';
import type { CatalogApi } from '@/types/catalog';

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
  featured: CatalogApi[];
  catalog: CatalogApi[];
  categories: CategorySummary[];
  spotlightReviews: SpotlightReview[];
};

export default function Home({ featured, catalog, categories, spotlightReviews }: HomeProps) {
  // Use only top 6 featured items for the homepage
  const displayFeatured = featured.slice(0, 6);

  // Use only top 6 latest items from catalog for "New Arrivals" or similar if needed
  // For now we will just show Featured and Categories

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
        {/* Hero Section - Compacted */}
        <section className="container-max relative mt-8 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-accent/20 via-midnight to-surface p-8 shadow-lg md:p-12">
          <div className="absolute right-0 top-0 -z-10 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/4 -z-10 h-80 w-80 rounded-full bg-highlight/5 blur-3xl" />

          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 mb-6">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              <span className="text-xs font-semibold text-accent">API CENTER 2.0</span>
            </div>

            <h1 className="text-4xl font-extrabold leading-tight text-white md:text-5xl">
              Discover, compare & monitor the world's favorite APIs
            </h1>

            <p className="mt-4 text-base text-gray-300 max-w-2xl mx-auto">
              Built for developers who move fast. Filter by category, free tiers, and community insights. Stay notified when pricing or docs change.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link href="/category/all" className="btn btn-primary">
                Explore APIs
              </Link>
              <Link href="/pricing" className="btn btn-secondary">
                View Pricing
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <span className="text-accent">★</span>
                <span>Anonymous reviews</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-accent">⏱</span>
                <span>Auto verification</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-accent">🔔</span>
                <span>Change alerts</span>
              </div>
            </div>
          </div>
        </section>

        {/* Featured APIs Section */}
        <section className="container-max mt-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white">Featured APIs</h2>
              <p className="text-sm text-gray-400">Top picks from the community</p>
            </div>
            <Link href="/category/all" className="text-sm font-semibold text-accent hover:text-accent-light">
              View all APIs →
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {displayFeatured.map((api) => (
              <ApiCard
                key={api.id}
                slug={api.slug}
                name={api.name}
                category={api.category}
                tags={api.tags}
                providerName={api.provider?.name}
                providerLogo={api.provider?.logoUrl}
                apiLogo={api.logoUrl}
                freeTier={api.freeTier}
                rating={api.metrics.averageRating}
                reviewCount={api.metrics.reviewCount}
              />
            ))}
          </div>
        </section>

        {/* Categories Grid */}
        <section className="container-max mt-16">
          <h2 className="text-2xl font-bold text-white mb-8">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.slice(0, 8).map((category) => (

              <Link
                key={category.category}
                href={`/category/${encodeURIComponent(category.category)}`}
                className="card p-4 hover:border-accent/50 transition-colors group flex items-center gap-3"
              >
                <div className="h-10 w-10 rounded-lg bg-white/5 p-2 group-hover:bg-accent/10 transition-colors">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={getCategoryIcon(category.category)} alt="" className="h-full w-full object-contain" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm group-hover:text-accent truncate">{category.category}</h3>
                  <p className="text-xs text-gray-400 mt-1">{category.count} APIs</p>
                </div>
              </Link>
            ))}
            <Link
              href="/category/all"
              className="card p-4 hover:border-accent/50 transition-colors flex items-center justify-center text-accent font-medium"
            >
              View All Categories →
            </Link>
          </div>
        </section>

        {/* Community Spotlight */}
        <section className="container-max mt-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white">Community Spotlight</h2>
              <p className="text-sm text-gray-400">Recent reviews from developers</p>
            </div>
            <Link href="/community" className="text-sm font-semibold text-accent hover:text-accent-light">
              Read more reviews →
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {spotlightReviews.slice(0, 3).map((review) => (
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
                  <p className="mt-3 text-sm text-gray-200 line-clamp-3">
                    "{review.comment ?? 'No comment provided'}"
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4 text-xs text-gray-400">
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
        </section>

        {/* Bottom CTA */}
        <section className="container-max mt-20 mb-12">
          <div className="card relative overflow-hidden p-8 text-center md:p-12">
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-accent/10 via-transparent to-highlight/10" />

            <h2 className="text-2xl font-bold text-white md:text-3xl">
              Ready to explore the ecosystem?
            </h2>
            <p className="mt-3 text-base text-gray-300">
              Join thousands of developers discovering and monitoring APIs.
            </p>
            <div className="mt-6 flex justify-center">
              <Link
                href="/category/all"
                className="btn btn-primary"
              >
                Start Exploring
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
  const datasetCatalog = getDatasetCatalog();
  const datasetCategoryCounts = getDatasetCategoriesCounts();

  const [allApis, reviewSpotlight] = await Promise.all([
    prisma.api.findMany({
      where: { status: ApiStatus.ACTIVE, verified: true },
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
    prisma.review.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        api: { select: { slug: true, name: true } },
      },
    }),
  ]);

  const reviewAverages = allApis.length
    ? await prisma.review.groupBy({
      by: ['apiId'],
      where: { apiId: { in: allApis.map((api) => api.id) } },
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

  const dbCatalog = allApis.map((api) => ({
    id: api.id,
    slug: api.slug,
    name: api.name,
    category: api.category,
    tags: api.tags,
    docsUrl: api.docsUrl,
    freeTier: api.freeTier,
    logoUrl: api.logoUrl,
    provider: api.provider,
    metrics: {
      averageRating: Number((averageMap[api.id]?.avg ?? 0).toFixed(2)),
      reviewCount: averageMap[api.id]?.count ?? 0,
    },
    source: 'database' as const,
  }));

  const dbSlugs = new Set(dbCatalog.map((item) => item.slug));
  const mergedCatalog: CatalogApi[] = [
    ...dbCatalog,
    ...datasetCatalog.filter((entry) => !dbSlugs.has(entry.slug)),
  ];

  let featured: CatalogApi[] = dbCatalog.slice(0, 6);
  if (featured.length < 6) {
    const datasetFallbacks = datasetCatalog.filter(
      (entry) => !featured.some((api) => api.slug === entry.slug),
    );
    featured = [...featured, ...datasetFallbacks.slice(0, 6 - featured.length)];
  }

  const categoriesCounts = mergedCatalog.reduce<Record<string, number>>((acc, api) => {
    if (!api.category) return acc;
    acc[api.category] = (acc[api.category] ?? 0) + 1;
    return acc;
  }, { ...datasetCategoryCounts });

  const predefinedCategories = CATEGORY_NAMES.map((category) => ({
    category,
    count: categoriesCounts[category] ?? 0,
  }));

  const additionalCategories = Object.entries(categoriesCounts)
    .filter(([category]) => !CATEGORY_NAMES.includes(category))
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  return {
    props: {
      featured,
      catalog: mergedCatalog,
      categories: [...predefinedCategories, ...additionalCategories],
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
