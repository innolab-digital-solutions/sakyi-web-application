/**
 * Sentry initialization for all traditional (Node.js-based) server code in this Next.js project.
 *
 * This includes any code executed in the Node.js runtime, such as:
 *   - API route handlers (Node.js runtime)
 *   - Server-side rendering (SSR)
 *   - Server Actions
 *   - App/Pages Router logic when not running on the Edge
 *
 * Purpose:
 *   - Enables comprehensive error and performance monitoring on the server.
 *   - Sends errors, exceptions, and performance data from Node.js environments to Sentry.
 *   - Isolates configuration so it won't affect Edge runtimes or client bundles.
 *
 * Note:
 *   - This configuration should be imported only in server-side entrypoints or modules.
 *   - Do not import in Edge code or client bundles—see `sentry.edge.config.ts` for Edge runtime.
 *
 * @see {@link https://docs.sentry.io/platforms/javascript/guides/nextjs/}
 */

import * as Sentry from '@sentry/nextjs';

import {
  getPublicSentryDsn,
  getSentryEnableLogs,
  getSentryEnvironment,
  getSentryRelease,
  getSentryTracesSampleRate,
} from '@/lib/sentry';

const sentryDsn = getPublicSentryDsn();

if (sentryDsn) {
  /**
   * Initialize Sentry for server-side error and performance monitoring.
   *
   * - environment: tracks current environment (dev/staging/prod)
   * - release: attaches git/app release info
   * - tracesSampleRate: sampling for performance traces
   * - enableLogs: toggles debug logging for Sentry SDK
   * - sendDefaultPii: includes personally identifiable information (user info, IP, etc.)
   *
   * @see {@link https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii}
   *
   * Important: Keep this lightweight and side-effect free outside the Sentry.init() block.
   * Do not expose secrets or leak internal details outside of the initialization object.
   */
  Sentry.init({
    dsn: sentryDsn,

    environment: getSentryEnvironment(),

    release: getSentryRelease(),

    tracesSampleRate: getSentryTracesSampleRate(),

    enableLogs: getSentryEnableLogs(),

    sendDefaultPii: true,
  });
} else {
  console.warn(
    'Sentry is disabled: no DSN provided or sentry toggled off in the environment.',
  );
}
