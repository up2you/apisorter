import { CrawlResult } from './crawlerEngine';
import { AIAnalyzer } from '../discovery/aiAnalyzer';

export interface ParsedApiInfo {
    title?: string;
    description?: string;
    keywords?: string[];
    pricingUrl?: string;
    docsUrl?: string;
    registrationUrl?: string;
    changelogUrl?: string;
    supportChannels?: string;
    pricingModel?: string;
    logoUrl?: string;
    hasPricing: boolean;
    hasDocs: boolean;
    version?: string;
    category?: string;
    confidence?: number;
}

export class ContentParser {
    async parse(result: CrawlResult, apiKey?: string): Promise<ParsedApiInfo> {
        const content = result.content.toLowerCase();
        const title = result.title;

        // Basic description extraction (first paragraph or meta description if available in content)
        // Since we only have text content, we'll take the first non-empty line after title
        const lines = result.content.split('\n').map(l => l.trim()).filter(l => l.length > 20);
        let description = lines.find(l => !l.includes(title) && l.length > 50)?.slice(0, 200);

        // AI Enrichment
        let aiCategory: string | undefined;
        let aiConfidence: number | undefined;

        if (apiKey) {
            try {
                const analyzer = new AIAnalyzer(apiKey);
                // Use the first 2000 chars of content to avoid token limits and speed up processing
                const analysisText = result.content.slice(0, 2000);
                const aiResult = await analyzer.analyze(analysisText, title);

                if (aiResult) {
                    console.log(`AI Analysis successful for ${title}`);
                    if (aiResult.description) description = aiResult.description;
                    if (aiResult.category) aiCategory = aiResult.category;
                    if (aiResult.confidence) aiConfidence = aiResult.confidence;
                }
            } catch (error) {
                console.error('AI Enrichment failed:', error);
            }
        }

        const links = result.links;

        const pricingUrl = links.find(l => l.includes('pricing') || l.includes('plans'));
        const docsUrl = links.find(l => l.includes('docs') || l.includes('documentation') || l.includes('developer') || l.includes('api-reference'));
        const registrationUrl = links.find(l => l.includes('signup') || l.includes('register') || l.includes('login') || l.includes('start'));
        const changelogUrl = links.find(l => l.includes('changelog') || l.includes('release-notes') || l.includes('updates'));

        const hasPricing = !!pricingUrl || content.includes('pricing');
        const hasDocs = !!docsUrl || content.includes('documentation');

        // Simple heuristic for version detection
        const versionMatch = content.match(/v(\d+(\.\d+)?)/);
        const version = versionMatch ? versionMatch[0] : undefined;

        // Keywords/Tags extraction (simple frequency or presence)
        const keywords: string[] = [];
        if (content.includes('rest')) keywords.push('REST');
        if (content.includes('graphql')) keywords.push('GraphQL');
        if (content.includes('payment')) keywords.push('Payments');
        if (content.includes('crypto')) keywords.push('Crypto');
        if (content.includes('ai') || content.includes('machine learning')) keywords.push('AI');
        if (content.includes('map') || content.includes('geo')) keywords.push('Maps');

        // Support channels
        const supportChannels = [];
        if (content.includes('discord')) supportChannels.push('Discord');
        if (content.includes('slack')) supportChannels.push('Slack');
        if (content.includes('email') || content.includes('contact')) supportChannels.push('Email');

        // Pricing model
        let pricingModel = 'Unknown';
        if (content.includes('free tier') || content.includes('freemium')) pricingModel = 'Freemium';
        else if (content.includes('subscription') || content.includes('monthly')) pricingModel = 'Subscription';
        else if (content.includes('pay as you go') || content.includes('usage based')) pricingModel = 'Pay-as-you-go';

        // Logo extraction strategy:
        // 1. Meta images (og:image, twitter:image) - usually high quality
        // 2. Favicons/Icons - usually smaller but reliable
        // 3. First image in content (not available in current simplified crawler)
        let logoUrl = undefined;
        if (result.metaImages && result.metaImages.length > 0) {
            logoUrl = result.metaImages[0];
        } else if (result.icons && result.icons.length > 0) {
            // Prefer larger icons if possible, but we just take the first one for now
            // Resolve relative URLs if needed
            const icon = result.icons[0];
            if (icon.startsWith('http')) {
                logoUrl = icon;
            } else {
                try {
                    logoUrl = new URL(icon, result.url).toString();
                } catch (e) {
                    // Invalid URL
                }
            }
        }

        return {
            title,
            description,
            keywords,
            pricingUrl,
            docsUrl: docsUrl || result.url, // Fallback to crawled URL if no docs link found
            registrationUrl,
            changelogUrl,
            supportChannels: supportChannels.join(', '),
            pricingModel,
            logoUrl,
            hasPricing,
            hasDocs,
            version,
            category: aiCategory,
            confidence: aiConfidence,
        };
    }
}
