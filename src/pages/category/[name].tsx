import { ApiStatus, Prisma } from '@prisma/client';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';

import ApiCard from '@/components/ApiCard';
import AdUnit from '@/components/ads/AdUnit';
import CategoryBadge from '@/components/CategoryBadge';
import Pagination from '@/components/Pagination';
import SiteFooter from '@/components/layout/SiteFooter';
import SiteHeader from '@/components/layout/SiteHeader';
import { CATEGORY_NAMES } from '@/data/categories';
import { filterDatasetCatalog, getDatasetCatalog, getDatasetCategoriesCounts } from '@/lib/catalogData';
import prisma from '@/lib/prisma';
import type { CatalogApi } from '@/types/catalog';

type CategoryPageProps = {
  category: string;
  searchTerm: string;
  freeOnly: boolean;
  apis: CatalogApi[];
  categories: Array<{ category: string; count: number }>;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
};

const ITEMS_PER_PAGE = 24;

export default function CategoryPage({
  category,
  searchTerm,
  freeOnly,
  apis,
  categories,
  pagination,
}: CategoryPageProps) {
  const title = category === 'all' ? 'All APIs' : `${category} APIs`;

  return (
    <>
      <Head>
        <title>{title} — API Sorter</title>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "CollectionPage",
              "name": title,
              "description": `Browse curated ${category === 'all' ? '' : category} APIs with real-time link verification, pricing history, and community feedback.`,
              "url": `https://apisorter.com/category/${encodeURIComponent(category)}`,
              "breadcrumb": {
                "@type": "BreadcrumbList",
                "itemListElement": [{
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": "https://apisorter.com"
                }, {
                  "@type": "ListItem",
                  "position": 2,
                  "name": title
                }]
              }
            })
          }}
        />
      </Head>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-6">
        <section className="mt-12">
          <div className="flex flex-col gap-6 rounded-[32px] border border-white/5 bg-white/5 p-8 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-semibold text-white">{title}</h1>
                <p className="mt-2 max-w-2xl text-sm text-gray-400">
                  Browse curated APIs with real-time link verification, pricing history, and community feedback.
                  Filter by free tiers or explore adjacent categories.
                </p>
              </div>
              <div className="hidden md:block w-[300px]">
                <AdUnit slotKey="category-header-ad" />
              </div>
            </div>

            <form method="get" className="grid gap-4 md:grid-cols-3">
              <div className="md:col-span-2">
                <label className="text-xs uppercase tracking-wide text-gray-400" htmlFor="q">
                  Search within {category === 'all' ? 'the catalog' : category}
                </label>
                <input
                  id="q"
                  name="q"
                  defaultValue={searchTerm}
                  placeholder="Search by API name, doc keywords, or tags"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-midnight/50 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
                />
              </div>
              <div className="flex items-end">
                <label className="inline-flex items-center gap-2 text-sm text-gray-300">
                  <input
                    type="checkbox"
                    name="free"
                    value="1"
                    defaultChecked={freeOnly}
                    className="h-4 w-4 rounded border-white/10 bg-midnight/50 text-accent focus:ring-accent/30"
                  />
                  Free tier available
                </label>
                <button
                  type="submit"
                  className="ml-auto inline-flex items-center rounded-full bg-accent px-5 py-2 text-sm font-semibold text-midnight transition-colors hover:bg-highlight"
                >
                  Apply filters
                </button>
              </div>
            </form>
          </div>
        </section>

        <section className="mt-12">
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/category/all">
              <CategoryBadge label="All" active={category === 'all'} />
            </Link>
            {categories.map((item) => (
              <Link key={item.category} href={`/category/${encodeURIComponent(item.category)}`}>
                <CategoryBadge label={item.category} count={item.count} active={item.category === category} />
              </Link>
            ))}
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {apis.length === 0 ? (
              <div className="col-span-full rounded-3xl border border-dashed border-white/10 bg-white/5 p-10 text-center text-gray-400">
                No APIs matched your filters. Try another keyword or disable the free tier filter.
              </div>
            ) : (
              apis.map((api) => (
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
                  description={api.description}
                />
              ))
            )}
          </div>

          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            baseUrl={`/category/${category}`}
            searchParams={{
              q: searchTerm,
              free: freeOnly ? '1' : undefined,
            }}
          />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

