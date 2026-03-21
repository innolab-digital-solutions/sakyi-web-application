'use client';

import { useEffect } from 'react';

import { reportClientError } from '@/lib/observability/report-client-error';

type GlobalErrorProps = {
  error: Error & { digest?: string };
  unstable_retry: () => void;
};

/**
 * Catches errors in the root layout. Must include `html` and `body`.
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/error
 */
export default function GlobalError({
  error,
  unstable_retry,
}: GlobalErrorProps) {
  useEffect(() => {
    reportClientError(error, { digest: error.digest, segment: 'global' });
  }, [error]);

  return (
    <html lang='en'>
      <body className='font-sans antialiased'>
        <div className='flex min-h-screen flex-col items-center justify-center gap-4 px-4'>
          <h1 className='text-xl font-semibold'>Something went wrong</h1>
          <button
            type='button'
            className='rounded-md border px-4 py-2 text-sm'
            onClick={() => unstable_retry()}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
