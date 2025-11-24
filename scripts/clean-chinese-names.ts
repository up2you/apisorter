import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Regex to match Chinese characters
const CHINESE_REGEX = /[\u4e00-\u9fa5]+/g;

async function main() {
    console.log('Cleaning Chinese characters from database...');

    // 1. Clean Providers
    const providers = await prisma.provider.findMany();
    for (const p of providers) {
        if (CHINESE_REGEX.test(p.name)) {
            // Remove Chinese
            let newName = p.name.replace(CHINESE_REGEX, '').trim();
            // Remove empty parens
            newName = newName.replace(/\(\s*\)/g, '').trim();
            // Remove Chinese punctuation and excessive commas
            newName = newName.replace(/[、，。]/g, ',').replace(/,+/g, ',').replace(/^,|,$/g, '').trim();

            if (newName !== p.name && newName.length > 0) {
                console.log(`[Provider] Renaming "${p.name}" -> "${newName}"`);
                try {
                    await prisma.provider.update({
                        where: { id: p.id },
                        data: { name: newName }
                    });
                } catch (e) {
                    console.error(`Failed to update provider ${p.name}:`, e);
                }
            }
        }
    }

    // 2. Clean APIs
    const apis = await prisma.api.findMany();
    for (const api of apis) {
        if (CHINESE_REGEX.test(api.name)) {
            // Remove Chinese
            let newName = api.name.replace(CHINESE_REGEX, '').trim();
            // Remove empty parens
            newName = newName.replace(/\(\s*\)/g, '').trim();
            // Remove Chinese punctuation and excessive commas
            newName = newName.replace(/[、，。]/g, ',').replace(/,+/g, ',').replace(/^,|,$/g, '').trim();

            if (newName !== api.name && newName.length > 0) {
                console.log(`[API] Renaming "${api.name}" -> "${newName}"`);
                try {
                    await prisma.api.update({
                        where: { id: api.id },
                        data: { name: newName }
                    });
                } catch (e) {
                    console.error(`Failed to update API ${api.name}:`, e);
                }
            }
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
