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

    // Hardcoded hostname to ensure we get the correct IP resolution
    // regardless of what is currently in DATABASE_URL
    const hostname = 'db.imjtxkdqlfwkfeqsmaws.supabase.co';

    const results = {
        env: {
            DATABASE_URL_SET: !!dbUrl,
            DATABASE_URL_MASKED: maskedUrl,
            NODE_ENV: process.env.NODE_ENV,
        },
        dns: {
            target_hostname: hostname,
            ipv4: {} as any,
            ipv6: {} as any,
        },
        tcp: {} as any,
        connection: {} as any,
    };

    // 1. DNS Lookup (IPv4 & IPv6)
    try {
        // Look for IPv4
        try {
            const ipv4 = await lookup(hostname, { family: 4 });
            results.dns.ipv4 = ipv4;
        } catch (e: any) {
            results.dns.ipv4 = { error: e.message };
        }

        // Look for IPv6
        try {
            const ipv6 = await lookup(hostname, { family: 6 });
            results.dns.ipv6 = ipv6;
        } catch (e: any) {
            results.dns.ipv6 = { error: e.message };
        }
    } catch (e: any) {
        results.dns.ipv4 = { error: e.message };
    }

    // 2. TCP Connection Test (Try IPv4 if available)
    if (results.dns.ipv4 && results.dns.ipv4.address) {
        results.tcp.ipv4_port5432 = await testTcpConnection(results.dns.ipv4.address, 5432);
        results.tcp.ipv4_port6543 = await testTcpConnection(results.dns.ipv4.address, 6543);
    }

    if (results.dns.ipv6 && results.dns.ipv6.address) {
        results.tcp.ipv6_port5432 = await testTcpConnection(results.dns.ipv6.address, 5432);
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
