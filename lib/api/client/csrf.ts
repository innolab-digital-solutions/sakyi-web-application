import { base } from '@/config/api/base';

import { COOKIE_NAME, CSRF_COOKIE_ENDPOINT, MESSAGES } from './constants';
import { ApiClientError } from './errors';

/**
 * Tracks the ongoing CSRF cookie initialization promise to prevent duplicate fetches.
 * Resets to null once the initialization attempt completes.
 */
let csrfInitPromise: Promise<void> | null = null;

/**
 * Ensures that the CSRF session cookie is present for API requests requiring protection.
 *
 * - In browsers, this checks if the CSRF token is already available via `getCsrfToken()`.
 * - If not, it fetches the CSRF cookie endpoint using credentials, handling parallel requests safely.
 * - Throws an `ApiClientError` on failure (network or server status error).
 * - No-ops in non-browser environments (e.g., on the server).
 *
 * @throws {ApiClientError} If unable to obtain a valid CSRF cookie from the API.
 * @returns {Promise<void>} Resolves when the CSRF cookie is ensured or already present.
 */
export const ensureCsrfCookie = async (): Promise<void> => {
  if (typeof document === 'undefined' || getCsrfToken()) return;

  if (csrfInitPromise) return csrfInitPromise;

  csrfInitPromise = fetch(`${base.domain}${CSRF_COOKIE_ENDPOINT}`, {
    method: 'GET',
    credentials: 'include',
  })
    .then((response) => {
      if (!response.ok) {
        throw new ApiClientError(MESSAGES.CSRF_COOKIE_FAILED, response.status, {
          csrf: [`HTTP ${response.status}`],
        });
      }
      return undefined;
    })
    .catch((error: unknown) => {
      if (error instanceof ApiClientError) throw error;
      throw new ApiClientError(MESSAGES.CSRF_COOKIE_FAILED, 0, {
        csrf: [error instanceof Error ? error.message : String(error)],
      });
    })
    .finally(() => {
      csrfInitPromise = null;
    });

  return csrfInitPromise;
};

/**
 * Retrieves the current CSRF token value from the browser's cookies, if present.
 *
 * - Only runs in a browser context; returns undefined server-side.
 * - Looks for the cookie matching `COOKIE_NAME` (e.g., 'XSRF-TOKEN=').
 * - Returns the decoded value or undefined if not found or an error occurs.
 *
 * @returns {string | undefined} The CSRF token string, or undefined if not available.
 */
export const getCsrfToken = (): string | undefined => {
  if (typeof document === 'undefined') return undefined;

  try {
    for (const cookie of decodeURIComponent(document.cookie).split(';')) {
      const trimmed = cookie.trim();
      if (trimmed.startsWith(COOKIE_NAME)) {
        return trimmed.slice(COOKIE_NAME.length);
      }
    }
  } catch {
    return undefined;
  }
};
