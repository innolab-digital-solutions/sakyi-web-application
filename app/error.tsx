'use client';

import Link from 'next/link';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { reportClientError } from '@/lib/sentry/client';

type AppErrorProps = {
  error: Error & { digest?: string };
  unstable_retry: () => void;
};

export default function AppError({ error, unstable_retry }: AppErrorProps) {
  useEffect(() => {
    reportClientError(error, { digest: error.digest, segment: 'app' });
  }, [error]);

  return (
    <div className='bg-background flex min-h-[50vh] flex-col items-center justify-center gap-6 px-4 py-16'>
      <div className='max-w-md space-y-2 text-center'>
        <h1 className='text-foreground text-2xl font-semibold'>
          Something went wrong
        </h1>
        <p className='text-muted-foreground text-sm'>
          An unexpected error occurred. You can try again or return to the home
          page.
        </p>
        {error.digest ? (
          <p className='text-muted-foreground font-mono text-xs'>
            Reference: {error.digest}
          </p>
        ) : null}
      </div>
      <div className='flex flex-wrap items-center justify-center gap-3'>
        <Button type='button' onClick={() => unstable_retry()}>
          Try again
        </Button>
        <Button asChild variant='outline'>
          <Link href='/'>Home</Link>
        </Button>
      </div>
    </div>
  );
}
