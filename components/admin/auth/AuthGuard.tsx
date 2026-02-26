'use client';

import { useRouter } from 'next/navigation';
import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';

import { Spinner } from '@/components/ui/spinner';
import PATHS from '@/config/paths';
import { useAuth } from '@/context/AuthContext';

type AuthGuardMode = 'guest' | 'protected';

type AuthGuardProps = PropsWithChildren<{
  mode: AuthGuardMode;
}>;

type AuthStatusVariant = 'checking' | 'redirect-dashboard' | 'redirect-login';

interface AuthStatusContent {
  title: string;
  description: string;
  pill: string;
}

const getStatusContent = (variant: AuthStatusVariant): AuthStatusContent => {
  switch (variant) {
    case 'redirect-dashboard':
      return {
        title: 'You are already signed in',
        description: 'Redirecting you to your dashboard.',
        pill: 'Redirecting to dashboard',
      };
    case 'redirect-login':
      return {
        title: 'Session not found',
        description: 'Redirecting you to the sign-in page.',
        pill: 'Redirecting to login',
      };
    case 'checking':
    default:
      return {
        title: 'Checking your sign-in status',
        description: 'Please wait while we verify your access.',
        pill: 'Checking status',
      };
  }
};

const AuthStatusScreen = ({ variant }: { variant: AuthStatusVariant }) => {
  const { title, description, pill } = getStatusContent(variant);

  return (
    <div className='flex min-h-screen flex-col items-center justify-center gap-4 px-4'>
      <Spinner className='size-6' />

      <div className='space-y-1 text-center'>
        <p className='text-sm font-semibold text-foreground'>{title}</p>
        <p className='text-xs text-muted-foreground'>{description}</p>
      </div>

      <p className='text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground'>
        {pill}
      </p>
    </div>
  );
};

/**
 * Generic auth route guard.
 *
 * - `mode="guest"`:
 *    - Only unauthenticated users can see the children (e.g. login page).
 *    - Authenticated users are redirected to the admin dashboard.
 *
 * - `mode="protected"`:
 *    - Only authenticated users can see the children (e.g. dashboard).
 *    - Unauthenticated users are redirected to the admin login page.
 *
 * In both modes:
 *  - While auth is being resolved, a branded full-screen loading state is shown.
 */
const AuthGuard = ({ mode, children }: AuthGuardProps) => {
  const router = useRouter();
  const { isReady, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isReady) return;

    if (mode === 'guest' && isAuthenticated) {
      router.replace(PATHS.ADMIN.DASHBOARD);
      return;
    }

    if (mode === 'protected' && !isAuthenticated) {
      router.replace(PATHS.ADMIN.LOGIN);
    }
  }, [isReady, isAuthenticated, mode, router]);

  if (!isReady) {
    return <AuthStatusScreen variant='checking' />;
  }

  if (mode === 'guest' && isAuthenticated) {
    return <AuthStatusScreen variant='redirect-dashboard' />;
  }

  if (mode === 'protected' && !isAuthenticated) {
    return <AuthStatusScreen variant='redirect-login' />;
  }

  return children;
};

export default AuthGuard;
