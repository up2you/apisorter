import { AIAnalyzer } from '../src/lib/discovery/aiAnalyzer';
import dotenv from 'dotenv';

dotenv.config();

async function testAnalyzer() {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
        console.error('Error: GOOGLE_GENERATIVE_AI_API_KEY is missing in .env');
        process.exit(1);
    }

    console.log('Initializing AIAnalyzer with key:', apiKey.substring(0, 5) + '...');
    const analyzer = new AIAnalyzer(apiKey);

    const sampleTitle = "Stripe launches new Financial Connections API";
    const sampleContent = "Stripe today announced Financial Connections, a new product that enables businesses to securely connect to their customers' financial accounts. The API allows developers to verify accounts, check balances, and pull transaction data.";

    console.log('\nAnalyzing sample content...');
    console.log('Title:', sampleTitle);
    console.log('Content:', sampleContent);

    const result = await analyzer.analyze(sampleContent, sampleTitle);

    console.log('\nAnalysis Result:');
    console.log(JSON.stringify(result, null, 2));

    if (result && result.name.includes('Stripe')) {
        console.log('\n✅ Test PASSED: AI correctly identified the API.');
    } else {
        console.log('\n❌ Test FAILED: AI failed to identify the API.');
    }
}

testAnalyzer();
