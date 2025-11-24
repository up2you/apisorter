import type { NextApiRequest, NextApiResponse } from 'next';

import { runLinkChecker } from '@/lib/linkChecker';

const validateSecret = (req: NextApiRequest) => {
  const secret = process.env.CRON_SECRET_TOKEN;
  if (!secret) return true;

  const headerToken = req.headers['x-cron-secret'] ?? req.headers.authorization;

  if (Array.isArray(headerToken)) {
    return headerToken.includes(secret) || headerToken.includes(`Bearer ${secret}`);
  }

  if (!headerToken) return false;

  if (headerToken === secret) return true;
  if (headerToken === `Bearer ${secret}`) return true;

  return false;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!validateSecret(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const results = await runLinkChecker({ sendNotifications: true });
    return res.status(200).json({
      message: 'Link checker complete',
      processed: results.length,
      summary: results,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[cron/check-links] failed', error);
    return res.status(500).json({ error: message });
  }
}
