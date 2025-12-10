import 'dotenv/config';
import axios from 'axios';

async function main() {
    console.log('Triggering Production Discovery Endpoint...');

    const secret = process.env.CRON_SECRET_TOKEN;
    if (!secret) {
        console.error('CRON_SECRET_TOKEN not found in .env');
        process.exit(1);
    }

    const prodUrl = 'https://apisorter.vercel.app/api/cron/discovery';

    try {
        console.log(`Sending request to ${prodUrl}...`);
        const response = await axios.get(prodUrl, {
            headers: {
                'Authorization': `Bearer ${secret}`
            },
            timeout: 60000 // 60s timeout
        });

        console.log('✅ Success!');
        console.log('Response Status:', response.status);
        console.log('Response Data:', JSON.stringify(response.data, null, 2));

    } catch (error: any) {
        if (error.response) {
            console.error('❌ Request Failed');
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('❌ Error:', error.message);
        }
    }
}

main();
