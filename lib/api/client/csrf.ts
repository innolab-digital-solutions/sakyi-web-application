import { api } from './config';

const COOKIE_NAME = 'XSRF-TOKEN=';

/**
 * Returns the current CSRF token from the browser cookie, if available.
 *
 * Laravel Sanctum sets the `XSRF-TOKEN` cookie for CSRF protection.
 * This helper extracts its value for use in API requests (typically sent as `X-XSRF-TOKEN` header).
 *
 * On the server (or when the cookie is missing), returns `undefined`.
 * If the cookie value contains invalid %-encoding, returns `undefined` instead of throwing.
 *
 * @returns {string | undefined} The CSRF token value, or undefined if not found or malformed.
 */
export const getCsrfToken = (): string | undefined => {
  if (typeof document === 'undefined') return undefined;

  let decoded: string;
  try {
    decoded = decodeURIComponent(document.cookie);
  } catch {
    return undefined;
  }

  const parts = decoded.split(';');
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.startsWith(COOKIE_NAME)) {
      return trimmed.slice(COOKIE_NAME.length);
    }
  }
  return undefined;
};

let csrfInitPromise: Promise<void> | null = null;

/**
 * Ensures the Laravel Sanctum CSRF cookie is present before state-changing requests.
 *
 * Laravel Sanctum requires a GET to `/sanctum/csrf-cookie` to set the `XSRF-TOKEN` cookie
 * before any POST/PUT/PATCH/DELETE request can succeed. Without this, the backend rejects
 * the request with a "CSRF token mismatch" 419 error.
 *
 * This function is idempotent within a page session: if the cookie already exists it returns
 * immediately. If an initialization request is already in-flight, subsequent callers await
 * the same promise to avoid duplicate network requests.
 *
 * @returns {Promise<void>} Resolves once the CSRF cookie is available.
 */
export const ensureCsrfCookie = async (): Promise<void> => {
  if (typeof document === 'undefined') return;
  if (getCsrfToken()) return;

  if (csrfInitPromise) return csrfInitPromise;

  csrfInitPromise = fetch(`${api.domainEndpoint}/sanctum/csrf-cookie`, {
    method: 'GET',
    credentials: 'include',
  }).then(() => {
    csrfInitPromise = null;
  });

  return csrfInitPromise;
};
