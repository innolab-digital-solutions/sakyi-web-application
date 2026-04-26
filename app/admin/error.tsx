'use client';

import { useEffect } from 'react';

import ErrorStatusPage from '@/components/shared/ErrorStatusPage';
import { ROUTES } from '@/config/routes';
import {
  getErrorPresentation,
  resolveStatusFromUnknownError,
} from '@/lib/errors/http-status';

type AdminErrorProps = {
  error: Error & { digest?: string };
  unstable_retry?: () => void;
  reset: () => void;
};

export default function AdminError({
  error,
  unstable_retry,
  reset,
}: AdminErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const status = resolveStatusFromUnknownError(error, 500);
  const presentation = getErrorPresentation(status);
  const retry = unstable_retry ?? reset;

  return (
    <ErrorStatusPage
      presentation={presentation}
      onRetry={retry}
      retryLabel='Try again'
      primaryHref={ROUTES.ADMIN.MODULES.OVERVIEW}
      primaryLabel='Back to overview'
      secondaryHref='/'
      secondaryLabel='Go to website'
    />
  );
}
