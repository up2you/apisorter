import { GetServerSideProps } from 'next';

export default function Robots() { }

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://apisorter.com';

    const robots = `User-agent: *
Allow: /

# Sitemap
Sitemap: ${siteUrl}/sitemap.xml
`;

    res.setHeader('Content-Type', 'text/plain');
    res.write(robots);
    res.end();

    return {
        props: {},
    };
};
