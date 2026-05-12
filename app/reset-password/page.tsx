import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import ResetPasswordPanel from '@/components/auth/reset-password/ResetPasswordPanel';
import { ResetPasswordSurface } from '@/components/auth/reset-password/ResetPasswordSurface';

export const metadata: Metadata = {
  title: 'Reset password · SaKyi Health & Wellness',
  description:
    'Set a new password using the secure link from your email, then sign in again.',
};

function firstQueryString(
  value: string | string[] | undefined,
): string | undefined {
  if (typeof value === 'string' && value.length > 0) return value;
  const first = Array.isArray(value) ? value[0] : undefined;
  return typeof first === 'string' && first.length > 0 ? first : undefined;
}

function decodeEmailQuery(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function isLikelyResetToken(token: string): boolean {
  return /^[a-fA-F0-9]{64}$/.test(token);
}

function isLikelyEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

type ResetPasswordPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const query = await searchParams;
  const rawToken = firstQueryString(query.token);
  const rawEmail = firstQueryString(query.email);
  const email = rawEmail ? decodeEmailQuery(rawEmail.trim()) : '';
  const token = rawToken ?? '';

  if (!isLikelyResetToken(token) || !isLikelyEmail(email)) {
    notFound();
  }

  return (
    <main className='bg-background relative flex min-h-screen items-center justify-center p-5'>
      <div className='relative z-10 mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-4 py-16 sm:px-6'>
        <ResetPasswordSurface>
          <ResetPasswordPanel token={token} email={email} />
        </ResetPasswordSurface>
      </div>
    </main>
  );
}
