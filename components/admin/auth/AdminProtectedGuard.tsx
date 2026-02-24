'use client';

import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PATHS } from '@/config/paths';
import { useAuth } from '@/context/AuthContext';

/**
 * Ensures that protected admin routes are only accessible to authenticated users.
 *
 * - While auth is being checked, shows a loading state.
 * - If the user is unauthenticated, redirects to the admin login route.
 * - If the user is authenticated, renders the children (dashboard UI).
 */
const AdminProtectedGuard = ({ children }: PropsWithChildren) => {
  const router = useRouter();
  const { isReady, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isReady) return;

    if (!isAuthenticated) {
      router.replace(PATHS.ADMIN.LOGIN);
    }
  }, [isReady, isAuthenticated, router]);

  if (!isReady || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="text-muted-foreground animate-pulse text-sm">
          Checking authentication...
        </span>
      </div>
    );
  }

  return children;
};

export default AdminProtectedGuard;

