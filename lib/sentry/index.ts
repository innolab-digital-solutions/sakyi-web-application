/**
 * Server- and edge-safe Sentry configuration (sampling, DSN readers).
 *
 * Client reporters: import from `@/lib/sentry/client` (or the underlying
 * `report-*.ts` modules) so Server Components never pull `'use client'` code
 * through this barrel.
 */
export type { SentryDeploymentTier } from './environment';
export {
  getPublicSentryDsn,
  getSentryDeploymentTier,
  getSentryEnableLogs,
  getSentryEnvironment,
  getSentryRelease,
  getSentryReplayOnErrorSampleRate,
  getSentryReplaySessionSampleRate,
  getSentryTracesSampleRate,
  isSentryEnabled,
} from './environment';
export { shouldReportHttpStatusForBudget } from './http-error-budget';
