import { PropsWithChildren } from 'react';

import AuthGuard from '@/components/admin/AuthGuard';
import AuthProvider from '@/context/AuthContext';

export default function AdminGuestLayout({ children }: PropsWithChildren) {
  return (
    <div className='min-h-screen'>
      <AuthProvider>
        <AuthGuard mode='guest'>{children}</AuthGuard>
      </AuthProvider>
    </div>
  );
}
