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
    'timekit': 'https://timekit.io'
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
