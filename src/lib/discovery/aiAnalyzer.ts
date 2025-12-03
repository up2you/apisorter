import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ExtractedApi {
    name: string;
    description: string;
    url: string;
    category: string;
    confidence: number; // 0-1
}

export class AIAnalyzer {
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor(apiKey: string) {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
    }

    async analyze(text: string, title: string): Promise<ExtractedApi | null> {
        const prompt = `
    Analyze the following news article title and content to determine if it introduces or discusses a new API service or developer tool that provides an API.
    
    Title: ${title}
    Content: ${text}
    
    If it IS about a new API/Developer Tool, extract the following in JSON format:
    {
      "is_api": true,
      "name": "Name of the API/Tool",
      "description": "Brief description of what it does (max 200 chars)",
      "url": "URL of the API documentation or main site (if mentioned, otherwise null)",
      "category": "Best fitting category (e.g., AI, DevTools, Finance, Social, etc.)",
      "confidence": 0.9 (how sure are you this is an API product?)
    }
    
    If it is NOT about a new API/Tool, return:
    {
      "is_api": false
    }
    
    Return ONLY the JSON.
    `;

        try {
            const result = await this.model.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: { responseMimeType: "application/json" }
            });

            const content = result.response.text();
            if (!content) return null;

            const parsed = JSON.parse(content);

            if (parsed.is_api && parsed.confidence > 0.7) {
                return {
                    name: parsed.name,
                    description: parsed.description,
                    url: parsed.url || '',
                    category: parsed.category,
                    confidence: parsed.confidence
                };
            }

            return null;

        } catch (error) {
            console.error("AI Analysis failed:", error);
            return null;
        }
    }
}
