import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { spawn } from 'child_process';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user || session.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Unauthorized' });
    }

    if (req.method === 'POST') {
        try {
            // Spawn the crawler script in the background
            const scriptPath = path.join(process.cwd(), 'scripts', 'crawler.ts');

            // Use shell: true to support npx on Windows
            const child = spawn('npx', ['tsx', scriptPath], {
                cwd: process.cwd(),
                detached: true,
                stdio: 'ignore', // Keep ignore for now to prevent hanging, but could pipe to log file
                shell: true,     // Required for Windows npx
                windowsHide: true, // Hide the terminal window on Windows
            });

            child.unref();

            res.status(200).json({ message: 'Crawler started in background' });
        } catch (error) {
            console.error('Failed to start crawler:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
