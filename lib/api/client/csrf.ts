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
  const COOKIE_NAME = 'XSRF-TOKEN=';

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
