import rawCatalog from '../../data/catalog/catalog-translated.json';

import { slugify } from '@/lib/slugify';
import type { CatalogApi, CatalogSummaryCounts, DatasetCatalogRecord } from '@/types/catalog';

type DatasetDetail = CatalogApi & {
  description: string | null;
  pricingUrl: string | null;
  changelogUrl: string | null;
  metadata: Record<string, unknown> | null;
  provider: {
    name: string | null;
    logoUrl: string | null;
    website: string | null;
  } | null;
  metrics: CatalogApi['metrics'] & { followerCount: number };
  summary: {
    domainCode: string | null;
    apiProduct: string | null;
    apiFocus: string | null;
    primaryUsers: string | null;
  };
};

type DatasetFilterOptions = {
  category?: string;
  searchTerm?: string;
  freeOnly?: boolean;
};

const RAW_DATA = rawCatalog as DatasetCatalogRecord[];

function buildGoogleSearchUrl(vendorName: string) {
  const query = encodeURIComponent(`${vendorName} API docs`);
  return `https://www.google.com/search?q=${query}`;
}

function titleCase(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

const HAS_CJK = /[\u3400-\u9FFF]/;

function preferEnglish(...candidates: Array<string | undefined | null>) {
  for (const candidate of candidates) {
    const trimmed = candidate?.trim();
    if (trimmed && !HAS_CJK.test(trimmed)) {
      return trimmed;
    }
  }
  return candidates.find((c) => c?.trim())?.trim() ?? null;
}

function buildEnglishTags(record: DatasetCatalogRecord) {
  const candidates = [
    record.vendor_name_en,
    record.api_product_en,
    record.api_focus_en,
    record.primary_users_en,
    record.category,
    record.category_slug?.replace(/-/g, ' '),
  ];

  const unique = new Set<string>();

  for (const candidate of candidates) {
    if (!candidate) continue;
    const pieces = candidate.split(/[,、;\/\n\|]+/).flatMap((piece) => piece.split(/\s{2,}/));
    for (const piece of pieces) {
      const cleaned = piece.replace(/[^a-z0-9\s]/gi, ' ').trim();
      if (!cleaned || !/[a-zA-Z]/.test(cleaned)) continue;
      const formatted = titleCase(cleaned).substring(0, 40).trim();
      if (!formatted) continue;
      unique.add(formatted);
      if (unique.size >= 6) break;
    }
    if (unique.size >= 6) break;
  }

  if (unique.size === 0 && record.vendor_name_en) {
    const fallbacks = record.vendor_name_en.split(/\s+/).filter((word) => /^[a-z0-9]+$/i.test(word));
    for (const word of fallbacks) {
      unique.add(titleCase(word));
      if (unique.size >= 6) break;
    }
  }

  if (unique.size === 0 && record.category) {
    unique.add(titleCase(record.category));
  }

  return Array.from(unique);
}

import { getGenericLogo } from './categoryIcons';

const TAG_MAPPINGS = [
  {
    tags: ['Finance', 'Trading', 'Market Data'],
    keywords: ['Trading', 'Stock', 'Crypto', 'Finance', 'Market', 'Exchange', 'Broker', 'Alpaca', 'Polygon', 'FMP', 'Quandl', 'Interactive Brokers', 'EOD', 'Financial', 'Alpha Vantage']
  },
  {
    tags: ['Payments', 'Billing', 'Fintech'],
    keywords: ['Payment', 'Bank', 'Accounting', 'Invoice', 'Tax', 'VAT', 'Billing', 'Ledger', 'Payroll', 'Expense', 'Revenue', 'Stripe', 'PayPal', 'Square']
  },
  {
    tags: ['AI', 'Machine Learning', 'NLP'],
    keywords: ['AI', 'Machine Learning', 'ML', 'NLP', 'LLM', 'Generative', 'Vision', 'Speech', 'Translation', 'Chatbot', 'OpenAI', 'Anthropic', 'Cohere', 'Hugging Face']
  },
  {
    tags: ['Maps', 'Location', 'Geocoding'],
    keywords: ['Map', 'Location', 'Geocoding', 'Routing', 'Place', 'GIS', 'Address', 'Navigation', 'Google Maps', 'Mapbox', 'TomTom', 'HERE']
  },
  {
    tags: ['Communication', 'Messaging', 'Notification'],
    keywords: ['Email', 'Mail', 'Messaging', 'SMS', 'Chat', 'Communication', 'Notification', 'Push', 'Twilio', 'Sendgrid', 'Mailgun', 'Vonage']
  },
  {
    tags: ['CRM', 'Sales', 'Customer Support'],
    keywords: ['CRM', 'ERP', 'Customer', 'Sales', 'Marketing', 'Support', 'Ticket', 'Contact', 'Lead', 'HubSpot', 'Salesforce', 'Zendesk', 'Freshdesk', 'Intercom']
  },
  {
    tags: ['Storage', 'Cloud', 'File Management'],
    keywords: ['Storage', 'File', 'Upload', 'CDN', 'Cloud', 'Object', 'Hosting', 'S3', 'Dropbox', 'Box', 'Google Drive']
  },
  {
    tags: ['E-commerce', 'Retail', 'Inventory'],
    keywords: ['E-commerce', 'Shop', 'Product', 'Order', 'Cart', 'Checkout', 'Inventory', 'Shopify', 'WooCommerce', 'Magento', 'BigCommerce']
  },
  {
    tags: ['Data', 'Analytics', 'Observability'],
    keywords: ['Data', 'Analytics', 'Metrics', 'Reporting', 'Scraping', 'Extraction', 'Monitoring', 'Log', 'Trace', 'Datadog', 'New Relic']
  },
  {
    tags: ['Security', 'Identity', 'Compliance'],
    keywords: ['Security', 'Auth', 'Identity', 'Verification', 'KYC', 'Compliance', 'Auth0', 'Okta', 'Onfido']
  },
  {
    tags: ['Productivity', 'Scheduling', 'Calendar'],
    keywords: ['Calendar', 'Schedule', 'Booking', 'Appointment', 'Task', 'Project', 'Calendly', 'Notion', 'Monday', 'Asana']
  },
  {
    tags: ['DevTools', 'Infrastructure'],
    keywords: ['DevTools', 'Infrastructure', 'Deployment', 'Serverless', 'Container', 'Docker', 'Kubernetes', 'Vercel', 'Netlify']
  }
];

function getEnrichedTags(name: string, category: string, existingTags: string[]) {
  const newTags = new Set(existingTags);
  const textToSearch = (name + ' ' + category).toLowerCase();

  if (category) newTags.add(category);

  for (const mapping of TAG_MAPPINGS) {
    if (mapping.keywords.some(k => textToSearch.includes(k.toLowerCase()))) {
      mapping.tags.forEach(t => newTags.add(t));
    }
  }

  if (newTags.size === 0) {
    newTags.add('API');
  }

  return Array.from(newTags);
}

const DATASET_DETAILS: DatasetDetail[] = RAW_DATA.map((record, index) => {
  const slug = slugify(`${record.vendor_name}-${record.category_slug}-${record.domain_code ?? index}`);

  const name = preferEnglish(record.vendor_name_en, record.vendor_name) ?? record.vendor_name;
  const category = record.category;

  const initialTags = buildEnglishTags(record);
  const tags = getEnrichedTags(name, category, initialTags);

  const description =
    preferEnglish(record.api_product_en, record.api_focus_en) ||
    `${name} provides powerful ${category || 'software'} capabilities for developers.`;

  const logoUrl = getGenericLogo(name, category) as string;

  return {
    id: `dataset-${index}`,
    slug,
    name,
    category,
    tags,
    docsUrl: buildGoogleSearchUrl(name),
    freeTier: null,
    provider: {
      name: preferEnglish(record.vendor_name_en, record.vendor_name) ?? record.vendor_name_en ?? record.vendor_name,
      logoUrl: logoUrl,
      website: null,
    },
    metrics: {
      averageRating: 0,
      reviewCount: 0,
      followerCount: 0,
    },
    source: 'dataset',
    description,
    pricingUrl: null,
    changelogUrl: null,
    metadata: {
      ...(record.domain_code ? { domainCode: record.domain_code } : {}),
      ...(preferEnglish(record.api_focus_en, record.api_focus)
        ? { apiFocus: preferEnglish(record.api_focus_en, record.api_focus) }
        : {}),
      ...(preferEnglish(record.primary_users_en, record.primary_users)
        ? { primaryUsers: preferEnglish(record.primary_users_en, record.primary_users) }
        : {}),
      ...(record.source_file ? { sourceFile: record.source_file } : {}),
    },
    summary: {
      domainCode: record.domain_code ?? null,
      apiProduct: preferEnglish(record.api_product_en, record.api_product),
      apiFocus: preferEnglish(record.api_focus_en, record.api_focus),
      primaryUsers: preferEnglish(record.primary_users_en, record.primary_users),
    },
  };
});

const DATASET_CATALOG: CatalogApi[] = DATASET_DETAILS.map((detail) => ({
  id: detail.id,
  slug: detail.slug,
  name: detail.name,
  category: detail.category,
  tags: detail.tags,
  docsUrl: detail.docsUrl,
  freeTier: detail.freeTier,
  provider: detail.provider,
  metrics: {
    averageRating: detail.metrics.averageRating,
    reviewCount: detail.metrics.reviewCount,
  },
  source: detail.source,
}));

const DATASET_MAP = new Map<string, DatasetDetail>(DATASET_DETAILS.map((detail) => [detail.slug, detail]));

export function getDatasetCatalog() {
  return DATASET_CATALOG;
}

export function getDatasetDetail(slug: string) {
  return DATASET_MAP.get(slug);
}

export function getDatasetCategoriesCounts() {
  return DATASET_CATALOG.reduce<CatalogSummaryCounts>((acc, entry) => {
    acc[entry.category] = (acc[entry.category] ?? 0) + 1;
    return acc;
  }, {});
}

export function filterDatasetCatalog(options: DatasetFilterOptions = {}) {
  const { category, searchTerm, freeOnly } = options;
  if (freeOnly) {
    // Currently no free tier information in data source
    return [];
  }

  return DATASET_CATALOG.filter((entry) => {
    if (category && category !== 'all' && entry.category !== category) {
      return false;
    }
    if (!searchTerm) {
      return true;
    }
    const needle = searchTerm.toLowerCase();
    return (
      entry.name.toLowerCase().includes(needle) ||
      entry.tags.some((tag) => tag.toLowerCase().includes(needle))
    );
  });
}

export function getDatasetRelated(category: string, excludeSlug: string, limit = 6) {
  return DATASET_CATALOG.filter((entry) => entry.category === category && entry.slug !== excludeSlug).slice(
    0,
    limit,
  );
}


