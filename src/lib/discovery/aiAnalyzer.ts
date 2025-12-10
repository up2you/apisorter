import { GoogleGenerativeAI } from '@google/generative-ai';
import prisma from '@/lib/prisma';

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
        this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    }

    async analyze(text: string, title?: string): Promise<ExtractedApi | null> {
        let retries = 0;
        const MAX_RETRIES = 3;

        while (retries <= MAX_RETRIES) {
            try {
                const prompt = `
                Analyze the following website content and determine if it represents a public API, SDK, or developer tool.
                Title: ${title || ''}
                Content Fragment: "${text.substring(0, 2000)}..."

                Return a JSON object with the following fields:
                - is_api: boolean (true if it's an API/tool)
                - name: string (inferred name)
                - description: string (short description)
                - url: string (main documentation URL if found, else domain)
                - category: string (e.g. AI, Finance, Social, Utilities)
                - confidence: number (0.0 to 1.0)

                Response format: JSON only.
                `;

                const result = await this.model.generateContent({
                    contents: [{ role: "user", parts: [{ text: prompt }] }],
                    generationConfig: { responseMimeType: "application/json" }
                });

                // Extract result
                const responseText = result.response.text();
                const usage = result.response.usageMetadata;

                // Log AI Usage
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
                            context: 'content-analysis'
                        }
                    });
                } catch (logErr) {
                    // console.error('Failed to log AI usage:', logErr);
                }

                // Parse JSON
                let parsedContent: any;
                try {
                    parsedContent = JSON.parse(responseText);
                } catch (e) {
                    // Fallback regex if direct parse fails
                    const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || responseText.match(/{[\s\S]*}/);
                    if (jsonMatch && jsonMatch[1]) {
                        parsedContent = JSON.parse(jsonMatch[1]);
                    } else if (jsonMatch && jsonMatch[0]) {
                        parsedContent = JSON.parse(jsonMatch[0]);
                    } else {
                        return null;
                    }
                }

                if (parsedContent.is_api && parsedContent.confidence > 0.7) {
                    return {
                        name: parsedContent.name,
                        description: parsedContent.description,
                        url: parsedContent.url || '',
                        category: parsedContent.category,
                        confidence: parsedContent.confidence
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
        return null; // Failed after retries
    }
}
