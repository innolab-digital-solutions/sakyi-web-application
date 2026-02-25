import { api } from './config';
import { getCsrfToken } from './csrf';
import type { HttpMethod } from './types';
import type { ClientRequestInit } from './types';

/**
 * Determines if the given endpoint is related to Laravel Sanctum (authentication, CSRF, etc).
 * Sanctum endpoints are routed differently and do NOT receive the version prefix.
 *
 * @param {string} endpoint - The API endpoint path (with or without leading slash).
 * @returns {boolean} True if the endpoint targets Sanctum-specific routes (e.g. sanctum/csrf-cookie); otherwise, false.
 *
 * @remarks
 * Requires "sanctum/" in the path so a resource path like "sanctum" alone is not treated as Sanctum.
 */
const isSanctumEndpoint = (endpoint: string): boolean => {
  const normalized = endpoint.replace(/^\/+/, '').toLowerCase();
  return normalized.startsWith('sanctum/');
};

/**
 * Resolves the absolute API URL for a given logical endpoint.
 *
 * - Prepends the base API domain or API version root, depending on whether the target relates to Sanctum or the versioned API.
 * - Rejects absolute URLs to avoid SSRF and open-redirect; only relative path segments are allowed.
 * - Always strips leading slashes from input for consistent path joining.
 *
 * @param {string} endpoint - Logical API path (relative, with or without leading slash). Must not be a full URL.
 * @returns {string} Fully qualified API URL for use with fetch or API requests.
 * @throws {Error} If endpoint is an absolute URL (e.g. starts with http://, https://, or //).
 *
 * @example
 *   resolveApiUrl('users/1')        // => "https://api.example.com/v1/users/1"
 *   resolveApiUrl('/sanctum/csrf') // => "https://api.example.com/sanctum/csrf"
 */
export const resolveApiUrl = (endpoint: string): string => {
  const trimmed = endpoint.trim();
  if (/^(https?:|\/\/)/i.test(trimmed)) {
    throw new Error(
      `API client does not accept absolute URLs. Use a relative path (e.g. "users/1"), not "${trimmed.slice(0, 50)}${trimmed.length > 50 ? '...' : ''}".`,
    );
  }
  const normalized = trimmed.replace(/^\/+/, '');
  if (isSanctumEndpoint(trimmed)) {
    return `${api.domainEndpoint}/${normalized}`;
  }
  return `${api.versionEndpoint}/${normalized}`;
};

/**
 * Builds and normalizes an HTTP headers object for API requests.
 *
 * - Always includes an 'Accept: application/json' header.
 * - Spreads any custom headers provided via the `init` options.
 * - Automatically injects the CSRF token (`X-XSRF-TOKEN`) header for unsafe, non-GET methods,
 *   if a token is available via `getCsrfToken` (typically only on the client).
 *
 * @param {HttpMethod} method - HTTP verb (e.g., 'GET', 'POST', etc).
 * @param {ClientRequestInit} init - The set of options/config for the outgoing request (may include custom headers).
 * @returns {Record<string, string>} Headers object suitable for use with fetch, pre-populated with all necessary keys.
 *
 * @remarks
 * CSRF token logic assumes Laravel Sanctum for session-based authentication.
 */
/**
 * Converts Headers or record to a plain record for merging. Fetch accepts both; we need a single record so we can add Accept and X-XSRF-TOKEN.
 */
function toHeadersRecord(
  headers: RequestInit['headers'],
): Record<string, string> {
  if (headers == null) return {};
  if (headers instanceof Headers) return Object.fromEntries(headers.entries());
  return { ...(headers as Record<string, string>) };
}

export const buildRequestHeaders = (
  method: HttpMethod,
  init: ClientRequestInit,
): Record<string, string> => {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...toHeadersRecord(init.headers),
  };

  if (method !== 'GET') {
    const token = getCsrfToken();

    if (token) {
      headers['X-XSRF-TOKEN'] = token;
    }
  }
  return headers;
};

/**
 * Serializes request payloads for safe use in fetch and attaches Content-Type as needed.
 *
 * - Accepts string, FormData, or URLSearchParams as "raw" and passes them directly with no content type changes.
 * - If the body contains any File values, automatically builds a FormData instance.
 * - Otherwise, JSON stringifies object literals, attaching 'Content-Type: application/json'.
 *
 * @param {ClientRequestInit['body']} body - Payload for the outgoing API request. Accepts string, object, FormData, or URLSearchParams.
 * @param {Record<string, string>} headers - The outgoing request headers object (mutated if Content-Type is set).
 * @returns {{ body: BodyInit | undefined; contentTypeSet: boolean }} Serialized body and whether Content-Type header was set.
 *
 * @remarks
 * Designed for REST JSON APIs and multi-part form upload endpoints. Mutates the supplied headers if JSON content type is necessary.
 *
 * @example
 *   const { body } = serializeRequestBody({ name: 'Test' }, headers);
 */
export const serializeRequestBody = (
  body: ClientRequestInit['body'],
  headers: Record<string, string>,
): { body: BodyInit | undefined; contentTypeSet: boolean } => {
  if (body === undefined) {
    return { body: undefined, contentTypeSet: false };
  }

  if (
    typeof body === 'string' ||
    body instanceof FormData ||
    body instanceof URLSearchParams
  ) {
    return { body: body as BodyInit, contentTypeSet: false };
  }

  const hasFile = Object.values(body).some((v) => v instanceof File);

  if (hasFile) {
    const form = new FormData();
    for (const [key, value] of Object.entries(body)) {
      if (value instanceof File) {
        form.append(key, value);
      } else if (value !== null && value !== undefined) {
        form.append(key, String(value));
      }
    }
    return { body: form, contentTypeSet: false };
  }

  headers['Content-Type'] = 'application/json';

  return { body: JSON.stringify(body), contentTypeSet: true };
};
