'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/config/routes';

type AdminErrorProps = {
  reset: () => void;
};

export default function AdminError({ reset }: AdminErrorProps) {
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
        <Button type='button' onClick={() => reset()}>
          Try again
        </Button>
        <Button asChild variant='outline'>
          <Link href={ROUTES.ADMIN.MODULES.OVERVIEW}>Overview</Link>
        </Button>
      </div>
    </div>
  );
}
