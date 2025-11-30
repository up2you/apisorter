import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import dns from 'dns';
import util from 'util';

const lookup = util.promisify(dns.lookup);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const dbUrl = process.env.DATABASE_URL || '';
    const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ':****@');

    const results = {
        env: {
            DATABASE_URL_SET: !!dbUrl,
            DATABASE_URL_MASKED: maskedUrl,
            NODE_ENV: process.env.NODE_ENV,
        },
        dns: {} as any,
        connection: {} as any,
    };

    // 1. DNS Lookup
    try {
        const hostname = dbUrl.split('@')[1]?.split(':')[0];
        if (hostname) {
            const ip = await lookup(hostname);
            results.dns = { hostname, ip };
        } else {
            results.dns = { error: 'Could not parse hostname from DATABASE_URL' };
        }
    } catch (e: any) {
        results.dns = { error: e.message };
    }

    // 2. Prisma Connection
    const prisma = new PrismaClient();
    try {
        const count = await prisma.user.count();
        results.connection = { success: true, userCount: count };
    } catch (e: any) {
        results.connection = { success: false, error: e.message, code: e.code };
    } finally {
        await prisma.$disconnect();
    }

    res.status(200).json(results);
}
