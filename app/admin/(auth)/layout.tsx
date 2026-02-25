import { cn } from '@/lib/utils/common';
import { Inter } from 'next/font/google';
import { PropsWithChildren } from 'react';
import AuthProvider from '@/context/AuthContext';
import AuthGuard from '@/components/admin/auth/AuthGuard';

const inter = Inter({
  variable: '--font-inter',
  weight: ['400', '500', '600', '700', '800', '900'],
});

export default function AdminUnprotectedLayout({
  children,
}: PropsWithChildren) {
  return (
    <div className={cn('min-h-screen', inter.variable)}>
      <AuthProvider>
        <AuthGuard mode="guest">{children}</AuthGuard>
      </AuthProvider>
    </div>
  );
}
