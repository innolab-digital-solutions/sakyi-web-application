'use client';

/**
 * Client-only Sentry reporters. Import from here in Client Components and hooks
 * so `'use client'` stays at one boundary.
 */
export { reportNotableApiClientError } from './report-api-client-error';
export {
  type ClientErrorReportContext,
  reportClientError,
} from './report-client-error';
