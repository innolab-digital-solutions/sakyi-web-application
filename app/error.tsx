'use client';

import { useEffect } from 'react';

import ErrorStatusPage from '@/components/shared/ErrorStatusPage';
import {
  getErrorPresentation,
  resolveStatusFromUnknownError,
} from '@/lib/errors/http-status';

type AppErrorProps = {
  error: Error & { digest?: string };
  unstable_retry?: () => void;
  reset: () => void;
};

export default function AppError({
  error,
  unstable_retry,
  reset,
}: AppErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const status = resolveStatusFromUnknownError(error, 500);
  const presentation = getErrorPresentation(status);
  const retry = unstable_retry ?? reset;

  return (
    <ErrorStatusPage
      presentation={presentation}
      note={
        error.digest ? (
          <span className='font-mono'>Reference ID: {error.digest}</span>
        ) : null
      }
      onRetry={retry}
      retryLabel='Try again'
    />
  );
}
