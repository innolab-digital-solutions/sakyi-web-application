/**
 * Sentry Next.js Instrumentation Entrypoint
 *
 * This file provides runtime-instrumentation for Sentry error and performance monitoring
 * within a Next.js App Router project. It handles environment-specific initialization—
 * distinguishing between Node.js (traditional server) and Edge runtimes—and sets up
 * request-level error capture hooks.
 *
 * Purpose:
 *   - Ensures Sentry is initialized exactly once in the correct runtime context.
 *   - Loads the minimal required configuration (`sentry.server.config` for Node, `sentry.edge.config` for Edge)
 *     to avoid unnecessary bundle bloat or context leaks.
 *   - Exposes an error-capture handler for use in Next.js App Router instrumentation hooks.
 *
 * Usage:
 *   - Call `register()` in `instrumentation.ts` per Next.js App Router conventions (invoked by the framework).
 *   - Use `onRequestError` as the handler for request-scoped error events (see Next.js App Router docs).
 *
 * Notes:
 *   - Client-side Sentry instrumentation should be handled separately (see `instrumentation-client.ts`).
 *   - No secrets or sensitive values are leaked here; all initialization is deferred and context-specific.
 *   - This file should remain side-effect free except for lazy runtime imports.
 *
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */

import * as Sentry from '@sentry/nextjs';

/**
 * Dynamically loads Sentry configuration for the current Next.js runtime.
 *
 * - In 'nodejs' runtime, imports `sentry.server.config.ts`.
 * - In 'edge' runtime, imports `sentry.edge.config.ts`.
 *
 * This ensures only the appropriate config is loaded and side effects are contained.
 *
 * Should be called once at framework bootstrap by Next.js.
 */
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

/**
 * Request-level error handler for Next.js instrumentation hooks.
 *
 * Use as the `onRequestError` callback in App Router's instrumentation integration.
 *
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/advanced-options/#instrumentation
 */
export const onRequestError = Sentry.captureRequestError;
