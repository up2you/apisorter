import type { NextApiRequest, NextApiResponse } from 'next';

import prisma from '@/lib/prisma';
import { createVerificationToken } from '@/lib/auth/tokens';
import { sendPasswordResetEmail } from '@/lib/email';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { email } = req.body as { email?: string };

  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (user) {
    const token = await createVerificationToken(normalizedEmail, 'password_reset');
    await sendPasswordResetEmail(normalizedEmail, token);
  }

  // For security, always respond success even if user is not found.
  return res.status(200).json({ message: 'If the email exists, a reset link has been sent.' });
}



