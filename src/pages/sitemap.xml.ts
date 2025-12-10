import { GetServerSideProps } from 'next';
import prisma from '@/lib/prisma';

const EXTERNAL_DATA_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://apisorter.com';

function generateSiteMap(apis: { slug: string }[], categories: { category: string }[]) {
    return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <!--Static Pages-->
     <url>
       <loc>${EXTERNAL_DATA_URL}</loc>
       <changefreq>daily</changefreq>
       <priority>1.0</priority>
     </url>
     <url>
       <loc>${EXTERNAL_DATA_URL}/pricing</loc>
       <changefreq>weekly</changefreq>
       <priority>0.8</priority>
     </url>
     <url>
       <loc>${EXTERNAL_DATA_URL}/submit</loc>
       <changefreq>monthly</changefreq>
       <priority>0.5</priority>
     </url>
      <url>
       <loc>${EXTERNAL_DATA_URL}/login</loc>
       <changefreq>monthly</changefreq>
       <priority>0.5</priority>
     </url>

     <!--Dynamic Categories-->
     ${categories
            .map(({ category }) => {
                return `
       <url>
           <loc>${EXTERNAL_DATA_URL}/category/${encodeURIComponent(category)}</loc>
           <changefreq>daily</changefreq>
           <priority>0.9</priority>
       </url>
     `;
            })
            .join('')}

     <!--Dynamic APIs-->
     ${apis
            .map(({ slug }) => {
                return `
       <url>
           <loc>${EXTERNAL_DATA_URL}/api/${slug}</loc>
           <changefreq>weekly</changefreq>
           <priority>0.7</priority>
       </url>
     `;
            })
            .join('')}
   </urlset>
 `;
}

export default function SiteMap() {
    // getServerSideProps will do the heavy lifting
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
    // We make an API call to gather the URLs for our site

    // 1. Get all APIs
    const apis = await prisma.api.findMany({
        select: {
            slug: true,
        },
        where: {
            status: 'ACTIVE'
        },
        take: 5000 // Limit to avoid massive pages, or implement paging for multiple sitemaps if needed. 5000 is safe for now.
    });

    // 2. Get all distinct Categories
    const categoriesRaw = await prisma.api.findMany({
        select: { category: true },
        distinct: ['category'],
        where: { status: 'ACTIVE' }
    });

    // Generate the XML sitemap with the posts data
    const sitemap = generateSiteMap(apis, categoriesRaw);

    // Set Cache Control to avoid database hit on every crawler request
    // Cache for 1 hour (3600 seconds)
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=59');
    res.setHeader('Content-Type', 'text/xml');

    // Send the XML to the browser
    res.write(sitemap);
    res.end();

    return {
        props: {},
    };
};
