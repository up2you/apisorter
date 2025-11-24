import { CrawlerEngine } from '../src/lib/crawler/crawlerEngine';
import { ContentParser } from '../src/lib/crawler/contentParser';

async function main() {
    const url = process.argv[2] || 'https://stripe.com/docs/api';
    console.log(`Crawling ${url}...`);

    const engine = new CrawlerEngine();
    const parser = new ContentParser();

    try {
        await engine.init();
        const result = await engine.crawl(url);
        await engine.close();

        if (result.error) {
            console.error('Crawling failed:', result.error);
            return;
        }

        console.log('Crawl Result Meta Images:', result.metaImages);
        console.log('Crawl Result Icons:', result.icons);

        const info = parser.parse(result);
        console.log('\nParsed Info:');
        console.log('Title:', info.title);
        console.log('Logo URL:', info.logoUrl);
        console.log('Description:', info.description?.slice(0, 100) + '...');

    } catch (error) {
        console.error('Error:', error);
        if (engine) await engine.close();
    }
}

main();
