import { GoogleGenerativeAI } from '@google/generative-ai';
import prisma from '@/lib/prisma';

export interface ExtractedApi {
    name: string;
    description: string; // Short description
    detailedDescription: string; // Marketing copy
    features: string[];
    pricing: string; // Free, Paid, Freemium, Open Source
    socials: { twitter?: string; discord?: string; github?: string };
    url: string;
    category: string;
    confidence: number; // 0-1
}

export class AIAnalyzer {
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor(apiKey: string) {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    }

    async analyze(text: string, title?: string): Promise<ExtractedApi | null> {
        let retries = 0;
        const MAX_RETRIES = 3;

        while (retries <= MAX_RETRIES) {
            try {
                const prompt = `
                You are an expert tech curator. Analyze the following website content and extract structured data for a "Developer Tools & API Directory".
                
                Input Title: ${title || ''}
                Input Content: "${text.substring(0, 15000)}..." 

                Goal: Determine if this is a publicly available API, SDK, Library, or Developer Tool.
                
                If YES, extract the following in JSON format:
                {
                  "is_api": boolean, // true if it is a relevant developer tool/API
                  "name": string, // The clear product name
                  "description": string, // One sentence summary (max 120 chars) for cards.
                  "detailed_description": string, // 2-3 paragraphs of high-quality marketing copy explaining what it does, why it's useful, and who it is for. Use professional tone.
                  "features": string[], // List of 4-6 key features (bullet points)
                  "pricing_model": string, // "Free", "Paid", "Freemium", or "Open Source"
                  "category": string, // Best fitting category (e.g., AI, DevTools, Finance, Maps, Auth, etc.)
                  "url": string, // The main documentation or landing page URL found
                  "socials": {
                     "twitter": string | null,
                     "discord": string | null,
                     "github": string | null
                  },
                  "confidence": number // 0.0 to 1.0. High confidence means it's definitely a dev tool.
                }

                If NO (it's a blog post, tutorial, or irrelevant), return {"is_api": false}.

                Response format: JSON only.
                `;

                const result = await this.model.generateContent({
                    contents: [{ role: "user", parts: [{ text: prompt }] }],
                    generationConfig: { responseMimeType: "application/json" }
                });

                const responseText = result.response.text();
                const usage = result.response.usageMetadata;

                // Log Usage
                const tokensIn = usage?.promptTokenCount || 0;
                const tokensOut = usage?.candidatesTokenCount || 0;
                const cost = (tokensIn * 0.000000075) + (tokensOut * 0.0000003);

                try {
                    await prisma.aiUsageLog.create({
                        data: {
                            model: 'gemini-1.5-flash',
                            tokensIn,
                            tokensOut,
                            cost,
                            context: 'content-analysis-deep'
                        }
                    });
                } catch (e) { /* ignore log error */ }

                const parsed = JSON.parse(responseText);

                if (parsed.is_api && parsed.confidence > 0.7) {
                    return {
                        name: parsed.name,
                        description: parsed.description,
                        detailedDescription: parsed.detailed_description,
                        features: parsed.features || [],
                        pricing: parsed.pricing_model || 'Unknown',
                        socials: parsed.socials || {},
                        url: parsed.url || '',
                        category: parsed.category || 'Uncategorized',
                        confidence: parsed.confidence
                    };
                }

                return null;

            } catch (error: any) {
                if (error.status === 429) {
                    retries++;
                    const delay = Math.pow(2, retries) * 1000;
                    console.warn(`[AI] Rate limit hit. Retrying in ${delay / 1000}s...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                } else {
                    console.error('[AI] Analysis error:', error);
                    return null;
                }
            }
        }
        return null;
    }
}
