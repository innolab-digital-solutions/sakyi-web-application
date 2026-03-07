/**
 * Default API endpoints for the Sakyi backend.
 *
 * These values provide sane production defaults and are overridden at runtime
 * by environment variables in {@link api} when needed.
 */
export const ENDPOINTS = {
  VERSION: 'https://api.sakyihealthandwellness.com/v1',
  DOMAIN: 'https://api.sakyihealthandwellness.com',
} as const;

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
