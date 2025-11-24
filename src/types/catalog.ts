export type CatalogApi = {
  id: string;
  slug: string;
  name: string;
  category: string;
  tags: string[];
  docsUrl: string;
  freeTier: string | null;
  logoUrl?: string | null;
  provider: {
    name: string | null;
    logoUrl: string | null;
    website?: string | null;
  } | null;
  metrics: {
    averageRating: number;
    reviewCount: number;
  };
  source: 'database' | 'dataset';
};

export type CatalogSummaryCounts = Record<string, number>;

export type DatasetCatalogRecord = {
  domain_code?: string;
  category: string;
  category_slug: string;
  vendor_name: string;
  vendor_name_en?: string;
  api_product?: string;
  api_product_en?: string;
  api_focus?: string;
  api_focus_en?: string;
  primary_users?: string;
  primary_users_en?: string;
  source_file: string;
};



