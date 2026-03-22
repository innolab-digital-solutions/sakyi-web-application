'use client';

import * as Sentry from '@sentry/nextjs';

import { getPublicSentryDsn } from './environment';

export type ClientErrorReportContext = {
  digest?: string;
  segment?: string;
};

/**
 * Client error boundaries and `global-error.tsx`: log in development and send
 * to Sentry when `NEXT_PUBLIC_SENTRY_DSN` is set.
 */
export const reportClientError = (
  error: unknown,
  context?: ClientErrorReportContext,
): void => {
  const payload = {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    ...context,
  };

  if (process.env.NODE_ENV === 'development') {
    console.error('[client-error]', payload);
  }

  if (!getPublicSentryDsn()) return;

  const err =
    error instanceof Error ? error : new Error(String(error), { cause: error });

  Sentry.captureException(err, {
    ...(context?.segment != null && context.segment !== ''
      ? { tags: { reporting_source: 'client-boundary', error_segment: context.segment } }
      : { tags: { reporting_source: 'client-boundary' } }),
    extra: {
      digest: context?.digest,
      segment: context?.segment,
    },
  });
};
