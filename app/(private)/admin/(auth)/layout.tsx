import { cn } from '@/lib/utils/common';
import { Inter } from 'next/font/google';
import { PropsWithChildren } from 'react';
import AuthProvider from '@/context/AuthContext';
import AdminGuestGuard from '@/components/admin/auth/AdminGuestGuard';

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
        <AdminGuestGuard>{children}</AdminGuestGuard>
      </AuthProvider>
    </div>
  );
}
