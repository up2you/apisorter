import { NewsItem } from './newsFetcher';

export class GitHubFetcher {
    private baseUrl = 'https://api.github.com';

    async fetchTrending(daysAgo: number = 7): Promise<NewsItem[]> {
        // Calculate date for "created:>YYYY-MM-DD"
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        const dateString = date.toISOString().split('T')[0];

        // Search for relevant topics (Simplified to avoid complex API query errors)
        const query = `topic:api created:>${dateString} stars:>50`;
        const url = `${this.baseUrl}/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=10`;

        try {
            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'APISorter-Discovery-Bot'
                }
            });

            if (!response.ok) {
                console.error(`GitHub API error: ${response.statusText}`);
                return [];
            }

            const data = await response.json();

            return (data.items || []).map((repo: any) => ({
                title: repo.full_name, // e.g. "openai/openai-python"
                link: repo.html_url,
                content: repo.description ? `${repo.description} \n\nTop Language: ${repo.language}` : `No description. Language: ${repo.language}`,
                pubDate: repo.created_at,
                source: 'GitHub Trending'
            }));

        } catch (error) {
            console.error('Error fetching from GitHub:', error);
            return [];
        }
    }
}
