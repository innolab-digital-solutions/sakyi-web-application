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
 */

const DEFAULT_API_DOMAIN = 'https://api.sakyihealthandwellness.com';
const DEFAULT_API_VERSION = 'https://api.sakyihealthandwellness.com/v1';

// Remove trailing slashes from URLs for consistent concatenation.
const normalize = (url: string): string => url.replace(/\/+$/, '');

export const base = {
  domain: normalize(
    process.env.NEXT_PUBLIC_API_DOMAIN_ENDPOINT ?? DEFAULT_API_DOMAIN,
  ),

  version: normalize(
    process.env.NEXT_PUBLIC_API_VERSION_ENDPOINT ?? DEFAULT_API_VERSION,
  ),
} as const;
