import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const updates = [
    // Storage & Content
    { id: 'cmi8z4991003512sia22f31ay', url: 'https://cloudinary.com/documentation/api_platform' }, // Cloudinary
    { id: 'cmi8z4993003712sieehvtx5x', url: 'https://www.filestack.com/docs/api/' }, // Filestack
    { id: 'cmi8z4996003912sipu6ygd6k', url: 'https://docs.aws.amazon.com/s3/' }, // Amazon S3
    { id: 'cmi8z4999003b12sih7htixhw', url: 'https://cloud.google.com/storage/docs/json_api' }, // Google Cloud Storage
    { id: 'cmi8z499c003d12si7yt1j95x', url: 'https://www.dropbox.com/developers/documentation' }, // Dropbox
    { id: 'cmi8z499e003f12si6fhj1t16', url: 'https://developer.box.com/reference/' }, // Box

    // CRM
    { id: 'cmi8z499g003h12siu39lnufo', url: 'https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/' }, // Salesforce
    { id: 'cmi8z499j003j12simvk1ftpd', url: 'https://learn.microsoft.com/en-us/dynamics365/sales/developer/api-overview' }, // Dynamics 365 Sales
    { id: 'cmi8z499m003l12sibzl56t96', url: 'https://www.oracle.com/cx/' }, // Oracle CRM
    { id: 'cmi8z499p003n12sin5079io6', url: 'https://www.netsuite.com/portal/developers/overview.shtml' }, // NetSuite CRM
    { id: 'cmi8z499s003p12sij9a12yu7', url: 'https://developers.hubspot.com/docs/api/overview' }, // HubSpot
    { id: 'cmi8z499u003r12si0bqf1d2e', url: 'https://www.zoho.com/crm/developer/docs/api/v2/' }, // Zoho CRM
    { id: 'cmi8z499x003t12sihg31z51w', url: 'https://developer.monday.com/api-reference/docs' }, // Monday
    { id: 'cmi8z499z003v12si046xt38k', url: 'https://developers.pipedrive.com/docs/api/v1' }, // Pipedrive
    { id: 'cmi8z49a2003x12si14aqny0e', url: 'https://developer.close.com/' }, // Close
    { id: 'cmi8z49a4003z12six4o5ca9g', url: 'https://developer.copper.com/' }, // Copper

    // E-Signature
    { id: 'cmi8z49a7004112si36w08er3', url: 'https://developers.docusign.com/docs/esign-rest-api/' }, // DocuSign
    { id: 'cmi8z49aa004312sin0pzsuzr', url: 'https://developers.hellosign.com/api/reference/' }, // Dropbox Sign
    { id: 'cmi8z49ac004512sitm8f3u1d', url: 'https://opensource.adobe.com/acrobat-sign/sign-api/' }, // Adobe Sign
    { id: 'cmi8z49ae004712sinn3v3fhw', url: 'https://developers.pandadoc.com/' }, // PandaDoc
    { id: 'cmi8z49ah004912sizmec57j3', url: 'https://docs.signnow.com/' }, // SignNow

    // PDF
    { id: 'cmi8z49ak004b12sifn7bzyri', url: 'https://developer.adobe.com/document-services/docs/overview/pdf-services-api/' }, // Adobe PDF
    { id: 'cmi8z49ao004d12si1c1dby4m', url: 'https://docs.apryse.com/' }, // Apryse
    { id: 'cmi8z49aq004f12si6wosjwdk', url: 'https://developer.ilovepdf.com/' }, // iLovePDF
    { id: 'cmi8z49at004h12si6hect11f', url: 'https://pdf.co/documentation/api' }, // PDF.co
    { id: 'cmi8z49av004j12sixyilnv8k', url: 'https://docs.pdfgeneratorapi.com/' }, // PDF Generator
    { id: 'cmi8z49ay004l12siu1irmqkn', url: 'https://www.useanvil.com/docs/api/' }, // Anvil
    { id: 'cmi8z49b0004n12sihpja38zq', url: 'https://www.nutrient.io/documentation/' }, // Nutrient

    // E-commerce
    { id: 'cmi8z49b3004p12sia46e6ryq', url: 'https://shopify.dev/docs/api/admin-rest' }, // Shopify
    { id: 'cmi8z49b5004r12siobntfw5h', url: 'https://woocommerce.github.io/woocommerce-rest-api-docs/' }, // WooCommerce
    { id: 'cmi8z49b8004t12siaaujtp8v', url: 'https://developer.bigcommerce.com/docs/rest-management' }, // BigCommerce
    { id: 'cmi8z49bb004v12sig7f7a82i', url: 'https://developer.adobe.com/commerce/webapi/rest/' }, // Magento
    { id: 'cmi8z49be004x12sink9vmiwr', url: 'https://developers.squarespace.com/commerce-apis' }, // Squarespace
    { id: 'cmi8z49bh004z12siuwuf5icm', url: 'https://developer-docs.amazon.com/sp-api/' }, // Amazon SP-API
    { id: 'cmi8z49bl005112siai3m127f', url: 'https://developer.ebay.com/api-docs/static/ebay-rest-landing.html' }, // eBay
    { id: 'cmi8z49bo005312sieq4go33z', url: 'https://developers.etsy.com/documentation/' }, // Etsy
    { id: 'cmi8z49br005512si1153p2uf', url: 'https://developer.walmart.com/' }, // Walmart
    { id: 'cmi8z49bv005712sing2tiouj', url: 'https://developers.mercadolibre.com/' }, // MercadoLibre
    { id: 'cmi8z49by005912si3gfbw8uq', url: 'https://api2cart.com/api-docs/' }, // API2Cart

    // Others identified
    { id: 'cmi8z496l001h12si9kne8hbk', url: 'https://docs.aws.amazon.com/sagemaker/' }, // SageMaker
    { id: 'cmi8z496y001p12siqsxe41qd', url: 'https://support.singular.net/hc/en-us/articles/360037666951-Singular-API-Reference' }, // Singular
    { id: 'cmi8z497a001x12si5avznnb1', url: 'https://funnel.io/api' }, // Funnel
    { id: 'cmi8z497i002312sivrt8qv9d', url: 'https://cloud.google.com/looker/docs/reference/rest/v4.0/overview' }, // Looker
    { id: 'cmi8z497l002512siuij4sgi4', url: 'https://impact.com/partners/integrations/' }, // Impact.com
    { id: 'cmi8z497n002712siney18oce', url: 'https://docs.cometly.com/' }, // Cometly
    { id: 'cmi8z4988002n12sip6eeotpp', url: 'https://docs.incode.com/' }, // Incode
    { id: 'cmi8z498a002p12si0vqpt1uz', url: 'https://www.idnow.io/developers/' }, // IDnow
    { id: 'cmi8z498u003112sizu5v6yh0', url: 'https://hygraph.com/docs/api-reference' }, // Hygraph
];

async function main() {
    console.log('Batch updating final set of APIs...');

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
