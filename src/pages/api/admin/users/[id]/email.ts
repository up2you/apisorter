import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import prisma from '@/lib/prisma';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user || session.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Unauthorized' });
    }

    if (req.method === 'POST') {
        const { id } = req.query;
        const { subject, message } = req.body;

        if (!subject || !message) {
            return res.status(400).json({ error: 'Subject and message are required' });
        }

        try {
            const user = await prisma.user.findUnique({
                where: { id: String(id) },
                select: { email: true, name: true }
            });

            if (!user || !user.email) {
                return res.status(404).json({ error: 'User not found or no email' });
            }

            if (resend) {
                await resend.emails.send({
                    from: 'ApiSorter Admin <admin@apisorter.com>', // Ensure domain is verified in Resend
                    to: user.email,
                    subject: subject,
                    html: `<p>Hi ${user.name || 'there'},</p><div style="white-space: pre-wrap;">${message}</div><p>Best regards,<br>ApiSorter Team</p>`
                });
            } else {
                console.log(`[MOCK EMAIL] To: ${user.email}, Subject: ${subject}, Body: ${message}`);
            }

            res.status(200).json({ success: true });
        } catch (error: any) {
            console.error('Send Email Failed:', error);
            res.status(500).json({ error: 'Failed to send email' });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
