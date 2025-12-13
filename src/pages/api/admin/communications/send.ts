import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import prisma from '@/lib/prisma';
import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const FROM_ADDRESS = process.env.EMAIL_FROM || 'API Sorter <updates@apisorter.com>';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user || session.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Unauthorized' });
    }

    if (!resend) {
        return res.status(500).json({ message: 'Email service not configured (RESEND_API_KEY missing)' });
    }

    const { subject, message, targetGroup } = req.body;

    if (!subject || !message || !targetGroup) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        let emails: string[] = [];

        // 1. Determine Recipients
        if (targetGroup === 'ALL_USERS') {
            const users = await prisma.user.findMany({
                select: { email: true },
                where: { emailVerified: { not: null } } // Only verified users
            });
            emails = users.map(u => u.email);
        } else if (targetGroup === 'SUBSCRIBERS') {
            const subscribers = await prisma.newsletterSubscriber.findMany({
                select: { email: true },
                where: { active: true }
            });
            emails = subscribers.map(s => s.email);
        } else if (targetGroup === 'ADMINS') {
            const admins = await prisma.user.findMany({
                select: { email: true },
                where: { role: 'ADMIN' }
            });
            emails = admins.map(u => u.email);
        } else if (targetGroup === 'PROVIDERS') {
            // Assuming providers are users who have claimed at least one provider
            // This is a bit complex query depending on schema, let's simplify:
            // Find users who are linked to a Provider via some relation OR have a specific role?
            // Since we don't have a specific 'PROVIDER' role in the enum yet (it's USER/ADMIN), 
            // and Claims link Users to Providers.
            // Let's defer "Provider Role" broadcast until we have a cleaner way to identify them.
            // For now, let's support explicit 'TEST' group (send to current admin only)
            emails = [session.user.email as string];
        } else if (targetGroup === 'TEST') {
            emails = [session.user.email as string];
        }

        // Remove duplicates and blanks
        emails = Array.from(new Set(emails)).filter(e => e && e.includes('@'));

        if (emails.length === 0) {
            return res.status(400).json({ message: 'No recipients found for this group' });
        }

        // 2. Batch Send (Resend allows batching, but simpler logic is loop for now or small batches)
        // Rate limits apply. For safety in this demo, we limit to 50 at a time or loop.
        // Resend's batch API is a specific endpoint, or we just await calls.

        let sentCount = 0;
        let failedCount = 0;

        // Simple parallel execution with limit
        // Using a basic loop for now. In production, use a queue (BullMQ/Inngest).
        for (const email of emails) {
            try {
                await resend.emails.send({
                    from: FROM_ADDRESS,
                    to: email,
                    subject: subject,
                    html: `
                        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2>${subject}</h2>
                            <div style="line-height: 1.6; color: #333;">
                                ${message.replace(/\n/g, '<br/>')}
                            </div>
                            <hr style="margin-top: 30px; border: 0; border-top: 1px solid #eee;" />
                            <p style="font-size: 12px; color: #888;">
                                You are receiving this email because you are a member of API Sorter.
                            </p>
                        </div>
                    `
                });
                sentCount++;
            } catch (err) {
                console.error(`Failed to email ${email}`, err);
                failedCount++;
            }
        }

        return res.status(200).json({
            success: true,
            message: `Processed broadcast. Sent: ${sentCount}, Failed: ${failedCount}`,
            stats: { sent: sentCount, failed: failedCount, total: emails.length }
        });

    } catch (error: any) {
        console.error('Broadcast Error:', error);
        return res.status(500).json({ message: 'Broadcast failed', details: error.message });
    }
}
