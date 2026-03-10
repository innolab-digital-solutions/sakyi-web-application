import { cookies } from 'next/headers';
import { PropsWithChildren } from 'react';

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AuthProvider } from '@/context/AuthContext';

import DashboardHeader from '../_components/DashboardHeader';
import DashboardSidebar from '../_components/DashboardSidebar';
import RouteGuard from '../_components/RouteGuard';

export default async function AdminProtectedLayout({
  children,
}: PropsWithChildren) {
  const cookie = await cookies();
  const defaultOpen = cookie.get('sidebar_state')?.value === 'true';

  return (
    <div className='min-h-screen'>
      <AuthProvider>
        <RouteGuard mode='protected'>
          <SidebarProvider defaultOpen={defaultOpen}>
            <DashboardSidebar />

            <SidebarInset className='min-w-0'>
              <DashboardHeader />
              <div className='bg-background flex flex-1 flex-col p-4 md:p-6'>
                {children}
              </div>
            </SidebarInset>
          </SidebarProvider>
        </RouteGuard>
      </AuthProvider>
    </div>
  );
}
