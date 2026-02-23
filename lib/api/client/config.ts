import { ENDPOINTS } from './constants';

/**
 * Centralized API client configuration for all HTTP requests.
 *
 * - The base URL and API domain are configurable via environment variables to support
 *   multiple deployment targets without exposing sensitive settings in the client bundle.
 * - Fallbacks to production defaults if environment variables are not set.
 * - Trailing slashes are automatically removed for consistency in URL construction.
 *
 * Environment variables:
 * - NEXT_PUBLIC_API_VERSION_ENDPOINT: Override the default API version endpoint
 * - NEXT_PUBLIC_API_DOMAIN_ENDPOINT: Override the default API domain endpoint
 *
 * @example
 *   fetch(`${api.versionEndpoint}/users`);
 *   fetch(`${api.domainEndpoint}/sanctum/csrf-cookie`);
 */
export const api = {
  /**
   * Returns the version endpoint for the API.
   * @returns {string} The version endpoint for the API.
   */
  get versionEndpoint(): string {
    const url =
      process.env.NEXT_PUBLIC_API_VERSION_ENDPOINT || ENDPOINTS.VERSION;
    return url.replace(/\/+$/, '');
  },

  /**
   * Returns the domain endpoint for the API.
   * @returns {string} The domain endpoint for the API.
   */
  get domainEndpoint(): string {
    const domain =
      process.env.NEXT_PUBLIC_API_DOMAIN_ENDPOINT || ENDPOINTS.DOMAIN;
    return domain.replace(/\/+$/, '');
  },
} as const;
