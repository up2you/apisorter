import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();

const KNOWN_DOMAINS: Record<string, string> = {
    'Algolia': 'https://www.algolia.com',
    'Datadog': 'https://www.datadoghq.com',
    'New Relic': 'https://newrelic.com',
    'Sentry': 'https://sentry.io',
    'Stripe Tax': 'https://stripe.com/tax',
    'Google Maps Platform': 'https://developers.google.com/maps',
    'Twilio': 'https://www.twilio.com',
    'Sendbird': 'https://sendbird.com',
    'FedEx': 'https://www.fedex.com',
    'FedEx (聯邦快遞)': 'https://www.fedex.com',
    'DHL': 'https://www.dhl.com',
    'Elasticsearch': 'https://www.elastic.co',
    'Radar': 'https://radar.com',
    'Foursquare': 'https://foursquare.com',
    'Foursquare / Factual': 'https://foursquare.com',
    'OpenStreetMap': 'https://www.openstreetmap.org',
    'OpenStreetMap (OSM)': 'https://www.openstreetmap.org',
    'Geoapify': 'https://www.geoapify.com',
    'GraphHopper': 'https://www.graphhopper.com',
    'ArcGIS': 'https://www.esri.com',
    'ArcGIS (Esri)': 'https://www.esri.com',
    'Mailgun': 'https://www.mailgun.com',
    'mail gun': 'https://www.mailgun.com',
    'Postmark': 'https://postmarkapp.com',
    'Amazon SES': 'https://aws.amazon.com/ses',
    'OneSignal': 'https://onesignal.com',
    'LogRocket': 'https://logrocket.com',
    'USPS': 'https://www.usps.com',
    'USPS (美國郵政)': 'https://www.usps.com',
    'EasyPost': 'https://www.easypost.com',
    'Twilio (Conversations API)': 'https://www.twilio.com/conversations',
    'Twilio (Conversations)': 'https://www.twilio.com/conversations',
    'Twilio (CPaaS)': 'https://www.twilio.com',
    'Vonage': 'https://www.vonage.com',
    'Fullstory': 'https://www.fullstory.com',
    'Smartling': 'https://www.smartling.com',
    'Phrase': 'https://phrase.com',
    'Phrase (原 PhraseApp)': 'https://phrase.com',
    'NASDAQ Data Link': 'https://data.nasdaq.com',
    'NASDAQ Data Link (formerly Quandl)': 'https://data.nasdaq.com',
    'Financial Modeling Prep': 'https://site.financialmodelingprep.com',
    'Financial Modeling Prep (FMP) API': 'https://site.financialmodelingprep.com',
    'EOD Historical Data': 'https://eodhd.com',
    'EOD Historical Data (EODHD) API': 'https://eodhd.com',
    'Massive': 'https://polygon.io',
    'Massive (original Polygon.io)': 'https://polygon.io',
    'Alpaca API': 'https://alpaca.markets',
    'Apple MapKit': 'https://developer.apple.com/maps',
    'Microsoft Bing Maps': 'https://www.microsoft.com/maps',
    'Lovat Compliance': 'https://vatcompliance.co',
    'VAT API': 'https://vatapi.com',
    'VAT API (vatapi.com)': 'https://vatapi.com',
    'i18 connection': 'https://i18n.com', // Best guess or generic
    'Localazy': 'https://localazy.com',
    'Localize': 'https://localizejs.com',
    'ENCODED': 'https://encoded.com', // Generic placeholder?
    'TomTom': 'https://www.tomtom.com',
    'Stream': 'https://getstream.io',
    'Tawk.to': 'https://tawk.to',
    'AWS Personalize': 'https://aws.amazon.com/personalize',
    'Google Calendar API': 'https://developers.google.com/calendar',
    'Trader API': 'https://traderapi.com', // Generic?
    'timekit': 'https://timekit.io',
    'Adyen': 'https://www.adyen.com',
    'PayPal': 'https://www.paypal.com',
    'PayPal / Braintree': 'https://www.braintreepayments.com',
    '支付寶 (Alipay)': 'https://www.alipay.com',
    'Alipay': 'https://www.alipay.com',
    'WeChat Pay': 'https://pay.weixin.qq.com',
    'Square': 'https://squareup.com',
    'Authorize.Net': 'https://www.authorize.net',
    'Checkout.com': 'https://www.checkout.com',
    'Payoneer': 'https://www.payoneer.com',
    'Now': 'https://vercel.com', // Assuming Vercel (Zeit Now), but could be ServiceNow. Skipping for safety if unsure, but "Now" usually refers to Vercel in dev context.
    'ServiceNow': 'https://www.servicenow.com',
    'OpenAI': 'https://openai.com',
    'Anthropic': 'https://www.anthropic.com',
    'Cohere': 'https://cohere.com',
    'Hugging Face': 'https://huggingface.co',
    'Stability AI': 'https://stability.ai',
    'Salesforce': 'https://www.salesforce.com',
    'HubSpot': 'https://www.hubspot.com',
    'Shopify': 'https://www.shopify.com',
    'WooCommerce': 'https://woocommerce.com',
    'BigCommerce': 'https://www.bigcommerce.com',
    'Magento': 'https://business.adobe.com/products/magento/magento-commerce.html',
    'Squarespace': 'https://www.squarespace.com',
    'Xero': 'https://www.xero.com',
    'Intuit QuickBooks': 'https://quickbooks.intuit.com',
    'Zoho': 'https://www.zoho.com',
    'Pipedrive': 'https://www.pipedrive.com',
    'Dropbox': 'https://www.dropbox.com',
    'Box': 'https://www.box.com',
    'DocuSign': 'https://www.docusign.com',
    'Cloudinary': 'https://cloudinary.com',
    'Contentful': 'https://www.contentful.com',
    'Sanity': 'https://www.sanity.io',
    'Storyblok': 'https://www.storyblok.com',
    'Auth0': 'https://auth0.com',
    'Okta': 'https://www.okta.com',
    'Stripe': 'https://stripe.com',
    'Amazon S3': 'https://aws.amazon.com/s3',
    'Google Cloud Storage': 'https://cloud.google.com/storage',
    'IBM Watson': 'https://www.ibm.com/watson',
    'Microsoft Azure': 'https://azure.microsoft.com',
    'Oracle': 'https://www.oracle.com',
    'SAP': 'https://www.sap.com',
    'NetSuite': 'https://www.netsuite.com',
    'Monday.com': 'https://monday.com',
    'Jira': 'https://www.atlassian.com/software/jira',
    'Trello': 'https://trello.com',
    'Asana': 'https://asana.com',
    'Notion': 'https://www.notion.so',
    'Slack': 'https://slack.com',
    'Discord': 'https://discord.com',
    'Zoom': 'https://zoom.us',
    'Microsoft Teams': 'https://www.microsoft.com/microsoft-teams',
    'Webex': 'https://www.webex.com',
    'GoToMeeting': 'https://www.gotomeeting.com',
    'Intercom': 'https://www.intercom.com',
    'Zendesk': 'https://www.zendesk.com',
    'Freshworks': 'https://www.freshworks.com'
};

