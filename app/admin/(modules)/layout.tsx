import { Inter } from 'next/font/google';
import { cookies } from 'next/headers';
import { PropsWithChildren } from 'react';

import AuthGuard from '@/components/admin/auth/AuthGuard';
import DashboardHeader from '@/components/admin/layouts/DashboardHeader';
import DashboardSidebar from '@/components/admin/layouts/DashboardSidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import AuthProvider from '@/context/AuthContext';
import { cn } from '@/lib/browser/styles';

const inter = Inter({
  variable: '--font-inter',
  weight: ['400', '500', '600', '700', '800', '900'],
});

export default async function AdminProtectedLayout({
  children,
}: PropsWithChildren) {
  const cookie = await cookies();
  const defaultOpen = cookie.get('sidebar_state')?.value === 'true';

  return (
    <div className={cn('min-h-screen', inter.variable)}>
      <AuthProvider>
        <AuthGuard mode='protected'>
          <SidebarProvider defaultOpen={defaultOpen}>
            {/* Sidebar navigation panel */}
            <DashboardSidebar />

            {/* Main content: dashboard header & page */}
            <SidebarInset className='min-w-0'>
              <DashboardHeader />
              {/* Page content*/}
              <div className='bg-background flex-1 flex-col p-4 md:p-6'>
                {children}
              </div>
            </SidebarInset>
          </SidebarProvider>
        </AuthGuard>
      </AuthProvider>
    </div>
  );
}
