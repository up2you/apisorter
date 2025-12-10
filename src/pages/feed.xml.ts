import { GetServerSideProps } from 'next';
import prisma from '@/lib/prisma';
import { format } from 'date-fns';

const EXTERNAL_DATA_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://apisorter.com';

function generateRssFeed(apis: any[]) {
    return `<?xml version="1.0" ?>
  <rss version="2.0">
    <channel>
        <title>API Sorter - Newest APIs</title>
        <link>${EXTERNAL_DATA_URL}</link>
        <description>Discover the latest APIs added to API Sorter.</description>
        <language>en</language>
        <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
        ${apis.map(api => `
          <item>
            <title><![CDATA[${api.name}]]></title>
            <link>${EXTERNAL_DATA_URL}/api/${api.slug}</link>
            <guid>${EXTERNAL_DATA_URL}/api/${api.slug}</guid>
            <pubDate>${new Date(api.createdAt).toUTCString()}</pubDate>
            <description><![CDATA[${api.description || 'No description available.'}]]></description>
            <category>${api.category}</category>
          </item>
        `).join('')}
    </channel>
  </rss>`;
}

export default function Rss() { }

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
    const apis = await prisma.api.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
        where: { status: 'ACTIVE' },
        select: {
            name: true,
            slug: true,
            description: true,
            category: true,
            createdAt: true
        }
    });

    const rss = generateRssFeed(apis);

    res.setHeader('Content-Type', 'text/xml');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=59');
    res.write(rss);
    res.end();

    return {
        props: {},
    };
};
