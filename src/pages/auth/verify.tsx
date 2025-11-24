import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';

import prisma from '@/lib/prisma';
import { consumeVerificationToken } from '@/lib/auth/tokens';

type VerifyPageProps = {
  status: 'success' | 'expired' | 'invalid';
};

export default function VerifyPage({ status }: VerifyPageProps) {
  return (
    <>
      <Head>
        <title>Email verification — API Sorter</title>
      </Head>
      <main className="container-max flex min-h-[60vh] flex-col items-center justify-center text-center">
        {status === 'success' && (
          <>
            <h1 className="text-3xl font-semibold text-white">Email verified</h1>
            <p className="mt-4 text-gray-300">Your account has been verified. You can now sign in.</p>
            <Link href="/auth/signin" className="btn btn-primary btn-lg mt-6">
              Go to sign in
            </Link>
          </>
        )}
        {status === 'expired' && (
          <>
            <h1 className="text-3xl font-semibold text-white">Verification link expired</h1>
            <p className="mt-4 text-gray-300">
              The verification link has expired. Please request a new verification email from the sign-in page.
            </p>
            <Link href="/auth/signin" className="btn btn-secondary btn-lg mt-6">
              Back to sign in
            </Link>
          </>
        )}
        {status === 'invalid' && (
          <>
            <h1 className="text-3xl font-semibold text-white">Invalid verification link</h1>
            <p className="mt-4 text-gray-300">We couldn&apos;t verify this link. It may have already been used.</p>
            <Link href="/auth/signin" className="btn btn-secondary btn-lg mt-6">
              Back to sign in
            </Link>
          </>
        )}
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<VerifyPageProps> = async (context) => {
  const token = context.query.token as string | undefined;
  const email = context.query.email as string | undefined;

  if (!token || !email) {
    return { props: { status: 'invalid' } };
  }

  const normalizedEmail = email.toLowerCase();

  const result = await consumeVerificationToken(token, 'email_verification');

  if (result.status === 'expired') {
    return { props: { status: 'expired' } };
  }

  if (result.status !== 'success' || result.record?.identifier !== normalizedEmail) {
    return { props: { status: 'invalid' } };
  }

  await prisma.user.update({
    where: { email: normalizedEmail },
    data: { emailVerified: new Date() },
  });

  return { props: { status: 'success' } };
};

