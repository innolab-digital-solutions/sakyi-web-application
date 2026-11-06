import { base } from '@/config/api/base';

import { MESSAGES } from './constants';
import { getCsrfToken } from './csrf';
import type { HttpMethod } from './types';
import type { ClientRequestInit } from './types';

/**
 * Builds a fully qualified API endpoint using the versioned API path and the provided relative path.
 *
 * - Rejects absolute URLs to enforce use of internal API routes only.
 * - Trims leading and trailing whitespace and slashes from the relative path.
 * - Prepends the configured API version root to the resolved path.
 *
 * @param {string} path - The relative API path (must not be absolute).
 * @returns {string} The full versioned API endpoint URL.
 * @throws {Error} If an absolute URL is passed.
 */
export const buildVersionedEndpoint = (path: string): string => {
  const sanitized = path.trim();

  if (/^(https?:|\/\/)/i.test(sanitized)) {
    throw new Error(MESSAGES.ABSOLUTE_URL_ERROR);
  }

  const normalizedPath = sanitized.replace(/^\/+/, '').trim();

  return `${base.versionEndpoint}/${normalizedPath}`;
};

/**
 * Constructs HTTP request headers for API requests according to method and CSRF protection requirements.
 *
 * - Always sets 'Accept: application/json'.
 * - Merges user-provided headers into the request (from `init.headers`).
 * - If the method is not GET, includes the 'X-XSRF-TOKEN' header if available.
 *
 * @param {HttpMethod} method - The HTTP method (e.g. 'GET', 'POST', etc.).
 * @param {ClientRequestInit} init - The initialization options, potentially containing custom headers.
 * @returns {Record<string, string>} The prepared headers object for fetch.
 */
export const buildRequestHeaders = (
  method: HttpMethod,
  init: ClientRequestInit,
): Record<string, string> => {
  const headers: Record<string, string> = { Accept: 'application/json' };

  const raw = init.headers;
  if (raw != null) {
    const entries =
      raw instanceof Headers ? raw.entries() : Object.entries(raw);
    for (const [key, value] of entries) {
      if (value !== undefined && value !== null) {
        headers[key] = String(value);
      }
    }
  }

  if (method !== 'GET') {
    const token = getCsrfToken();
    if (token) headers['X-XSRF-TOKEN'] = token;
  }

  return headers;
};

/**
 * Serializes the body for HTTP requests based on its type and contents.
 *
 * - If the body is undefined, null, or an empty object, returns no body and omits Content-Type.
 * - If the body is a `string`, `FormData`, or `URLSearchParams`, passes it through and does not set Content-Type (handled automatically).
 * - If the body is an object containing Files or Blobs (for file uploads), converts it to `FormData` (no Content-Type set).
 * - If the body is a plain object, serializes it to JSON and sets 'Content-Type: application/json'.
 * - Throws an error if the body is an unsupported type.
 *
 * @param {ClientRequestInit['body']} body - The body to be serialized for fetch.
 * @param {Record<string, string>} headers - The headers object; set 'Content-Type' if needed for JSON.
 * @returns {{ body: BodyInit | undefined; contentTypeSet: boolean }}
 *   The serialized body and whether Content-Type was set by this function.
 * @throws {TypeError} If the body type is invalid or unsupported.
 */
export const buildSerializedRequestBody = (
  body: ClientRequestInit['body'],
  headers: Record<string, string>,
): { body: BodyInit | undefined; contentTypeSet: boolean } => {
  // No body: likely a GET or HEAD request (Content-Type should not be set)
  if (
    body === undefined ||
    body === null ||
    (typeof body === 'object' &&
      Object.keys(body).length === 0 &&
      !(body instanceof FormData) &&
      !(body instanceof URLSearchParams))
  ) {
    return { body: undefined, contentTypeSet: false };
  }

  // Raw body accepted by fetch (string, FormData, URLSearchParams)
  if (
    typeof body === 'string' ||
    body instanceof FormData ||
    body instanceof URLSearchParams
  ) {
    // Never set Content-Type: FormData & URLSearchParams auto-handled; string user is responsible
    return { body: body as BodyInit, contentTypeSet: false };
  }

  // Only handle plain objects after this point (JSON, or files)
  if (typeof body !== 'object' || Array.isArray(body)) {
    throw new TypeError(
      'Request body must be an object, string, FormData, or URLSearchParams',
    );
  }

  // Check for File/Blob values (for file uploads)
  const hasFile = Object.values(body).some(
    (value) => value instanceof File || value instanceof Blob,
  );

  if (hasFile) {
    const form = new FormData();
    for (const [key, value] of Object.entries(body)) {
      if (value === undefined || value === null) continue;
      // Handle File or Blob directly
      if (value instanceof File || value instanceof Blob) {
        form.append(key, value);
      } else if (Array.isArray(value)) {
        // Serialize array items using indexed bracket notation so PHP/Laravel
        // parses them as a proper array.
        value.forEach((item, index) => {
          if (item === undefined || item === null) return;
          if (item instanceof File || item instanceof Blob) {
            form.append(`${key}[]`, item);
          } else if (typeof item === 'object') {
            // Nested object: flatten one level deep (e.g. translations[0][locale])
            for (const [subKey, subVal] of Object.entries(item)) {
              if (subVal !== undefined && subVal !== null) {
                form.append(`${key}[${index}][${subKey}]`, String(subVal));
              }
            }
          } else {
            form.append(`${key}[]`, String(item));
          }
        });
      } else {
        form.append(key, String(value));
      }
    }
    // Do not set Content-Type; browser handles boundaries
    return { body: form, contentTypeSet: false };
  }

  // If we get here, it's a plain object: JSON-encode
  headers['Content-Type'] = 'application/json';

  return { body: JSON.stringify(body), contentTypeSet: true };
};
