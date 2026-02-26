'use client';

import Image from 'next/image';
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
        description: 'Taking you back to the admin dashboard.',
        pill: 'Redirecting to dashboard',
      };
    case 'redirect-login':
      return {
        title: 'Session not found',
        description: 'We need you to sign in again to continue.',
        pill: 'Redirecting to login',
      };
    case 'checking':
    default:
      return {
        title: 'Checking your session',
        description:
          'Please wait a moment while we securely verify your access.',
        pill: 'Secure auth check',
      };
  }
};

const AuthStatusScreen = ({ variant }: { variant: AuthStatusVariant }) => {
  const { title, description, pill } = getStatusContent(variant);

  return (
    <div className='bg-background relative flex min-h-screen items-center justify-center overflow-hidden'>
      {/* Soft brand gradient backdrop */}
      <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(53,190,197,0.16),transparent_55%),radial-gradient(circle_at_bottom,rgba(12,150,196,0.16),transparent_55%)]' />

      <div className='relative z-10 w-full max-w-sm px-4'>
        <div className='bg-card/80 border-border relative overflow-hidden rounded-2xl border shadow-xl shadow-black/5 backdrop-blur-xl'>
          {/* Top accent bar */}
          <div className='bg-brand-gradient h-1.5 w-full' />

          <div className='space-y-6 px-6 pt-5 pb-6'>
            {/* Brand and title */}
            <div className='flex items-center justify-between gap-3'>
              <div className='flex items-center gap-3'>
                <div className='bg-primary/10 flex h-11 w-11 items-center justify-center rounded-xl'>
                  <Image
                    src='/images/logo.png'
                    alt='SaKyi Health & Wellness Logo'
                    width={32}
                    height={32}
                    className='rounded-md object-contain'
                    priority
                  />
                </div>
                <div className='space-y-0.5'>
                  <p className='text-muted-foreground text-xs font-semibold tracking-[0.18em] uppercase'>
                    Sakyi Admin
                  </p>
                  <p className='text-foreground text-sm font-semibold'>
                    Secure Access Check
                  </p>
                </div>
              </div>

              <div className='bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-full'>
                <Spinner className='size-4' />
              </div>
            </div>

            {/* Status content */}
            <div className='space-y-2'>
              <p className='text-foreground text-sm font-semibold'>{title}</p>
              <p className='text-muted-foreground text-xs leading-relaxed'>
                {description}
              </p>
            </div>

            {/* Bottom pill + subtle activity indicator */}
            <div className='flex items-center justify-between gap-3'>
              <div className='bg-secondary/70 text-secondary-foreground inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-semibold tracking-[0.18em] uppercase'>
                <span className='bg-primary inline-block h-1.5 w-1.5 animate-pulse rounded-full' />
                <span>{pill}</span>
              </div>
              <div className='text-muted-foreground flex items-center gap-1.5 text-[10px] font-medium'>
                <span className='bg-primary/50 h-1 w-1 rounded-full' />
                <span className='bg-primary/40 animation-delay-150 h-1 w-1 animate-pulse rounded-full' />
                <span className='bg-primary/30 animation-delay-300 h-1 w-1 animate-pulse rounded-full' />
              </div>
            </div>
          </div>
        </div>
      </div>
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
