import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

const FROM_ADDRESS = process.env.EMAIL_FROM || 'API Sorter <updates@apisorter.com>';

function getBaseUrl() {
  return process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
}

export async function sendEmailVerification(email: string, token: string) {
  if (!resend) {
    console.warn('[email] RESEND_API_KEY not configured. Skipping verification email.');
    return;
  }

  const verifyUrl = `${getBaseUrl()}/auth/verify?token=${token}&email=${encodeURIComponent(email)}`;

  await resend.emails.send({
    from: FROM_ADDRESS,
    to: email,
    subject: 'Verify your API Sorter account',
    html: `
      <p>Hello,</p>
      <p>Please verify your API Sorter account by clicking the button below:</p>
      <p><a href="${verifyUrl}" style="padding: 12px 20px; background-color:#118ab2; color:#ffffff; text-decoration:none; border-radius:6px;">Verify Email</a></p>
      <p>If the button doesn't work, copy and paste this URL into your browser:</p>
      <p><a href="${verifyUrl}">${verifyUrl}</a></p>
      <p>This link will expire in 24 hours.</p>
      <p>— API Sorter Team</p>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  if (!resend) {
    console.warn('[email] RESEND_API_KEY not configured. Skipping reset email.');
    return;
  }

  const resetUrl = `${getBaseUrl()}/auth/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

  await resend.emails.send({
    from: FROM_ADDRESS,
    to: email,
    subject: 'Reset your API Sorter password',
    html: `
      <p>Hello,</p>
      <p>We received a request to reset your password. Click the button below to continue:</p>
      <p><a href="${resetUrl}" style="padding: 12px 20px; background-color:#118ab2; color:#ffffff; text-decoration:none; border-radius:6px;">Reset Password</a></p>
      <p>If you did not request this, you can safely ignore this email. This link will expire in 1 hour.</p>
      <p>— API Sorter Team</p>
    `,
  });
}

export async function sendClaimStatusNotification(email: string, providerName: string, status: 'APPROVED' | 'REJECTED') {
  if (!resend) {
    console.warn('[email] RESEND_API_KEY not configured. Skipping claim status email.');
    return;
  }

  const subject = status === 'APPROVED'
    ? `Claim Approved: ${providerName}`
    : `Update on your Claim for ${providerName}`;

  const message = status === 'APPROVED'
    ? `<p>Great news! Your claim for <strong>${providerName}</strong> has been approved.</p>
       <p>You now have management access to this provider on API Sorter. You can view your status in your profile.</p>`
    : `<p>We reviewed your claim for <strong>${providerName}</strong> and unfortunately could not verify it at this time.</p>
       <p>Please double check that you are using a work email address associated with the provider domain.</p>`;

  await resend.emails.send({
    from: FROM_ADDRESS,
    to: email,
    subject: subject,
    html: `
      <p>Hello,</p>
      ${message}
      <p>— API Sorter Team</p>
    `,
  });
}

export async function sendAdminClaimAlert(providerName: string, claimEmail: string, providerId: string) {
  if (!resend) return;

  const adminUrl = `${getBaseUrl()}/admin/claims`;

  await resend.emails.send({
    from: FROM_ADDRESS,
    to: process.env.ADMIN_EMAIL || 'admin@apisorter.com',
    subject: `[Admin] New Claim Request: ${providerName}`,
    html: `
        <h2>New Claim Request</h2>
        <p><strong>Provider:</strong> ${providerName}</p>
        <p><strong>Claimant:</strong> ${claimEmail}</p>
        <p>Please review this request in the admin panel.</p>
        <p><a href="${adminUrl}" style="padding: 10px 15px; background: #000; color: #fff; text-decoration: none; border-radius: 4px;">Review Claims</a></p>
      `
  });
}



