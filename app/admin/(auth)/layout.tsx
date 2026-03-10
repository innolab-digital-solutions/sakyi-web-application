import { PropsWithChildren } from 'react';

import { AuthProvider } from '@/context/AuthContext';

import RouteGuard from '../_components/RouteGuard';

export default function AdminGuestLayout({ children }: PropsWithChildren) {
  return (
    <div className='min-h-screen'>
      <AuthProvider>
        <RouteGuard mode='guest'>{children}</RouteGuard>
      </AuthProvider>
    </div>
  );
}
