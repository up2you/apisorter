import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import dns from 'dns';
import util from 'util';
import net from 'net';

const lookup = util.promisify(dns.lookup);

async function testTcpConnection(host: string, port: number): Promise<string> {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        const timer = setTimeout(() => {
            socket.destroy();
            resolve(`Timeout connecting to ${host}:${port}`);
        }, 3000);

        socket.connect(port, host, () => {
            clearTimeout(timer);
            socket.destroy();
            resolve(`Successfully connected to ${host}:${port}`);
        });

        socket.on('error', (err) => {
            clearTimeout(timer);
            resolve(`Error connecting to ${host}:${port}: ${err.message}`);
        });
    });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const dbUrl = process.env.DATABASE_URL || '';
    const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ':****@');

    const hostname = dbUrl.split('@')[1]?.split(':')[0];

    const results = {
        env: {
            DATABASE_URL_SET: !!dbUrl,
            DATABASE_URL_MASKED: maskedUrl,
            NODE_ENV: process.env.NODE_ENV,
        },
        dns: {} as any,
        tcp: {} as any,
        connection: {} as any,
    };

    // 1. DNS Lookup
    try {
        if (hostname) {
            const ip = await lookup(hostname);
            results.dns = { hostname, ip };
        } else {
            results.dns = { error: 'Could not parse hostname from DATABASE_URL' };
        }
    } catch (e: any) {
        results.dns = { error: e.message };
    }

    // 2. TCP Connection Test
    if (hostname) {
        results.tcp = {
            port5432: await testTcpConnection(hostname, 5432),
            port6543: await testTcpConnection(hostname, 6543),
        };
    }

    // 3. Prisma Connection
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
