import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categoryMappings = [
    {
        icon: '/icons/categories/finance_icon.svg',
        keywords: ['Trading', 'Stock', 'Crypto', 'Finance', 'Payment', 'Bank', 'Accounting', 'Invoice', 'Tax', 'VAT', 'Billing', 'Ledger', 'Payroll', 'Expense', 'Revenue', 'Capital', 'Market', 'Exchange', 'Broker', 'Alpaca', 'Polygon', 'FMP', 'Quandl', 'Interactive Brokers', 'EOD', 'Financial']
    },
    {
        icon: '/icons/categories/translation_icon.svg',
        keywords: ['Translation', 'Language', 'Localization', 'i18n', 'TMS', 'Phrase', 'Smartling', 'Localize']
    },
    {
        icon: '/icons/categories/maps_icon.svg',
        keywords: ['Map', 'Location', 'Geocoding', 'Routing', 'Place', 'GIS', 'Address']
    },
    {
        icon: '/icons/categories/email_icon.svg',
        keywords: ['Email', 'Mail', 'Messaging', 'SMS', 'Chat', 'Communication', 'Notification', 'Push', 'Klaviyo', 'Intercom', 'Customer', 'Support', 'Bot', 'Sendbird', 'PubNub', 'Stream', 'Tawk', 'Vonage']
    },
    {
        icon: '/icons/categories/monitoring_icon.svg',
        keywords: ['Monitoring', 'Observability', 'Log', 'Error', 'Trace', 'APM', 'Metrics', 'Analytics', 'Reporting', 'Datadog', 'New Relic', 'Sentry', 'Rollbar', 'Dynatrace', 'Fullstory', 'LogRocket', 'Algolia', 'Elasticsearch', 'Search', 'Recommend', 'Discovery', 'Insight']
    },
    {
        icon: '/icons/categories/crm_icon.svg',
        keywords: ['CRM', 'ERP', 'Customer', 'Sales', 'Marketing', 'Support', 'Ticket', 'Contact', 'HubSpot', 'Salesforce', 'Zendesk', 'Freshdesk', 'Calendar', 'Schedule', 'Booking', 'Appointment', 'Calendly', 'Cronofy', 'Cal.com', 'Timekit', 'SimplyBook']
    },
    {
        icon: '/icons/categories/shipping_icon.svg',
        keywords: ['Shipping', 'Tracking', 'Carrier', 'Logistics', 'Delivery', 'Freight', 'ShipStation', 'ShipBob', 'Flexport', 'AfterShip']
    }
];

async function main() {
    console.log('Assigning generic logos to providers...');

    const providers = await prisma.provider.findMany({
        where: { logoUrl: null },
        include: { apis: true }
    });

    console.log(`Found ${providers.length} providers without logos.`);

    for (const provider of providers) {
        let assignedIcon = null;

        // Check provider name and API names for keywords
        const textToSearch = (provider.name + ' ' + provider.apis.map(a => a.name).join(' ')).toLowerCase();

        for (const category of categoryMappings) {
            if (category.keywords.some(k => textToSearch.includes(k.toLowerCase()))) {
                assignedIcon = category.icon;
                break; // Stop at first match
            }
        }

        if (assignedIcon) {
            console.log(`Assigning ${assignedIcon} to ${provider.name}`);
            await prisma.provider.update({
                where: { id: provider.id },
                data: { logoUrl: assignedIcon }
            });
        } else {
            console.log(`No category match for ${provider.name}`);
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