export const getServerSideProps: GetServerSideProps<CategoryPageProps> = async (context) => {
  const rawCategory = context.params?.name;
  const category = typeof rawCategory === 'string' ? decodeURIComponent(rawCategory) : 'all';
  const searchTerm = typeof context.query.q === 'string' ? context.query.q.trim() : '';
  const freeOnly = typeof context.query.free !== 'undefined';

  // Pagination
  const page = Number(context.query.page) || 1;
  const currentPage = Math.max(1, page);

  const filters: Prisma.ApiWhereInput = {
    status: ApiStatus.ACTIVE,
    verified: true,
  };

  if (category !== 'all') {
    filters.category = category;
  }

  if (searchTerm) {
    filters.OR = [
      { name: { contains: searchTerm, mode: 'insensitive' } },
      { description: { contains: searchTerm, mode: 'insensitive' } },
      { tags: { has: searchTerm.toLowerCase() } },
    ];
  }

  if (freeOnly) {
    filters.freeTier = { not: null };
  }

  const datasetCatalog = getDatasetCatalog();
  const datasetCategoryCounts = getDatasetCategoriesCounts();

  // Fetch more items than needed to handle potential duplicates, but we'll slice later
  // Since we are merging DB and static data, we need to fetch all relevant DB items first (or a large enough subset)
  // For simplicity and correctness with mixed data sources, we'll fetch a reasonable limit from DB
  // and then merge, filter, and paginate in memory.
  // Note: For very large datasets, this strategy should be optimized to paginate at the DB level + separate static data pagination.
  // Given the current scale, in-memory pagination after fetching is acceptable.

  const [dbApis, categoryEntries] = await Promise.all([
    prisma.api.findMany({
      where: filters,
      include: {
        provider: {
          select: { name: true, logoUrl: true },
        },
      },
      orderBy: [{ featured: 'desc' }, { updatedAt: 'desc' }],
      take: 1000, // Fetch up to 1000 to merge with static data
    }),
    prisma.api.findMany({
      where: { status: ApiStatus.ACTIVE, verified: true },
      select: { category: true },
    }),
  ]);

  const averages = dbApis.length
    ? await prisma.review.groupBy({
      by: ['apiId'],
      where: { apiId: { in: dbApis.map((api) => api.id) } },
      _avg: { rating: true },
      _count: { rating: true },
    })
    : [];

  const metrics = averages.reduce<Record<string, { avg: number; count: number }>>((acc, entry) => {
    acc[entry.apiId] = {
      avg: entry._avg.rating ?? 0,
      count: entry._count.rating ?? 0,
    };
    return acc;
  }, {});

  const categorySummary = categoryEntries.reduce<Record<string, number>>((acc, entry) => {
    if (!entry.category) return acc;
    acc[entry.category] = (acc[entry.category] ?? 0) + 1;
    return acc;
  }, {});

  const datasetMatches = filterDatasetCatalog({ category, searchTerm, freeOnly });
  const dbCatalog = dbApis.map((api) => ({
    id: api.id,
    slug: api.slug,
    name: api.name,
    category: api.category,
    tags: api.tags,
    freeTier: api.freeTier,
    logoUrl: api.logoUrl,
    provider: api.provider,
    metrics: {
      averageRating: Number((metrics[api.id]?.avg ?? 0).toFixed(2)),
      reviewCount: metrics[api.id]?.count ?? 0,
    },
    docsUrl: api.docsUrl,
    description: api.description,
    source: 'database' as const,
  }));

  const dbSlugs = new Set(dbCatalog.map((item) => item.slug));

  // Merge DB and Dataset
  const combinedApis: CatalogApi[] = [
    ...dbCatalog,
    ...datasetMatches.filter((item) => !dbSlugs.has(item.slug)),
  ];

  // Calculate pagination
  const totalItems = combinedApis.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedApis = combinedApis.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const combinedCategorySummary = Object.entries(datasetCategoryCounts).reduce<Record<string, number>>(
    (acc, [key, value]) => {
      acc[key] = value;
      return acc;
    },
    {},
  );

  for (const [key, value] of Object.entries(categorySummary)) {
    combinedCategorySummary[key] = (combinedCategorySummary[key] ?? 0) + value;
  }

  const predefinedCategories = CATEGORY_NAMES.map((item) => ({
    category: item,
    count: combinedCategorySummary[item] ?? 0,
  }));

  const additionalCategories = Object.entries(combinedCategorySummary)
    .filter(([item]) => !CATEGORY_NAMES.includes(item))
    .map(([item, count]) => ({ category: item, count }))
    .sort((a, b) => b.count - a.count);

  return {
    props: {
      category,
      searchTerm,
      freeOnly,
      apis: paginatedApis,
      categories: [...predefinedCategories, ...additionalCategories],
      pagination: {
        currentPage,
        totalPages,
        totalItems,
      },
    },
  };
};