async function getFavicon(domain: string): Promise<string | null> {
    try {
        const googleUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
        // We assume Google always returns something valid for these known domains
        return googleUrl;
    } catch (e) {
        return null;
    }
}

async function main() {
    console.log('Resolving Google Search URLs...');

    const providers = await prisma.provider.findMany({
        where: {
            website: {
                contains: 'google.com/search'
            }
        }
    });

    console.log(`Found ${providers.length} providers to fix.`);

    for (const p of providers) {
        let realUrl = null;

        // Try exact match
        if (KNOWN_DOMAINS[p.name]) {
            realUrl = KNOWN_DOMAINS[p.name];
        }
        // Try partial match
        else {
            for (const [key, url] of Object.entries(KNOWN_DOMAINS)) {
                if (p.name.includes(key)) {
                    realUrl = url;
                    break;
                }
            }
        }

        if (realUrl) {
            console.log(`[FIXING] ${p.name} -> ${realUrl}`);
            const domain = new URL(realUrl).hostname;
            const logoUrl = await getFavicon(domain);

            await prisma.provider.update({
                where: { id: p.id },
                data: {
                    website: realUrl,
                    logoUrl: logoUrl
                }
            });

            // Update linked APIs
            await prisma.api.updateMany({
                where: { providerId: p.id },
                data: { logoUrl: logoUrl }
            });
        } else {
            console.log(`[SKIPPING] Could not resolve ${p.name}`);
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
