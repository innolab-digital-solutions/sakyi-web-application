import { PropsWithChildren } from 'react';

import { AuthProvider } from '@/context/AuthContext';

import RouteGuard from '../../../components/admin/layout/RouteGuard';

export default function AdminGuestLayout({ children }: PropsWithChildren) {
  return (
    <div className='min-h-screen'>
      <AuthProvider>
        <RouteGuard mode='guest'>{children}</RouteGuard>
      </AuthProvider>
    </div>
  );
}
