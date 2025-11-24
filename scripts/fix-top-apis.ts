import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const updates = [
    { id: 'cmhq9xzca0000emipt6jma57a', url: 'https://platform.openai.com' }, // OpenAI
    { id: 'cmhq9xzcm0002emipsd9fpn8u', url: 'https://stripe.com/docs/api' }, // Stripe
    { id: 'cmhq9xzcq0003emipqyoksi24', url: 'https://www.twilio.com/docs/sms' }, // Twilio
    { id: 'cmi8z495k000t12si08rjbpcb', url: 'https://docs.anthropic.com/claude/docs' }, // Claude
    { id: 'cmhq9xzci0001emip8a1qk1un', url: 'https://developers.google.com/maps' }, // Google Maps
    { id: 'cmi8z496j001f12siulog2dgt', url: 'https://docs.snowflake.com/en/developer-guide/snowpark/index' }, // Snowflake
    { id: 'cmhq9xzcu0004emip24ae4dbf', url: 'https://docs.mapbox.com/api/maps/vector-tiles/' }, // Mapbox
    { id: 'cmi8z4950000h12sipl4zatq6', url: 'https://merge.dev' }, // Unified API (Merge)
    { id: 'cmi8z497v002d12sieypvrl6h', url: 'https://onfido.com' }, // Identity Verification (Onfido)
];

async function main() {
    console.log('Updating top APIs with official URLs...');

    for (const update of updates) {
        await prisma.api.update({
            where: { id: update.id },
            data: { docsUrl: update.url, logoUrl: null } // Reset logoUrl to trigger fetch
        });
        console.log(`Updated ${update.id} -> ${update.url}`);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
