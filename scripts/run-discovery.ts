import 'dotenv/config';
import prisma from '../src/lib/prisma';
import { NewsFetcher, NewsItem } from '../src/lib/discovery/newsFetcher';
import { GitHubFetcher } from '../src/lib/discovery/githubFetcher';
import { AIAnalyzer } from '../src/lib/discovery/aiAnalyzer';
import { CrawlerEngine } from '../src/lib/crawler/crawlerEngine';

async function main() {
    console.log('Starting AI Discovery Engine (Deep Enrichment Mode)...');

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
        throw new Error('GOOGLE_GENERATIVE_AI_API_KEY not found.');
    }

    const newsFetcher = new NewsFetcher();
    const githubFetcher = new GitHubFetcher();
    const analyzer = new AIAnalyzer(apiKey);
    const crawler = new CrawlerEngine();

    // Initialize Crawler (Headless Browser)
    await crawler.init();

    try {
        // 1. Fetch Candidates from RSS
        const sources = await prisma.discoverySource.findMany({ where: { enabled: true } });
        let candidates: { link: string; title: string; sourceId: string }[] = [];

        console.log(`📡 Polling ${sources.length} RSS feeds...`);
        for (const source of sources) {
            const items = await newsFetcher.fetchFeed(source.url, source.name);
            candidates.push(...items.map((i: NewsItem) => ({ link: i.link, title: i.title, sourceId: source.id })));
        }

        // 2. Fetch Candidates from GitHub
        console.log(`🐙 Polling GitHub Trending...`);
        const githubItems = await githubFetcher.fetchTrending(7);
        // We'll use a placeholder Source ID for GitHub, or create one if missing
        let githubSource = await prisma.discoverySource.findUnique({ where: { url: 'https://github.com/trending' } });
        if (!githubSource) {
            githubSource = await prisma.discoverySource.create({
                data: { name: 'GitHub Trending', url: 'https://github.com/trending', type: 'HTML' }
            });
        }
        candidates.push(...githubItems.map((i: NewsItem) => ({ link: i.link, title: i.title, sourceId: githubSource!.id })));

        // Deduplicate candidates based on URL (and sourceId)
        const uniqueCandidates = new Map();
        candidates.forEach(c => {
            const key = `${c.sourceId}-${c.link}`;
            if (!uniqueCandidates.has(key)) {
                uniqueCandidates.set(key, c);
            }
        });
        candidates = Array.from(uniqueCandidates.values());

        console.log(`🔍 Total Candidates: ${candidates.length}`);

        // 3. Process Candidates
        for (const candidate of candidates) {
            // Deduplication Check
            const existingLog = await prisma.discoveryLog.findUnique({
                where: { sourceId_url: { sourceId: candidate.sourceId, url: candidate.link } }
            });
            if (existingLog) continue;

            console.log(`\n----------------------------------------------------------------`);
            console.log(`Processing: ${candidate.title}`);
            console.log(`LINK: ${candidate.link}`);

            // A. Deep Crawl (Visit the site to get real content)
            console.log(`🕷️ Deep Crawling homepage...`);
            const crawlResult = await crawler.crawl(candidate.link);

            if (crawlResult.error || !crawlResult.content) {
                console.log(`❌ Crawl Failed: ${crawlResult.error}`);
                await logDiscovery(candidate, 'ERROR', `Crawl failed: ${crawlResult.error}`);
                continue;
            }

            // B. AI Analysis
            console.log(`🧠 Analyzing content with Gemini...`);
            // We pass the CRAWLED content, not the RSS snippet
            const analysis = await analyzer.analyze(crawlResult.content, candidate.title);

            if (analysis) {
                console.log(`✅ FOUND API: ${analysis.name} (${(analysis.confidence * 100).toFixed(0)}%)`);
                console.log(`   Category: ${analysis.category}`);
                console.log(`   Pricing: ${analysis.pricing}`);

                // C. Save to Database
                // 1. Create Provider
                const provider = await prisma.provider.create({
                    data: {
                        name: analysis.name,
                        website: analysis.url || candidate.link,
                    }
                });

                // 2. Create API
                const slug = analysis.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-4);

                const newApi = await prisma.api.create({
                    data: {
                        name: analysis.name,
                        slug: slug,
                        description: analysis.description, // Short description
                        category: analysis.category,
                        docsUrl: analysis.url || candidate.link,
                        providerId: provider.id,
                        status: 'PENDING', // Require human review or auto-approve if high confidence? Let's stick to PENDING.
                        source: 'CRAWLED',
                        sourceUrl: candidate.link,
                        freeTier: analysis.pricing.toLowerCase().includes('free') ? 'Available' : null,
                        pricingUrl: null,
                        metadata: {
                            detailedDescription: analysis.detailedDescription,
                            features: analysis.features || [],
                            pricingModel: analysis.pricing,
                            socials: analysis.socials,
                            aiConfidence: analysis.confidence
                        }
                    }
                });

                console.log(`💾 Saved API: ${newApi.name} (ID: ${newApi.id})`);
                await logDiscovery(candidate, 'PROCESSED', undefined, newApi.id);

            } else {
                console.log(`⚪ Irrelevant content (Not an API/Tool).`);
                await logDiscovery(candidate, 'IGNORED');
            }
        }

    } catch (error) {
        console.error('Critical Error:', error);
    } finally {
        await crawler.close();
        await prisma.$disconnect();
    }
}

async function logDiscovery(candidate: any, status: 'PROCESSED' | 'IGNORED' | 'ERROR', errorMsg?: string, apiId?: string) {
    await prisma.discoveryLog.create({
        data: {
            sourceId: candidate.sourceId,
            url: candidate.link,
            title: candidate.title,
            status: status,
            errorMessage: errorMsg,
            foundApiId: apiId
        }
    });
}

main();
