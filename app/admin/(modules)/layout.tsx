import { cn } from '@/lib/utils/common';
import { Inter } from 'next/font/google';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import DashboardSidebar from '@/components/admin/layouts/DashboardSidebar';
import DashboardHeader from '@/components/admin/layouts/DashboardHeader';
import { cookies } from 'next/headers';
import { PropsWithChildren } from 'react';
import AuthProvider from '@/context/AuthContext';
import AuthGuard from '@/components/admin/auth/AuthGuard';

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
        <AuthGuard mode="protected">
          <SidebarProvider defaultOpen={defaultOpen}>
            {/* Sidebar navigation panel */}
            <DashboardSidebar />

            {/* Main content: dashboard header & page */}
            <SidebarInset>
              <DashboardHeader />
              {/* Page content*/}
              <div className="bg-background flex-1 flex-col px-8 py-5">
                {children}
              </div>
            </SidebarInset>
          </SidebarProvider>
        </AuthGuard>
      </AuthProvider>
    </div>
  );
}
