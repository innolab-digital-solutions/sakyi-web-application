import type { Metadata } from 'next';

import ResetPasswordSuccessContent from '@/components/auth/reset-password/ResetPasswordSuccessContent';

export const metadata: Metadata = {
  title: 'Password Reset Complete · SaKyi Health & Wellness',
  description:
    'Your password was updated successfully. Continue to sign in with the new password.',
};

export default function ResetPasswordSuccessPage() {
  return <ResetPasswordSuccessContent />;
}
