import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();
const CHINESE_REGEX = /[\u4e00-\u9fa5]+/;

async function main() {
    const providers = await prisma.provider.findMany();
    const apis = await prisma.api.findMany();

    const chineseNames = new Set<string>();
    const chineseDescriptions = new Set<string>();

    for (const p of providers) {
        if (CHINESE_REGEX.test(p.name)) {
            chineseNames.add(p.name);
        }
    }

    for (const api of apis) {
        if (CHINESE_REGEX.test(api.name)) {
            chineseNames.add(api.name);
        }
        if (api.description && CHINESE_REGEX.test(api.description)) {
            chineseDescriptions.add(api.description);
        }
    }

    const output = {
        names: Array.from(chineseNames),
        descriptions: Array.from(chineseDescriptions)
    };

    console.log(`Found ${output.names.length} names and ${output.descriptions.length} descriptions with Chinese.`);
    fs.writeFileSync('chinese_strings.json', JSON.stringify(output, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
