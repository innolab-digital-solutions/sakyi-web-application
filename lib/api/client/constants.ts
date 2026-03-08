/**
 * Base API URLs are configured in {@link apiBase} (config/api/base.ts) via
 * NEXT_PUBLIC_API_DOMAIN_ENDPOINT and NEXT_PUBLIC_API_VERSION_ENDPOINT.
 */

/**
 * Default HTTP method used by the API client when no method is explicitly provided.
 */
export const DEFAULT_METHOD = 'GET' as const;

/**
 * Standardized, user-facing messages used when constructing API error responses.
 */
export const MESSAGES = {
  DEFAULT_ERROR: 'An error occurred.',
  NETWORK_ERROR:
    'A network error occurred while attempting to reach the API. Please verify your internet connection or try again later.',
  INVALID_JSON: 'The server returned an invalid JSON response.',
  SUCCESS: 'The request was successfully processed.',
} as const;
