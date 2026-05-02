'use client';

import { useEffect } from 'react';

import ErrorStatusPage from '@/components/shared/ErrorStatusPage';
import { ROUTES } from '@/config/routes';
import {
  getErrorPresentation,
  resolveStatusFromUnknownError,
} from '@/lib/errors/http-status';

type GlobalErrorProps = {
  error: Error & { digest?: string };
  unstable_retry?: () => void;
  reset: () => void;
};

/**
 * Catches errors in the root layout. Must include `html` and `body`.
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/error
 */
export default function GlobalError({
  error,
  unstable_retry,
  reset,
}: GlobalErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const status = resolveStatusFromUnknownError(error, 500);
  const presentation = getErrorPresentation(status);
  const retry = unstable_retry ?? reset;

  return (
    <html lang='en'>
      <body className='font-sans antialiased'>
        <ErrorStatusPage
          presentation={presentation}
          primary={{
            kind: 'button',
            onClick: retry,
            label: 'Try again',
          }}
          outline={{
            kind: 'link',
            href: ROUTES.MARKETING.HOME,
            label: 'Go home',
          }}
        />
      </body>
    </html>
  );
}
