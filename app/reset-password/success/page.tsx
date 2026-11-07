import type { Metadata } from 'next';

import ResetPasswordSuccessContent from '@/components/auth/reset-password/ResetPasswordSuccessContent';
import { NOINDEX_ROBOTS } from '@/lib/seo/metadata';

export const metadata: Metadata = {
  title: 'Password Reset Complete · SaKyi Health & Wellness',
  description:
    'Your password was updated successfully. Continue to sign in with the new password.',
  robots: NOINDEX_ROBOTS,
};

export default function ResetPasswordSuccessPage() {
  return <ResetPasswordSuccessContent />;
}
