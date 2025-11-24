import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { slugify } from '../src/lib/slugify';

const prisma = new PrismaClient();

interface CatalogRecord {
  domain_code: string;
  category: string;
  category_slug: string;
  vendor_name: string;
  vendor_name_en: string;
  api_product: string;
  api_product_en: string;
  api_focus: string;
  api_focus_en: string;
  primary_users: string;
  primary_users_en: string;
  source_file: string;
}

async function main() {
  const catalogPath = path.join(process.cwd(), 'data/catalog/catalog-translated.json');
  
  if (!fs.existsSync(catalogPath)) {
    console.error(`Catalog file not found at ${catalogPath}`);
    process.exit(1);
  }

  const rawData = fs.readFileSync(catalogPath, 'utf-8');
  const records: CatalogRecord[] = JSON.parse(rawData);

  console.log(`Found ${records.length} records to process.`);

  let providersCount = 0;
  let apisCount = 0;

  for (const record of records) {
    const vendorName = record.vendor_name_en || record.vendor_name;
    const apiName = record.api_product_en || record.api_product;

    if (!vendorName || !apiName) {
      console.warn('Skipping record due to missing vendor or api name:', record);
      continue;
    }

    const providerSlug = slugify(vendorName);
    const apiSlug = slugify(`${vendorName}-${apiName}`); // Combine to ensure uniqueness

    // 1. Upsert Provider
    const provider = await prisma.provider.upsert({
      where: { id: `prov-${providerSlug}` }, // predictable ID for seeding
      update: {
        name: vendorName,
      },
      create: {
        id: `prov-${providerSlug}`,
        name: vendorName,
        website: `https://www.google.com/search?q=${encodeURIComponent(vendorName)}`, // Placeholder
      },
    });
    
    if (provider) providersCount++;

    // 2. Upsert API
    const description = [
      record.api_focus_en,
      record.primary_users_en ? `Target Users: ${record.primary_users_en}` : ''
    ].filter(Boolean).join('\n\n');

    await prisma.api.upsert({
      where: { slug: apiSlug },
      update: {
        name: apiName,
        providerId: provider.id,
        category: record.category,
        description: description,
        // We don't overwrite these if they exist and might have been manually updated
      },
      create: {
        slug: apiSlug,
        name: apiName,
        providerId: provider.id,
        category: record.category,
        description: description,
        docsUrl: `https://www.google.com/search?q=${encodeURIComponent(apiName + ' documentation')}`, // Placeholder
        status: 'ACTIVE',
        source: 'CRAWLED', // or MANUAL, but this is bulk import
      },
    });
    
    apisCount++;
    
    if (apisCount % 50 === 0) {
      console.log(`Processed ${apisCount} APIs...`);
    }
  }

  console.log(`Seeding completed!`);
  console.log(`Providers processed: ${providersCount}`); // Note: this is total iterations, not unique
  console.log(`APIs processed: ${apisCount}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
