import 'dotenv/config';
import { CrawlerEngine } from '@/lib/crawler/crawlerEngine';
import { ContentParser } from '@/lib/crawler/contentParser';
import { Scheduler } from '@/lib/crawler/scheduler';
import prisma from '@/lib/prisma';
import { sendCrawlerReport, CrawlerStats } from '@/lib/notifications/adminAlerts';
import pLimit from 'p-limit';

async function main() {
  console.log('Starting crawler with enhanced parallelism...');

  const engine = new CrawlerEngine();
  const parser = new ContentParser();
  const scheduler = new Scheduler();

  // Stats tracking
  const stats: CrawlerStats = {
    total: 0,
    success: 0,
    failed: 0,
    durationMs: 0,
    errors: []
  };

  const startTime = Date.now();

  try {
    await engine.init();

    // Limit concurrency to 2 to avoid resource exhaustion or rate limits
    const limit = pLimit(2);

    // Increase batch size since we are processing in parallel
    const apis = await scheduler.getApisToCrawl(15);
    console.log(`Found ${apis.length} APIs to crawl.`);
    stats.total = apis.length;

    const crawlPromises = apis.map(api => limit(async () => {
      console.log(`[Start] Crawling ${api.name} (${api.docsUrl})...`);
      const apiStart = Date.now();

      try {
        const result = await engine.crawl(api.docsUrl);
        const duration = Date.now() - apiStart;

        if (result.error) {
          throw new Error(result.error);
        }

        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        const info = await parser.parse(result, apiKey);

        await scheduler.updateApiInfo(api.id, info);
        console.log(`[Success] Updated ${api.name} (${duration}ms)`);
        stats.success++;

      } catch (error: any) {
        console.error(`[Error] Failed ${api.name}:`, error.message);

        // Log error to stats
        stats.failed++;
        stats.errors.push({
          name: api.name,
          url: api.docsUrl,
          error: error.message || 'Unknown error'
        });

        // Update DB status
        await scheduler.updateApiStatus(api.id, 'BROKEN', Date.now() - apiStart);
      }
    }));

    await Promise.all(crawlPromises);

  } catch (error) {
    console.error('Fatal crawler error:', error);
  } finally {
    stats.durationMs = Date.now() - startTime;
    console.log('\n--- Final Stats ---');
    console.log(`Total: ${stats.total}, Success: ${stats.success}, Failed: ${stats.failed}`);
    console.log(`Duration: ${(stats.durationMs / 1000).toFixed(2)}s`);

    await engine.close();
    await prisma.$disconnect();

    // Send Admin Report
    if (stats.total > 0) {
      console.log('Sending admin report...');
      await sendCrawlerReport(stats);
    }
  }
}

main();
