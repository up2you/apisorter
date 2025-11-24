import crypto from 'crypto';

import axios from 'axios';
import { ApiSource, ApiStatus, Prisma } from '@prisma/client';

import prisma from '@/lib/prisma';

type LinkCheckOptions = {
  sendNotifications?: boolean;
  notificationEmails?: string[];
};

type LinkCheckResult = {
  apiId: string;
  name: string;
  status: 'ok' | 'hash_changed' | 'redirected' | 'error';
  previousUrl?: string;
  newUrl?: string;
  previousHash?: string | null;
  newHash?: string | null;
  message?: string;
  error?: string;
};

const buildAdminRecipients = (custom?: string[]): string[] => {
  if (custom?.length) {
    return custom;
  }

  const fromEnv = process.env.UPDATE_NOTIFICATION_RECIPIENTS;
  if (fromEnv) {
    return fromEnv.split(',').map((item) => item.trim()).filter(Boolean);
  }

  if (process.env.ADMIN_ALERT_EMAIL) {
    return [process.env.ADMIN_ALERT_EMAIL];
  }

  return [];
};

const getResendClient = async () => {
  const { Resend } = await import('resend');
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY not configured');
  }
  return new Resend(apiKey);
};

const formatNotificationHtml = (payload: LinkCheckResult) => {
  if (payload.status === 'error') {
    return `<p>Failed to verify <b>${payload.name}</b>. Error: ${payload.error ?? 'unknown'}.</p>`;
  }

  const changes: string[] = [];
  if (payload.previousUrl && payload.newUrl && payload.previousUrl !== payload.newUrl) {
    changes.push(`<li>Docs URL changed: <code>${payload.previousUrl}</code> → <code>${payload.newUrl}</code></li>`);
  }
  if (payload.previousHash !== payload.newHash) {
    changes.push('<li>Documentation content hash has changed.</li>');
  }

  const changeList = changes.length ? `<ul>${changes.join('')}</ul>` : '<p>No further details.</p>';

  return `<p>API <b>${payload.name}</b> reported status <b>${payload.status}</b>.</p>${changeList}`;
};

export async function runLinkChecker(options: LinkCheckOptions = {}): Promise<LinkCheckResult[]> {
  const results: LinkCheckResult[] = [];
  const sendNotifications = options.sendNotifications ?? true;
  const recipients = buildAdminRecipients(options.notificationEmails);

  const resendClient = sendNotifications && recipients.length
    ? await getResendClient().catch((error) => {
      console.warn('Resend client not initialised', error.message);
      return null;
    })
    : null;

  const apis = await prisma.api.findMany({
    where: {
      status: { not: ApiStatus.INACTIVE },
    },
  });

  for (const api of apis) {
    const start = Date.now();
    let currentUrl = api.docsUrl;
    let status: LinkCheckResult['status'] = 'ok';

    try {
      const headResponse = await axios.head(currentUrl, {
        timeout: 20000,
        maxRedirects: 5,
        validateStatus: () => true,
      });

      const finalUrl = (headResponse.request as any)?.res?.responseUrl || currentUrl;
      const verified = headResponse.status < 400;
      const updates: Record<string, unknown> = {
        verified,
        status: verified ? ApiStatus.ACTIVE : ApiStatus.BROKEN,
        lastCheckedAt: new Date(),
        responseTimeMs: Date.now() - start,
      };

      if (finalUrl && finalUrl !== currentUrl) {
        updates.docsUrl = finalUrl;
        currentUrl = finalUrl;
        status = 'redirected';
      }

      if (!verified) {
        await prisma.api.update({ where: { id: api.id }, data: updates });
        const payload: LinkCheckResult = {
          apiId: api.id,
          name: api.name,
          status: 'error',
          previousUrl: api.docsUrl,
          newUrl: currentUrl,
          error: `HEAD request returned status ${headResponse.status}`,
        };

        results.push(payload);

        if (resendClient) {
          await resendClient.emails.send({
            from: 'updates@apisorter.com',
            to: recipients,
            subject: `[API Sorter] ${api.name} verification failed`,
            html: formatNotificationHtml(payload),
          });
        }
        continue;
      }

      const getResponse = await axios.get<string>(currentUrl, {
        timeout: 30000,
        maxRedirects: 5,
        responseType: 'text',
        validateStatus: () => true,
      });

      const hash = crypto.createHash('sha256').update(getResponse.data || '').digest('hex');

      if (hash !== api.lastHash) {
        status = 'hash_changed';
        updates.lastHash = hash;

        await prisma.pricingHistory.create({
          data: {
            apiId: api.id,
            previousHash: api.lastHash,
            newHash: hash,
            snapshot: {
              url: currentUrl,
              capturedAt: new Date().toISOString(),
            },
            diff: Prisma.DbNull,
            changedSource: ApiSource.CRAWLED,
          },
        });
      }

      await prisma.api.update({ where: { id: api.id }, data: updates });

      const payload: LinkCheckResult = {
        apiId: api.id,
        name: api.name,
        status,
        previousUrl: api.docsUrl,
        newUrl: currentUrl,
        previousHash: api.lastHash,
        newHash: hash,
      };
      results.push(payload);

      if (resendClient && status !== 'ok') {
        await resendClient.emails.send({
          from: 'updates@apisorter.com',
          to: recipients,
          subject: `[API Sorter] ${api.name} documentation updated`,
          html: formatNotificationHtml(payload),
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';

      await prisma.api.update({
        where: { id: api.id },
        data: {
          verified: false,
          status: ApiStatus.BROKEN,
          lastCheckedAt: new Date(),
        },
      });

      const payload: LinkCheckResult = {
        apiId: api.id,
        name: api.name,
        status: 'error',
        previousUrl: api.docsUrl,
        error: message,
      };
      results.push(payload);

      if (resendClient) {
        await resendClient.emails.send({
          from: 'updates@apisorter.com',
          to: recipients,
          subject: `[API Sorter] ${api.name} check failed`,
          html: formatNotificationHtml(payload),
        });
      }
    }
  }

  return results;
}





