'use client';

import { CheckCircle2, Smartphone } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/config/routes';

import {
  RESET_PASSWORD_SUCCESS_MARKER_KEY,
  RESET_PASSWORD_SUCCESS_MARKER_MAX_AGE_MS,
} from './constants';
import { ResetPasswordSurface } from './ResetPasswordSurface';

export default function ResetPasswordSuccessContent() {
  const router = useRouter();
  const [isAllowed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;

    const raw = sessionStorage.getItem(RESET_PASSWORD_SUCCESS_MARKER_KEY);
    if (!raw) return false;

    const timestamp = Number(raw);
    const isValid =
      Number.isFinite(timestamp) &&
      Date.now() - timestamp <= RESET_PASSWORD_SUCCESS_MARKER_MAX_AGE_MS;

    sessionStorage.removeItem(RESET_PASSWORD_SUCCESS_MARKER_KEY);
    return isValid;
  });

  const mobileAppDeepLink = useMemo(
    () => process.env.NEXT_PUBLIC_MOBILE_APP_DEEP_LINK?.trim() ?? '',
    [],
  );

  useEffect(() => {
    if (!isAllowed) {
      router.replace('/error-status/404');
    }
  }, [isAllowed, router]);

  if (!isAllowed) return null;

  return (
    <main className='bg-background relative flex min-h-screen items-center justify-center p-5'>
      <div className='relative z-10 mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-4 py-16 sm:px-6'>
        <ResetPasswordSurface>
          <section className='flex flex-col items-center gap-6 text-center'>
            <div className='bg-primary/12 text-primary flex size-14 items-center justify-center rounded-full'>
              <CheckCircle2 className='size-7' aria-hidden />
            </div>

            <div className='space-y-2'>
              <h1 className='text-foreground text-xl font-bold tracking-tight sm:text-2xl'>
                Password updated
              </h1>
              <p className='text-muted-foreground text-sm leading-relaxed'>
                Your password has been reset successfully. You can now sign in
                using your new password.
              </p>
            </div>

            <Button
              asChild
              size='lg'
              className='from-primary to-accent hover:from-primary/90 hover:to-accent/90 h-11 w-full bg-linear-to-r font-semibold normal-case text-white'
            >
              <Link href={ROUTES.ADMIN.AUTH.LOGIN}>Continue to sign in</Link>
            </Button>

            {mobileAppDeepLink ? (
              <Button
                asChild
                size='lg'
                variant='outline'
                className='h-11 w-full font-semibold normal-case'
              >
                <Link href={mobileAppDeepLink}>
                  <Smartphone className='size-4' />
                  Open mobile app
                </Link>
              </Button>
            ) : null}
          </section>
        </ResetPasswordSurface>
      </div>
    </main>
  );
}
