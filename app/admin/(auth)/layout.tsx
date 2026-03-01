import { PropsWithChildren } from 'react';

import AuthGuard from '@/components/admin/auth/AuthGuard';
import { inter } from '@/config/fonts';
import AuthProvider from '@/context/AuthContext';
import { cn } from '@/lib/browser/styles';

export default function AdminGuestLayout({ children }: PropsWithChildren) {
  return (
    <div className={cn('min-h-screen', inter.variable)}>
      <AuthProvider>
        <AuthGuard mode='guest'>{children}</AuthGuard>
      </AuthProvider>
    </div>
  );
}
