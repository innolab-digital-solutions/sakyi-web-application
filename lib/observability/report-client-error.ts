/**
 * Central hook for client-side error reporting. Extend with Sentry/Datadog/etc.
 * without scattering `console.error` across components.
 */
export function reportClientError(
  error: unknown,
  context?: { digest?: string; segment?: string },
): void {
  const payload = {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    ...context,
  };

  if (process.env.NODE_ENV === 'development') {
    console.error('[client-error]', payload);
  }

  // Example: Sentry.captureException(error, { extra: context });
}
