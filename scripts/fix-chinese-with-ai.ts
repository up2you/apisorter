
import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
// Ensure API key is present
if (!process.env.GOOGLE_API_KEY) {
    console.error("Missing GOOGLE_API_KEY in environment variables.");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const CHINESE_REGEX = /[\u4e00-\u9fa5]/;

async function translateBatch(items: { id: string, name: string, description: string }[]) {
    if (items.length === 0) return [];

    const prompt = `
You are a helpful assistant that translates API descriptions from Chinese to English.
The input is a JSON array of objects with "id", "name", and "description".
For each item, if the "description" contains Chinese, translate it to professional English suitable for a developer catalog.
If the "description" is already in English, keep it as is.
Keep the "Target Users" section if present, translating it as well.
Return a JSON object where keys are the "id" and values are the new "description".
Do not change the "name".

Input:
${JSON.stringify(items.map(i => ({ id: i.id, name: i.name, description: i.description })), null, 2)}
`;

    try {
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
        });

        const content = result.response.text();
        if (!content) return {};
        return JSON.parse(content);
    } catch (error) {
        console.error("Translation failed for batch:", error);
        return {};
    }
}

async function main() {
    console.log("Finding APIs with Chinese descriptions...");

    // Fetch all APIs first, then filter in memory to be safe with regex across different DBs if needed, 
    // though Prisma supports contains. But regex query is database specific.
    // Let's fetch all and filter in JS for simplicity and reliability.
    const allApis = await prisma.api.findMany({
        select: { id: true, name: true, description: true }
    });

    const chineseApis = allApis.filter(api => api.description && CHINESE_REGEX.test(api.description));

    console.log(`Found ${chineseApis.length} APIs with Chinese descriptions.`);

    const BATCH_SIZE = 20;
    for (let i = 0; i < chineseApis.length; i += BATCH_SIZE) {
        const batch = chineseApis.slice(i, i + BATCH_SIZE);
        console.log(`Processing batch ${i / BATCH_SIZE + 1} (${batch.length} items)...`);

        const translations = await translateBatch(batch as any);

        for (const item of batch) {
            if (translations[item.id]) {
                const newDesc = translations[item.id];
                if (newDesc !== item.description) {
                    await prisma.api.update({
                        where: { id: item.id },
                        data: { description: newDesc }
                    });
                    console.log(`Updated ${item.name}`);
                }
            }
        }
    }

    console.log("Done!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
