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
      primary={{
        kind: 'button',
        onClick: retry,
        label: 'Try again',
      }}
      outline={{
        kind: 'link',
        href: ROUTES.ADMIN.MODULES.OVERVIEW,
        label: 'Back to overview',
      }}
    />
  );
}
