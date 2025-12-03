import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';
import prisma from '@/lib/prisma';
import { pipeline } from '@xenova/transformers';
import { Prisma } from '@prisma/client';

// Initialize Google Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Singleton for the embedding model to avoid reloading on every request
let embeddingExtractor: any = null;

async function getExtractor() {
    if (!embeddingExtractor) {
        // Use the same model as in the generation script
        embeddingExtractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    }
    return embeddingExtractor;
}

// Cosine similarity function
function cosineSimilarity(a: number[], b: number[]) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { query } = req.body;

    if (!query || typeof query !== 'string') {
        return res.status(400).json({ message: 'Query is required' });
    }

    try {
        // Step 1: Query Expansion (Google Gemini)
        const expansionPrompt = `
      You are an expert search assistant.
      User Query: "${query}"
      
      Tasks:
      1. Expand this query into 3-5 relevant English keywords or synonyms for API search.
      2. Provide a brief, friendly explanation (in English) of what kind of APIs you are looking for based on this query.
      
      Output JSON format:
      {
        "keywords": "keyword1 keyword2 keyword3",
        "reasonPrefix": "Based on your request, I found..."
      }
    `;

        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: expansionPrompt }] }],
            generationConfig: { responseMimeType: "application/json" }
        });

        const aiResponse = JSON.parse(result.response.text() || '{}');
        const expandedQuery = `${query} ${aiResponse.keywords || ''}`;
        const reasonPrefix = aiResponse.reasonPrefix || "Recommended for you:";

        console.log(`Original Query: ${query}`);
        console.log(`Expanded Query: ${expandedQuery}`);

        // Step 2: Generate Embedding for the Expanded Query (Local)
        const extractor = await getExtractor();
        const output = await extractor(expandedQuery, { pooling: 'mean', normalize: true });
        const queryEmbedding = Array.from(output.data) as number[];

        // Step 3: Vector Search (Fetch all and compute similarity)
        const allApis = await prisma.api.findMany({
            where: {
                descriptionEmbedding: { not: Prisma.DbNull },
            },
            select: {
                id: true,
                name: true,
                slug: true,
                category: true,
                tags: true,
                description: true,
                freeTier: true,
                logoUrl: true,
                provider: {
                    select: { name: true, logoUrl: true },
                },
                descriptionEmbedding: true,
            },
        });

        const scoredApis = allApis.map(api => {
            const similarity = cosineSimilarity(queryEmbedding, api.descriptionEmbedding as number[]);
            return { ...api, similarity };
        });

        // Sort by similarity and take top 3
        const topApis = scoredApis
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, 3);

        // Format response
        const results = topApis.map(api => ({
            id: api.id,
            slug: api.slug,
            name: api.name,
            category: api.category,
            tags: api.tags,
            description: api.description,
            provider: api.provider,
            logoUrl: api.logoUrl,
            freeTier: api.freeTier,
            reason: `${reasonPrefix} ${api.name} (${Math.round(api.similarity * 100)}% Match)`,
        }));

        return res.status(200).json({ results });

    } catch (error) {
        console.error('Hybrid search error:', error);
        return res.status(500).json({ message: 'Failed to process search' });
    }
}
