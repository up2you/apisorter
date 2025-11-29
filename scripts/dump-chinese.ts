import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
    const chineseRegex = /[\u4e00-\u9fa5]/;
    const apis = await prisma.api.findMany({
        where: { status: 'ACTIVE' },
        select: { id: true, name: true, description: true }
    });

    const toTranslate: Record<string, string> = {};

    for (const api of apis) {
        if (api.description && chineseRegex.test(api.description)) {
            toTranslate[api.id] = api.description;
        }
    }

    const outputPath = path.join(process.cwd(), 'scripts', 'chinese_descriptions.json');
    fs.writeFileSync(outputPath, JSON.stringify(toTranslate, null, 2));
    console.log(`Dumped ${Object.keys(toTranslate).length} descriptions to ${outputPath}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
