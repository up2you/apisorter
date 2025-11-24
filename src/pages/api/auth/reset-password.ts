import type { NextApiRequest, NextApiResponse } from 'next';
import { hash } from 'bcryptjs';

import prisma from '@/lib/prisma';
import { consumeVerificationToken } from '@/lib/auth/tokens';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { token, email, password } = req.body as { token?: string; email?: string; password?: string };

  if (!token || !email || !password) {
    return res.status(400).json({ error: 'Token, email, and password are required.' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  const verification = await consumeVerificationToken(token, 'password_reset');
  if (verification.status !== 'success' || verification.record?.identifier !== normalizedEmail) {
    return res.status(400).json({ error: 'Invalid or expired token.' });
  }

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    return res.status(400).json({ error: 'Account not found.' });
  }

  const hashedPassword = await hash(password, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      emailVerified: user.emailVerified ?? new Date(),
    },
  });

  return res.status(200).json({ message: 'Password updated successfully.' });
}

