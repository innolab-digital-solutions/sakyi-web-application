/**
 * API base configuration resolved from environment variables.
 *
 * Provides a single source of truth for:
 * - API domain (used for Sanctum / CSRF endpoints)
 * - Versioned API base URL (used for resource endpoints)
 *
 * Environment variables (see `.env.example`):
 * - NEXT_PUBLIC_API_DOMAIN_ENDPOINT
 * - NEXT_PUBLIC_API_VERSION_ENDPOINT
 * - NEXT_PUBLIC_API_VERSION (optional)
 */

const DEFAULT_API_DOMAIN_ENDPOINT = 'https://api.sakyihealthandwellness.com';
const DEFAULT_API_VERSION_ENDPOINT =
  'https://api.sakyihealthandwellness.com/v1';
const DEFAULT_API_VERSION = 'v1';

// Remove trailing slashes from URLs for consistent concatenation.
const normalize = (url: string): string => url.replace(/\/+$/, '');

export const base = {
  domainEndpoint: normalize(
    process.env.NEXT_PUBLIC_API_DOMAIN_ENDPOINT ?? DEFAULT_API_DOMAIN_ENDPOINT,
  ),

  versionEndpoint: normalize(
    process.env.NEXT_PUBLIC_API_VERSION_ENDPOINT ??
      DEFAULT_API_VERSION_ENDPOINT,
  ),

  apiVersion: process.env.NEXT_PUBLIC_API_VERSION ?? DEFAULT_API_VERSION,
} as const;
