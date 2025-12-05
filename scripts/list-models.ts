import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
        console.error('No API Key found!');
        return;
    }

    console.log('Using API Key:', apiKey.substring(0, 10) + '...');

    try {
        // We can't list models directly with the SDK easily in a simple way without a model instance sometimes,
        // but actually the SDK *does* have a model listing method on the client?
        // Wait, the error message suggested "Call ListModels".
        // Let's try to fetch it via REST if the SDK doesn't expose it easily, or check SDK docs.
        // Actually, checking SDK source/docs, usually it's not a top-level method on GoogleGenerativeAI class in older versions,
        // but let's try a raw fetch to be sure.

        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            console.error('Error fetching models:', data);
        } else {
            console.log('Available Models:');
            if (data.models) {
                data.models.forEach((m: any) => {
                    console.log(`- ${m.name} (${m.supportedGenerationMethods?.join(', ')})`);
                });
            } else {
                console.log('No models returned.');
            }
        }

    } catch (error) {
        console.error('Script error:', error);
    }
}

main();
