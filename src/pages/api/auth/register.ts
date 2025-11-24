import type { NextApiRequest, NextApiResponse } from 'next';
import { hash } from 'bcryptjs';

import prisma from '@/lib/prisma';
import { createVerificationToken } from '@/lib/auth/tokens';
import { sendEmailVerification } from '@/lib/email';

interface RegisterBody {
  email?: string;
  password?: string;
  name?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { email, password, name }: RegisterBody = req.body ?? {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const safeName = name?.trim() || null;

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return res.status(400).json({ error: 'Invalid email format.' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }

  const hashedPassword = await hash(password, 12);

  await prisma.user.create({
    data: {
      email: normalizedEmail,
      password: hashedPassword,
      name: safeName,
      role: 'USER',
    },
  });

  const token = await createVerificationToken(normalizedEmail, 'email_verification');
  await sendEmailVerification(normalizedEmail, token);

  return res.status(201).json({ message: 'Account created. Please check your email to verify the account.' });
}



