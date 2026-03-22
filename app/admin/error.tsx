'use client';

import Link from 'next/link';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/config/routes';
import { reportClientError } from '@/lib/sentry/client';

type AdminErrorProps = {
  error: Error & { digest?: string };
  unstable_retry: () => void;
};

export default function AdminError({ error, unstable_retry }: AdminErrorProps) {
  useEffect(() => {
    reportClientError(error, { digest: error.digest, segment: 'admin' });
  }, [error]);

  return (
    <div className='flex min-h-[40vh] flex-col items-center justify-center gap-6 px-4 py-12'>
      <div className='max-w-md space-y-2 text-center'>
        <h1 className='text-foreground text-lg font-semibold'>
          Admin area error
        </h1>
        <p className='text-muted-foreground text-sm'>
          This section hit an unexpected error. Try again or go back to the
          dashboard.
        </p>
      </div>
      <div className='flex flex-wrap justify-center gap-3'>
        <Button type='button' onClick={() => unstable_retry()}>
          Try again
        </Button>
        <Button asChild variant='outline'>
          <Link href={ROUTES.ADMIN.MODULES.OVERVIEW}>Overview</Link>
        </Button>
      </div>
    </div>
  );
}
