import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const updates = [
    // Specific AI/ML APIs
    { id: 'cmi8z495n000v12sirvua18nd', url: 'https://learn.microsoft.com/en-us/azure/ai-services/openai/' }, // Azure OpenAI
    { id: 'cmi8z495g000r12siqxma533p', url: 'https://ai.google.dev/' }, // Gemini
    { id: 'cmi8z495t000z12si1m3iuzf0', url: 'https://platform.stability.ai/docs/api-reference' }, // Stable Diffusion
    { id: 'cmi8z495q000x12si16pgy26m', url: 'https://docs.cohere.com/' }, // Cohere
    { id: 'cmi8z495w001112si02c970a4', url: 'https://huggingface.co/docs/api-inference/index' }, // Hugging Face
    { id: 'cmi8z496g001d12siq7g3y8sb', url: 'https://docs.databricks.com/api/' }, // Databricks
    { id: 'cmi8z495d000p12si2iexaf72', url: 'https://platform.openai.com/docs/models' }, // GPT-4 (OpenAI)

    // Generic/Accounting APIs (mapped from Provider)
    { id: 'cmi8z4941000112sih50al2y4', url: 'https://developer.intuit.com/app/developer/qbo/docs/api/accounting/all-entities/account' }, // QuickBooks
    { id: 'cmi8z4948000312silsdnfnf5', url: 'https://developer.xero.com/documentation/api/accounting/overview' }, // Xero
    { id: 'cmi8z494c000512si2wlj1ldg', url: 'https://developer.sage.com/intacct/' }, // Sage
    { id: 'cmi8z494f000712sidn4d2fbj', url: 'https://www.freshbooks.com/api/start' }, // FreshBooks
    { id: 'cmi8z494k000912sipyv2nw24', url: 'https://www.zoho.com/books/api/v3/' }, // Zoho Books
    { id: 'cmi8z494o000b12siiz6yrxe0', url: 'https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/' }, // NetSuite
    { id: 'cmi8z494t000d12si3hg53gz6', url: 'https://learn.microsoft.com/en-us/dynamics365/' }, // Dynamics 365

    // Financial Data
    { id: 'cmi8z4954000j12sibyqmklpa', url: 'https://www.alphavantage.co/documentation/' }, // Alpha Vantage
    { id: 'cmi8z4957000l12si7gart4p8', url: 'https://finnhub.io/docs/api' }, // Finnhub
    { id: 'cmi8z495a000n12sim01isq37', url: 'https://plaid.com/docs/' }, // Plaid

    // Other specific ones identified
    { id: 'cmi8z4960001312si5spsnt3i', url: 'https://www.assemblyai.com/docs' }, // AssemblyAI
    { id: 'cmi8z4964001512si1yhc7vpb', url: 'https://elevenlabs.io/docs/api-reference' }, // ElevenLabs
    { id: 'cmi8z4967001712si4fu0d0dx', url: 'https://cloud.google.com/vision/docs' }, // Google Cloud Vision
    { id: 'cmi8z496a001912siezdv8bgh', url: 'https://docs.aws.amazon.com/rekognition/' }, // AWS Rekognition
    { id: 'cmi8z496d001b12si8d2kg123', url: 'https://www.ibm.com/docs/en/watson-assistant' }, // IBM Watson
    { id: 'cmi8z496o001j12sidwaunxk3', url: 'https://developers.google.com/analytics/devguides/reporting/data/v1' }, // Google Analytics Data API
    { id: 'cmi8z496r001l12si8rxo759t', url: 'https://developers.refinitiv.com/en' }, // Refinitiv
    { id: 'cmi8z496v001n12sikckkt2qo', url: 'https://www.kaggle.com/docs/api' }, // Kaggle
    { id: 'cmi8z4971001r12sigmwz52x5', url: 'https://dev.appsflyer.com/hc/docs' }, // AppsFlyer
    { id: 'cmi8z4975001t12sio4nvhkrm', url: 'https://help.adjust.com/en/article/api-docs' }, // Adjust
    { id: 'cmi8z4978001v12si9fl6zn9f', url: 'https://help.branch.io/developers-hub/docs' }, // Branch
    { id: 'cmi8z497d001z12siogj13guc', url: 'https://developers.google.com/analytics/devguides/collection/ga4' }, // GA4
    { id: 'cmi8z497g002112si86ggjmr0', url: 'https://developer.adobe.com/analytics-apis/docs/2.0/' }, // Adobe Analytics
    { id: 'cmi8z497q002912sirh3iy14m', url: 'https://auth0.com/docs/api' }, // Auth0
    { id: 'cmi8z497t002b12si07mgsp3m', url: 'https://docs.jumio.com/' }, // Jumio
    { id: 'cmi8z497y002f12si14p73cke', url: 'https://developers.sumsub.com/api-reference/' }, // Sumsub
    { id: 'cmi8z4980002h12si99v49v7c', url: 'https://developers.veriff.com/' }, // Veriff
    { id: 'cmi8z4983002j12si037di8pa', url: 'https://docs.trulioo.com/' }, // Trulioo
    { id: 'cmi8z4985002l12siywcsms9o', url: 'https://docs.withpersona.com/reference/introduction' }, // Persona
    { id: 'cmi8z498d002r12sigufs5xpx', url: 'https://docs.seon.io/api-reference' }, // SEON
    { id: 'cmi8z498g002t12sipwhx8xhd', url: 'https://developers.id.me/' }, // ID.me
    { id: 'cmi8z498l002v12sivbvsmd76', url: 'https://www.contentful.com/developers/docs/references/content-delivery-api/' }, // Contentful
    { id: 'cmi8z498o002x12sig5bujzab', url: 'https://www.sanity.io/docs/http-api' }, // Sanity
    { id: 'cmi8z498r002z12sigktyswas', url: 'https://www.storyblok.com/docs/api/content-delivery' }, // Storyblok
];

async function main() {
    console.log('Batch updating APIs with discovered URLs...');

    for (const update of updates) {
        try {
            await prisma.api.update({
                where: { id: update.id },
                data: { docsUrl: update.url, logoUrl: null } // Reset logoUrl to trigger fetch
            });
            console.log(`Updated ${update.id} -> ${update.url}`);
        } catch (e) {
            console.error(`Failed to update ${update.id}:`, e);
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
