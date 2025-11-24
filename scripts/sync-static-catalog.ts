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

async function main() {
    const catalogPath = path.join(process.cwd(), 'data/catalog/catalog-translated.json');

    if (!fs.existsSync(catalogPath)) {
        console.error(`Catalog file not found at ${catalogPath}`);
        process.exit(1);
    }

    const rawData = fs.readFileSync(catalogPath, 'utf-8');
    const records: CatalogRecord[] = JSON.parse(rawData);

    console.log(`Found ${records.length} records to process.`);

    let createdCount = 0;
    let skippedCount = 0;

    for (const [index, record] of records.entries()) {
        // Logic from catalogData.ts
        const slug = slugify(`${record.vendor_name}-${record.category_slug}-${record.domain_code ?? index}`);

        // Check if API exists
        const existingApi = await prisma.api.findUnique({
            where: { slug },
        });

        if (existingApi) {
            skippedCount++;
            continue;
        }

        // Prepare data
        const name = preferEnglish(record.vendor_name_en, record.vendor_name) ?? record.vendor_name;
        const providerName = preferEnglish(record.vendor_name_en, record.vendor_name) ?? record.vendor_name_en ?? record.vendor_name;

        if (!name || !providerName) {
            console.warn(`Skipping record index ${index} due to missing name`);
            continue;
        }

        const providerSlug = slugify(providerName);
        const providerId = `prov-${providerSlug}`;

        // Upsert Provider
        await prisma.provider.upsert({
            where: { id: providerId },
            update: {}, // Don't update if exists
            create: {
                id: providerId,
                name: providerName,
                website: `https://www.google.com/search?q=${encodeURIComponent(providerName)}`,
            },
        });

        const description = [
            preferEnglish(record.api_product_en, record.api_product),
            preferEnglish(record.api_focus_en, record.api_focus),
            preferEnglish(record.primary_users_en, record.primary_users) ? `Target Users: ${preferEnglish(record.primary_users_en, record.primary_users)}` : ''
        ].filter(Boolean).join('\n\n');

        // Create API
        await prisma.api.create({
            data: {
                slug,
                name,
                providerId,
                category: record.category,
                description: description || `${name} provides powerful ${record.category} capabilities.`,
                docsUrl: `https://www.google.com/search?q=${encodeURIComponent(name + ' API documentation')}`,
                status: 'ACTIVE',
                source: 'CRAWLED', // Marking as crawled/imported
                verified: true,
            },
        });

        createdCount++;
        if (createdCount % 50 === 0) {
            process.stdout.write('.');
        }
    }

    console.log(`\nSync completed!`);
    console.log(`Created: ${createdCount}`);
    console.log(`Skipped (already exists): ${skippedCount}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
