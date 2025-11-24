import crypto from 'crypto';

import prisma from '@/lib/prisma';

export type VerificationTokenType = 'email_verification' | 'password_reset';

const DEFAULT_EMAIL_TOKEN_EXPIRY_MS = 1000 * 60 * 60 * 24; // 24 hours
const DEFAULT_RESET_TOKEN_EXPIRY_MS = 1000 * 60 * 60; // 1 hour

function getExpiry(type: VerificationTokenType) {
  return new Date(Date.now() + (type === 'password_reset' ? DEFAULT_RESET_TOKEN_EXPIRY_MS : DEFAULT_EMAIL_TOKEN_EXPIRY_MS));
}

export async function createVerificationToken(identifier: string, type: VerificationTokenType): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = getExpiry(type);

  await prisma.verificationToken.deleteMany({
    where: {
      identifier,
      type,
    },
  });

  await prisma.verificationToken.create({
    data: {
      identifier,
      token,
      type,
      expires,
    },
  });

  return token;
}

export async function consumeVerificationToken(token: string, type: VerificationTokenType) {
  const record = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!record || record.type !== type) {
    return { status: 'not_found', record: null };
  }

  if (record.expires < new Date()) {
    await prisma.verificationToken.delete({ where: { token } });
    return { status: 'expired', record: null };
  }

  await prisma.verificationToken.delete({ where: { token } });
  return { status: 'success', record };
}

