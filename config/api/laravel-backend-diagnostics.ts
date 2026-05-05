import { base } from './base';

/**
 * Laravel-side diagnostic tool path segments mounted on {@link base.domainEndpoint}.
 *
 * Mirrors backend route registration (Telescope / Horizon / Pulse).
 */
export const LARAVEL_BACKEND_DIAGNOSTIC_ROUTES = {
  APPLICATION_DEBUGGING: '/debugging',
  QUEUE_MONITORING: '/queues-monitoring',
  APPLICATION_TELEMETRY: '/observability',
} as const;

export type LaravelDiagnosticRouteKey =
  keyof typeof LARAVEL_BACKEND_DIAGNOSTIC_ROUTES;

/**
 * Builds an absolute URL using the normalized API domain from environment
 * (`NEXT_PUBLIC_API_DOMAIN_ENDPOINT`, see {@link base}).
 */
export function absoluteLaravelDiagnosticUrl(
  key: LaravelDiagnosticRouteKey,
): string {
  const segment = LARAVEL_BACKEND_DIAGNOSTIC_ROUTES[key];
  return `${base.domainEndpoint}${segment}`;
}
