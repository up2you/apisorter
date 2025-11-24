import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();

// Map of Provider Name -> Real Website
const REAL_WEBSITES: Record<string, string> = {
    'Shippo': 'https://goshippo.com',
    'EasyPost': 'https://www.easypost.com',
    'Klaviyo': 'https://www.klaviyo.com',
    'HubSpot': 'https://www.hubspot.com',
    'HubSpot Service Hub': 'https://www.hubspot.com/products/service',
    'Microsoft Graph': 'https://developer.microsoft.com/en-us/graph',
    'Microsoft Graph (Outlook Calendar)': 'https://developer.microsoft.com/en-us/graph',
    'Nylas': 'https://www.nylas.com',
    'Cronofy': 'https://www.cronofy.com',
    'Calendly': 'https://calendly.com',
    'Calendly API': 'https://developer.calendly.com',
    'Cal.com': 'https://cal.com',
    'SimplyBook.me': 'https://simplybook.me',
    'FullCalendar': 'https://fullcalendar.io',
    'Intercom': 'https://www.intercom.com',
    'Acuity Scheduling': 'https://acuityscheduling.com',
    'Acuity Scheduling (Squarespace)': 'https://developers.squarespace.com/acuity-scheduling-api',
    'Avalara': 'https://www.avalara.com',
    'Avalara (AvaTax API)': 'https://developer.avalara.com',
    'OpenAI': 'https://openai.com',
    'OpenAI Compliance API': 'https://openai.com/enterprise',
    'HERE Technologies': 'https://www.here.com',
    'MapTiler': 'https://www.maptiler.com',
    'Twilio': 'https://www.twilio.com',
    'Twilio Sendgrid': 'https://sendgrid.com',
    'Brevo': 'https://www.brevo.com',
    'Brevo (原 Sendinblue)': 'https://www.brevo.com',
    'Dynatrace': 'https://www.dynatrace.com',
    'UPS': 'https://www.ups.com',
    'UPS (優比速)': 'https://www.ups.com',
    'ShipEngine': 'https://www.shipengine.com',
    'ShipEngine (ShipStation subsidiary)': 'https://www.shipengine.com',
    'Easyship': 'https://www.easyship.com',
    'AfterShip': 'https://www.aftership.com',
    '17track': 'https://www.17track.net',
    '17track API': 'https://api.17track.net',
    'Zendesk': 'https://www.zendesk.com',
    'Freshdesk': 'https://freshdesk.com',
    'Freshdesk (Freshchat)': 'https://freshchat.com',
    'PubNub': 'https://www.pubnub.com',
    'Stream Chat': 'https://getstream.io/chat',
    'TalkJS': 'https://talkjs.com',
    'PubNub / Stream Chat / TalkJS': 'https://www.pubnub.com', // Fallback to one
    'Interactive Brokers': 'https://www.interactivebrokers.com',
    'Interactive Brokers (IBKR) API': 'https://www.interactivebrokers.com/en/trading/ib-api.php',
    'Google Vertex AI': 'https://cloud.google.com/vertex-ai',
    'Google Vertex AI Recommendations': 'https://cloud.google.com/vertex-ai',
    'Coveo': 'https://www.coveo.com',
    'ShipBob': 'https://www.shipbob.com',
    'Rollbar': 'https://rollbar.com',
    'Bloomreach': 'https://bloomreach.com',
    'ShipStation': 'https://www.shipstation.com',
    'Flexport': 'https://www.flexport.com',
    'Rips': 'https://www.ripstech.com', // Might be acquired/gone, check later
    'Public.com': 'https://public.com',
    'Public.com API': 'https://public.com/developer',
    'OnSched': 'https://onsched.com',
    'Recombee': 'https://www.recombee.com',
    'Insider': 'https://useinsider.com',
    'Dynamic Yield': 'https://www.dynamicyield.com',
    'Insider / Dynamic Yield': 'https://useinsider.com'
};

async function getFavicon(domain: string): Promise<string | null> {
    try {
        // Try Google Favicon API first (high quality)
        const googleUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
        const res = await fetch(googleUrl);
        if (res.ok) {
            // Google always returns an image, even a default globe.
            // We can't easily detect if it's the default globe without image analysis.
            // But for known domains, it's usually correct.
            return googleUrl;
        }
    } catch (e) {
        console.error(`Error fetching favicon for ${domain}:`, e);
    }
    return null;
}

async function main() {
    console.log('Fixing real logos for top providers...');

    for (const [name, url] of Object.entries(REAL_WEBSITES)) {
        console.log(`Processing ${name}...`);

        // 1. Find Provider
        const provider = await prisma.provider.findFirst({
            where: { name: { contains: name, mode: 'insensitive' } }
        });

        if (!provider) {
            console.log(`  -> Provider not found in DB.`);
            continue;
        }

        // 2. Get Logo
        const domain = new URL(url).hostname;
        const logoUrl = await getFavicon(domain);

        if (logoUrl) {
            console.log(`  -> Found logo: ${logoUrl}`);

            // 3. Update Provider
            await prisma.provider.update({
                where: { id: provider.id },
                data: {
                    website: url,
                    logoUrl: logoUrl
                }
            });

            // 4. Update APIs linked to this provider (if they don't have their own custom logo)
            // Actually, we should update APIs that currently have a generic logo or no logo.
            await prisma.api.updateMany({
                where: {
                    providerId: provider.id,
                    OR: [
                        { logoUrl: null },
                        { logoUrl: { startsWith: '/icons/' } }
                    ]
                },
                data: { logoUrl: logoUrl }
            });

            console.log(`  -> Updated provider and linked APIs.`);
        } else {
            console.log(`  -> No logo found.`);
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
