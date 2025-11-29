import prisma from '@/lib/prisma';
import { Api } from '@prisma/client';

export class Scheduler {
    async getApisToCrawl(limit: number = 10): Promise<Api[]> {
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

        return prisma.api.findMany({
            where: {
                AND: [
                    {
                        OR: [
                            { lastCheckedAt: { lt: threeDaysAgo } },
                            { status: 'PENDING' }
                        ]
                    },
                    { status: { not: 'BROKEN' } }
                ]
            },
            orderBy: { lastCheckedAt: 'asc' },
            take: limit,
        });
    }

    async updateApiStatus(id: string, status: string, responseTimeMs?: number) {
        await prisma.api.update({
            where: { id },
            data: {
                lastCheckedAt: new Date(),
                status: status as any, // Cast to enum if needed
                responseTimeMs,
            },
        });
    }

    async updateApiInfo(id: string, info: any) {
        await prisma.api.update({
            where: { id },
            data: {
                description: info.description || undefined,
                pricingUrl: info.pricingUrl || undefined,
                changelogUrl: info.changelogUrl || undefined,
                registrationUrl: info.registrationUrl || undefined,
                logoUrl: info.logoUrl || undefined,
                pricingModel: info.pricingModel || undefined,
                supportChannels: info.supportChannels || undefined,
                lastCheckedAt: new Date(),
                // Only update status if it was pending, otherwise keep it active/as is
                // or we can explicitly set it to ACTIVE if crawl was successful
                status: 'ACTIVE',
            },
        });
    }
}
