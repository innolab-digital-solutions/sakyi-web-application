'use client';

import * as Sentry from '@sentry/nextjs';
import { isCancelledError } from '@tanstack/react-query';

import { ApiClientError } from '@/lib/api/client/errors';

import { getPublicSentryDsn } from './environment';
import { shouldReportHttpStatusForBudget } from './http-error-budget';

const isNotableApiClientError = (error: ApiClientError): boolean =>
  shouldReportHttpStatusForBudget(error.status);

/**
 * Thrown `ApiClientError` instances (e.g. React Query `queryFn`, `catch` blocks)
 * and other `Error` values from client-side async flows. Skips cancelled queries
 * and HTTP statuses filtered by the error budget.
 */
export const reportNotableApiClientError = (error: unknown): void => {
  if (process.env.NODE_ENV === 'test') return;
  if (!getPublicSentryDsn()) return;
  if (isCancelledError(error)) return;

  if (error instanceof ApiClientError) {
    if (!isNotableApiClientError(error)) return;
    Sentry.captureException(error, {
      tags: { reporting_source: 'query-cache' },
      extra: {
        httpStatus: error.status,
        requestId: error.requestId,
      },
    });
    return;
  }

  if (error instanceof Error) {
    Sentry.captureException(error, {
      tags: { reporting_source: 'query-cache' },
    });
  }
};
