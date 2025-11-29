import 'dotenv/config';
import { CrawlerEngine } from '@/lib/crawler/crawlerEngine';
import { ContentParser } from '@/lib/crawler/contentParser';
import { Scheduler } from '@/lib/crawler/scheduler';
import prisma from '@/lib/prisma';

async function main() {
  console.log('Starting crawler...');

  const engine = new CrawlerEngine();
  const parser = new ContentParser();
  const scheduler = new Scheduler();

  try {
    await engine.init();

    const apis = await scheduler.getApisToCrawl(5); // Crawl 5 at a time
    console.log(`Found ${apis.length} APIs to crawl.`);

    for (const api of apis) {
      console.log(`Crawling ${api.name} (${api.docsUrl})...`);
      const start = Date.now();

      const result = await engine.crawl(api.docsUrl);
      const duration = Date.now() - start;

      if (result.error) {
        console.error(`Error crawling ${api.name}: ${result.error}`);
        // Mark as potentially broken if error persists? For now just update lastChecked
        await scheduler.updateApiStatus(api.id, api.status, duration);
        continue;
      }

      const info = parser.parse(result);
      console.log(`Parsed info for ${api.name}:`, info);

      // Update API with new info
      await scheduler.updateApiInfo(api.id, info);
      console.log(`Updated database for ${api.name}`);
    }

  } catch (error) {
    console.error('Crawler failed:', error);
    process.exit(1);
  } finally {
    await engine.close();
    await prisma.$disconnect();
  }
}

main();
