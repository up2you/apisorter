import 'dotenv/config';
import axios from 'axios';

async function main() {
    console.log('Testing Discovery Endpoint...');

    const secret = process.env.CRON_SECRET_TOKEN;
    if (!secret) {
        console.error('CRON_SECRET_TOKEN not found');
        process.exit(1);
    }

    try {
        // Note: This requires the dev server to be running
        const response = await axios.get('http://localhost:3000/api/cron/discovery', {
            headers: {
                'Authorization': `Bearer ${secret}`
            },
            timeout: 60000 // 60s timeout
        });

        console.log('Response Status:', response.status);
        console.log('Response Data:', JSON.stringify(response.data, null, 2));

    } catch (error: any) {
        if (error.response) {
            console.error('Error Response:', error.response.status, error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
}

main();
