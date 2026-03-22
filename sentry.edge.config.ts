/**
 * Sentry initialization for all Edge-executed code in this Next.js project.
 *
 * This applies to any code running within Edge runtimes—including:
 *   - Next.js proxy (`proxy.ts`)
 *   - Edge Route Handlers/API endpoints (`route.ts`, etc. using `{ runtime: 'edge' }`)
 *   - Any custom Edge server logic (e.g., streaming responses, rewrite proxies)
 *
 * Purpose:
 *   - Enables Sentry error and performance monitoring on Edge Functions and Middleware.
 *   - Captures exceptions/transactions as close to the request entrypoint as possible, even before it hits traditional server routes.
 *   - Ensures complete coverage: runs both in local dev and in deployed environments (not limited to Vercel Edge).
 *
 * Note:
 *   - This configuration is decoupled from the Vercel Edge Runtime specifics and runs in any Edge-compatible environment.
 *   - Must be imported wherever Sentry is needed on the Edge (middleware, edge route handlers) to ensure initialization.
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
   * Initialize Sentry for edge error and performance monitoring.
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
}
