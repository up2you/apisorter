import Parser from 'rss-parser';

export interface NewsItem {
    title: string;
    link: string;
    content: string;
    pubDate: string;
    source: string;
}

export class NewsFetcher {
    private parser: Parser;

    constructor() {
        this.parser = new Parser();
    }

    async fetchFeed(url: string, sourceName: string): Promise<NewsItem[]> {
        try {
            const feed = await this.parser.parseURL(url);
            return feed.items.map(item => ({
                title: item.title || '',
                link: item.link || '',
                content: item.contentSnippet || item.content || '',
                pubDate: item.pubDate || new Date().toISOString(),
                source: sourceName,
            }));
        } catch (error) {
            console.error(`Error fetching feed ${url}:`, error);
            return [];
        }
    }
}
