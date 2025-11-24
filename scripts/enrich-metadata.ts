import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const tagMappings = [
    {
        tags: ['Finance', 'Trading', 'Market Data'],
        keywords: ['Trading', 'Stock', 'Crypto', 'Finance', 'Market', 'Exchange', 'Broker', 'Alpaca', 'Polygon', 'FMP', 'Quandl', 'Interactive Brokers', 'EOD', 'Financial', 'Alpha Vantage']
    },
    {
        tags: ['Payments', 'Billing', 'Fintech'],
        keywords: ['Payment', 'Bank', 'Accounting', 'Invoice', 'Tax', 'VAT', 'Billing', 'Ledger', 'Payroll', 'Expense', 'Revenue', 'Stripe', 'PayPal', 'Square']
    },
    {
        tags: ['AI', 'Machine Learning', 'NLP'],
        keywords: ['AI', 'Machine Learning', 'ML', 'NLP', 'LLM', 'Generative', 'Vision', 'Speech', 'Translation', 'Chatbot', 'OpenAI', 'Anthropic', 'Cohere', 'Hugging Face']
    },
    {
        tags: ['Maps', 'Location', 'Geocoding'],
        keywords: ['Map', 'Location', 'Geocoding', 'Routing', 'Place', 'GIS', 'Address', 'Navigation', 'Google Maps', 'Mapbox', 'TomTom', 'HERE']
    },
    {
        tags: ['Communication', 'Messaging', 'Notification'],
        keywords: ['Email', 'Mail', 'Messaging', 'SMS', 'Chat', 'Communication', 'Notification', 'Push', 'Twilio', 'Sendgrid', 'Mailgun', 'Vonage']
    },
    {
        tags: ['CRM', 'Sales', 'Customer Support'],
        keywords: ['CRM', 'ERP', 'Customer', 'Sales', 'Marketing', 'Support', 'Ticket', 'Contact', 'Lead', 'HubSpot', 'Salesforce', 'Zendesk', 'Freshdesk', 'Intercom']
    },
    {
        tags: ['Storage', 'Cloud', 'File Management'],
        keywords: ['Storage', 'File', 'Upload', 'CDN', 'Cloud', 'Object', 'Hosting', 'S3', 'Dropbox', 'Box', 'Google Drive']
    },
    {
        tags: ['E-commerce', 'Retail', 'Inventory'],
        keywords: ['E-commerce', 'Shop', 'Product', 'Order', 'Cart', 'Checkout', 'Inventory', 'Shopify', 'WooCommerce', 'Magento', 'BigCommerce']
    },
    {
        tags: ['Data', 'Analytics', 'Observability'],
        keywords: ['Data', 'Analytics', 'Metrics', 'Reporting', 'Scraping', 'Extraction', 'Monitoring', 'Log', 'Trace', 'Datadog', 'New Relic']
    },
    {
        tags: ['Security', 'Identity', 'Compliance'],
        keywords: ['Security', 'Auth', 'Identity', 'Verification', 'KYC', 'Compliance', 'Auth0', 'Okta', 'Onfido']
    },
    {
        tags: ['Productivity', 'Scheduling', 'Calendar'],
        keywords: ['Calendar', 'Schedule', 'Booking', 'Appointment', 'Task', 'Project', 'Calendly', 'Notion', 'Monday', 'Asana']
    },
    {
        tags: ['DevTools', 'Infrastructure'],
        keywords: ['DevTools', 'Infrastructure', 'Deployment', 'Serverless', 'Container', 'Docker', 'Kubernetes', 'Vercel', 'Netlify']
    }
];

async function main() {
    console.log('Enriching API metadata...');

    const apis = await prisma.api.findMany({
        where: {
            OR: [
                { tags: { isEmpty: true } },
                { description: null }
            ]
        }
    });

    console.log(`Found ${apis.length} APIs to enrich.`);

    for (const api of apis) {
        const updates: any = {};
        let hasUpdates = false;

        // 1. Generate Tags
        if (!api.tags || api.tags.length === 0) {
            const newTags = new Set<string>();
            const textToSearch = (api.name + ' ' + (api.category || '')).toLowerCase();

            // Add category as a tag
            if (api.category) {
                newTags.add(api.category);
            }

            // Add tags based on keywords
            for (const mapping of tagMappings) {
                if (mapping.keywords.some(k => textToSearch.includes(k.toLowerCase()))) {
                    mapping.tags.forEach(t => newTags.add(t));
                }
            }

            // If no tags found, add a generic one based on category or "API"
            if (newTags.size === 0) {
                newTags.add('API');
                if (api.category) newTags.add(api.category);
            }

            updates.tags = Array.from(newTags);
            hasUpdates = true;
        }

        // 2. Generate Description
        if (!api.description) {
            const category = api.category || 'software';
            updates.description = `${api.name} provides powerful ${category} capabilities for developers. Integrate ${api.name} to enhance your application with robust ${category} features.`;
            hasUpdates = true;
        }

        if (hasUpdates) {
            console.log(`Updating ${api.name}...`);
            if (updates.tags) console.log(`  -> Tags: ${updates.tags.join(', ')}`);
            if (updates.description) console.log(`  -> Description: Generated`);

            await prisma.api.update({
                where: { id: api.id },
                data: updates
            });
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
