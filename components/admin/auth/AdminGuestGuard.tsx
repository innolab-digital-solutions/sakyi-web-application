'use client';

import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PATHS } from '@/config/paths';
import { useAuth } from '@/context/AuthContext';

/**
 * Ensures that admin auth routes (e.g. login) are only accessible
 * to unauthenticated users.
 *
 * - While auth is being checked, shows a lightweight loading state.
 * - If the user is authenticated, redirects to the admin dashboard.
 * - If the user is unauthenticated, renders the children (login UI).
 */
const AdminGuestGuard = ({ children }: PropsWithChildren) => {
  const router = useRouter();
  const { isReady, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isReady) return;

    if (isAuthenticated) {
      router.replace(PATHS.ADMIN.DASHBOARD);
    }
  }, [isReady, isAuthenticated, router]);

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="animate-pulse text-sm text-muted-foreground">
          Checking authentication...
        </span>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="animate-pulse text-sm text-muted-foreground">
          Redirecting to dashboard...
        </span>
      </div>
    );
  }

  return children;
};

export default AdminGuestGuard;

