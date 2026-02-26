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
        <p className='text-foreground text-sm font-semibold'>{title}</p>
        <p className='text-muted-foreground text-xs'>{description}</p>
      </div>

      <p className='text-muted-foreground text-[10px] font-medium tracking-[0.18em] uppercase'>
        {pill}
      </p>
    </div>
  );
};

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
