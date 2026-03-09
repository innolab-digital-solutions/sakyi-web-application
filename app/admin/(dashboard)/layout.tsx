import { cookies } from 'next/headers';
import { PropsWithChildren } from 'react';

import AuthGuard from '@/components/admin/AuthGuard';
import DashboardHeader from '@/components/admin/layout/DashboardHeader';
import DashboardSidebar from '@/components/admin/layout/DashboardSidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import AuthProvider from '@/context/AuthContext';

export default async function AdminProtectedLayout({
  children,
}: PropsWithChildren) {
  const cookie = await cookies();
  const defaultOpen = cookie.get('sidebar_state')?.value === 'true';

  return (
    <div className='min-h-screen'>
      <AuthProvider>
        <AuthGuard mode='protected'>
          <SidebarProvider defaultOpen={defaultOpen}>
            <DashboardSidebar />

            <SidebarInset className='min-w-0'>
              <DashboardHeader />
              <div className='bg-background flex flex-1 flex-col p-4 md:p-6'>
                {children}
              </div>
            </SidebarInset>
          </SidebarProvider>
        </AuthGuard>
      </AuthProvider>
    </div>
  );
}
