import {
  buildRequestHeaders,
  resolveApiUrl,
  serializeRequestBody,
} from './build';
import { DEFAULT_METHOD } from './constants';
import { ensureCsrfCookie } from './csrf';
import {
  handleBackendError,
  handleJsonParseFailure,
  handleNetworkFailure,
  handleNoContent,
  handleNonJson,
} from './handlers';
import type { ApiError as ApiErrorPayload, ApiResponse } from './types';
import type { ClientOptions } from './types';

/**
 * Performs a flexible, production-grade HTTP API request against a resolved endpoint.
 *
 * Handles request serialization, appropriate headers, and response parsing for JSON, non-JSON, or no-content cases.
 * Automatically manages error flows—distinguishing between network errors, backend (application) errors, JSON parse failures, and no-content responses.
 *
 * - Authenticates requests with `credentials: 'include'`.
 * - Throws or returns structured error responses depending on `throwOnError`.
 * - Allows explicit control over HTTP method, request body, response parsing mode, cache policy, Next.js-specific request options, and additional fetch parameters.
 * - Expects backend responses to conform to the `ApiResponse<T>` contract (with standardized `status`, `message`, etc.).
 *
 * @template T The expected data type of a successful API response.
 * @param {string} endpoint - The API path or URL fragment to request.
 * @param {ClientOptions} [options] - Configuration for HTTP method, request body, parsing, error strategy, cache, and other fetch parameters.
 * @returns {Promise<ApiResponse<T>>} A resolved or rejected standardized API response with fully typed data, or an error contract if failed.
 *
 * @example
 *   const res = await client<User>('/api/user', { method: 'GET' });
 *   if (res.status === 'success') { ... }
 *
 * @throws {ApiClientError} If `throwOnError` is true and the request fails due to network or backend error.
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

  if (method !== 'GET') {
    await ensureCsrfCookie();
  }

  const url = resolveApiUrl(endpoint);
  const requestHeaders = buildRequestHeaders(method, options);
  const { body: serializedBody } = serializeRequestBody(body, requestHeaders);

  const requestInit: RequestInit = {
    ...rest,
    method,
    headers: requestHeaders,
    body: serializedBody ?? undefined,
    credentials: 'include',
    cache,
    ...(next !== undefined && { next }),
  };

  let response: Response;
  try {
    response = await fetch(url, requestInit);
  } catch (error) {
    return handleNetworkFailure<T>(error, throwOnError);
  }

  if (!parseJson) {
    const text = await response.text();
    return handleNonJson<T>(response, text);
  }

  if (response.status === 204) {
    return handleNoContent<T>();
  }

  let json: ApiResponse<T>;
  try {
    json = await response.json();
  } catch {
    return handleJsonParseFailure<T>(response, throwOnError);
  }

  const ok = response.ok && json.status !== 'error';
  if (!ok) {
    return handleBackendError<T>(
      response,
      json as ApiErrorPayload,
      throwOnError,
    );
  }

  return json;
};
