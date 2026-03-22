/**
 * Sentry initialization for all client-side (browser) code in this Next.js project.
 *
 * This configuration enables comprehensive error, performance, and replay monitoring on the client.
 * It ensures that any error or user interaction in the browser is captured and sent to Sentry,
 * providing visibility into real-world usage and issues.
 *
 * Purpose:
 *   - Automatically instruments and reports browser-side errors and performance data to Sentry.
 *   - Captures user session replays for diagnosing client-side errors and behaviors.
 *   - Attaches relevant metadata (environment, release, traces, etc.) to all events.
 *
 * Usage:
 *   - This setup runs in every client-side bundle (i.e., whenever a real user loads a page).
 *   - It does not run on the server or edge; see `sentry.server.config.ts` and `sentry.edge.config.ts` for those contexts.
 *
 * Notes:
 *   - Uses runtime settings such as DSN, environment, release, and sample rates.
 *   - Will not initialize if no DSN is present (e.g., when Sentry is disabled).
 *   - Keeps initialization side-effect free outside Sentry.init() — no secrets or sensitive data leak.
 *
 * @see {@link https://docs.sentry.io/platforms/javascript/guides/nextjs/}
 */

import { replayIntegration } from '@sentry/browser';
import * as Sentry from '@sentry/nextjs';

import {
  getPublicSentryDsn,
  getSentryEnableLogs,
  getSentryEnvironment,
  getSentryRelease,
  getSentryReplayOnErrorSampleRate,
  getSentryReplaySessionSampleRate,
  getSentryTracesSampleRate,
} from '@/lib/sentry';

const sentryDsn = getPublicSentryDsn();

if (sentryDsn) {
  /**
   * Initialize Sentry for browser-side error, performance, and replay monitoring.
   *
   * - integrations: Adds session replay capturing to monitor actual user sessions.
   * - tracesSampleRate: Sampling for performance traces.
   * - replaysSessionSampleRate: Session sampling rate for replays (regular behavior).
   * - replaysOnErrorSampleRate: Session sampling rate for replays (on errors).
   * - enableLogs: Enables debug logs from the SDK if toggled.
   * - sendDefaultPii: Includes personally identifiable information for richer debugging (optional).
   *
   * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/
   */
  Sentry.init({
    dsn: sentryDsn,

    environment: getSentryEnvironment(),

    release: getSentryRelease(),

    integrations: [replayIntegration()],

    tracesSampleRate: getSentryTracesSampleRate(),

    enableLogs: getSentryEnableLogs(),

    replaysSessionSampleRate: getSentryReplaySessionSampleRate(),

    replaysOnErrorSampleRate: getSentryReplayOnErrorSampleRate(),

    sendDefaultPii: true,
  });
}

/**
 * Registers a Sentry breadcrumb and trace whenever the Next.js router starts a transition.
 * This helps with navigation tracing and diagnosis of SPA navigations.
 */
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
