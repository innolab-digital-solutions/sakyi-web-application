'use client';

import { useRouter } from 'next/navigation';
import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';

import { Spinner } from '@/components/ui/spinner';
import { ROUTES } from '@/config/routes';
import { useAuth } from '@/context/AuthContext';

type RouteGuardMode = 'guest' | 'protected';

type RouteGuardProps = PropsWithChildren<{
  mode: RouteGuardMode;
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

const RouteGuard = ({ mode, children }: RouteGuardProps) => {
  const router = useRouter();
  const { hasInitialized, user } = useAuth();

  useEffect(() => {
    if (!hasInitialized) return;

    if (mode === 'guest' && user) {
      router.replace(ROUTES.ADMIN.MODULES.OVERVIEW);
      return;
    }

    if (mode === 'protected' && !user) {
      router.replace(ROUTES.ADMIN.AUTH.LOGIN);
    }
  }, [hasInitialized, user, mode, router]);

  if (!hasInitialized) {
    return <AuthStatusScreen variant='checking' />;
  }

  if (mode === 'guest' && user) {
    return <AuthStatusScreen variant='redirect-dashboard' />;
  }

  if (mode === 'protected' && !user) {
    return <AuthStatusScreen variant='redirect-login' />;
  }

  return children;
};

export default RouteGuard;
