import { CrawlerEngine } from '../src/lib/crawler/crawlerEngine';
import { ContentParser } from '../src/lib/crawler/contentParser';

async function main() {
    const engine = new CrawlerEngine();
    const parser = new ContentParser();
    await engine.init();

    const targetUrl = 'https://stripe.com/docs/api';
    console.log(`Crawling ${targetUrl}...`);

    const result = await engine.crawl(targetUrl);
    const info = parser.parse(result);

    console.log('Crawler Result:');
    console.log(`- Title: ${info.title}`);
    console.log(`- Logo URL: ${info.logoUrl}`);

    await engine.close();
}

main().catch(console.error);
