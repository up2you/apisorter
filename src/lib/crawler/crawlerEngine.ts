import { chromium, Browser, Page } from 'playwright';

export interface CrawlResult {
    url: string;
    title: string;
    content: string;
    links: string[];
    metaImages: string[];
    icons: string[];
    contactLinks?: string[];
    screenshot?: Buffer;
    error?: string;
}

export class CrawlerEngine {
    private browser: Browser | null = null;

    async init() {
        if (!this.browser) {
            this.browser = await chromium.launch({
                headless: true,
            });
        }
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }

    async crawl(url: string): Promise<CrawlResult> {
        if (!this.browser) await this.init();

        const page = await this.browser!.newPage();
        try {
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

            const title = await page.title();
            // Get main content text (simplified)
            const content = await page.evaluate(() => document.body.innerText);

            // Get all links
            const links = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('a'))
                    .map(a => a.href)
                    .filter(href => href.startsWith('http'));
            });

            // Extract meta images (og:image, twitter:image)
            const metaImages = await page.evaluate(() => {
                const images: string[] = [];
                const ogImage = document.querySelector('meta[property="og:image"]');
                if (ogImage) images.push(ogImage.getAttribute('content') || '');

                const twitterImage = document.querySelector('meta[name="twitter:image"]');
                if (twitterImage) images.push(twitterImage.getAttribute('content') || '');

                return images.filter(src => src && src.startsWith('http'));
            });

            // Extract icons
            const icons = await page.evaluate(() => {
                const icons: string[] = [];
                const linkIcons = document.querySelectorAll('link[rel*="icon"]');
                linkIcons.forEach(link => {
                    const href = link.getAttribute('href');
                    if (href) icons.push(href);
                });
                return icons;
            });

            // Extract contact info (mailto links)
            const contactLinks = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('a[href^="mailto:"]'))
                    .map(a => a.getAttribute('href')?.replace('mailto:', '').trim())
                    .filter(email => email && email.includes('@'));
            });

            return {
                url,
                title,
                content,
                links,
                metaImages,
                icons,
                contactLinks: Array.from(new Set(contactLinks)) as string[],
            };
        } catch (error: any) {
            return {
                url,
                title: '',
                content: '',
                links: [],
                metaImages: [],
                icons: [],
                error: error.message,
            };
        } finally {
            await page.close();
        }
    }
}
