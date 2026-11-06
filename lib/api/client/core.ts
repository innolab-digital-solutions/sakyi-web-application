import {
  buildRequestHeaders,
  buildSerializedRequestBody,
  buildVersionedEndpoint,
} from './builders';
import { DEFAULT_METHOD } from './constants';
import { ensureCsrfCookie } from './csrf';
import {
  handleBackendApiError,
  handleInvalidJson,
  handleNetworkError,
  handleNoContentResponse,
  handleNonJsonResponse,
} from './handlers';
import type { ApiError as ApiErrorPayload, ApiResponse } from './types';
import type { ClientOptions } from './types';

/**
 * Performs an HTTP request to the versioned API endpoint using the provided options,
 * handling CSRF, request serialization, error wrapping, and response normalization.
 *
 * This is the high-level entry point for all API client requests. It prepares
 * the request URL, headers, and body; ensures CSRF protection for unsafe methods;
 * executes the request; and parses, normalizes, and wraps responses using a uniform
 * ApiResponse structure. Automatically detects and handles:
 *  - Network failures and unreachable endpoints
 *  - Non-JSON and invalid JSON responses
 *  - HTTP error status (including error payloads returned by backend)
 *  - Successful (status: "success") API responses
 *  - No content (204) responses
 *
 * When throwOnError is true (default), throws an ApiClientError for error conditions.
 * Otherwise, returns an error-form ApiResponse object.
 *
 * @template T The expected data type for the API response's `data` field.
 * @param {string} endpoint - Relative API endpoint path (not absolute URL).
 * @param {ClientOptions} options - Request options: method, headers, body, cache, etc.
 * @returns {Promise<ApiResponse<T>>} Resolves to a normalized ApiResponse<T>. May throw ApiClientError if throwOnError is true.
 *
 * @throws {ApiClientError} When throwOnError is true and a network, HTTP, or backend error is encountered.
 *
 * @example
 * const response = await client<User>('/users/42', { method: 'GET' });
 * if (response.status === 'success') {
 *   console.log(response.data);
 * } else {
 *   handle error (e.g. display error message, log, etc.)
 * }
 */
export const client = async <T>(
  endpoint: string,
  options: ClientOptions = {},
): Promise<ApiResponse<T>> => {
  const {
    method = DEFAULT_METHOD,
    body,
    parseJson = true,
    throwOnError = true,
    cache = 'no-store',
    next,
    ...rest
  } = options;

  if (method !== 'GET') await ensureCsrfCookie();

  const url = buildVersionedEndpoint(endpoint);

  const headers = buildRequestHeaders(method, options);

  const { body: serializedBody } = buildSerializedRequestBody(body, headers);

  let response: Response;

  try {
    response = await fetch(url, {
      method,
      headers,
      body: serializedBody,
      credentials: 'include',
      cache,
      ...(next !== undefined && { next }),
      ...rest,
    });
  } catch (error) {
    return handleNetworkError<T>(error, throwOnError);
  }

  if (!parseJson) {
    const text = await response.text();
    return handleNonJsonResponse<T>(response, text);
  }

  if (response.status === 204) {
    return handleNoContentResponse<T>();
  }

  let json: ApiResponse<T>;

  try {
    json = await response.json();
  } catch {
    return handleInvalidJson<T>(response, throwOnError);
  }

  const ok = response.ok && json.status !== 'error';

  if (!ok) {
    return handleBackendApiError<T>(
      response,
      json as ApiErrorPayload,
      throwOnError,
    );
  }

  return json;
};
