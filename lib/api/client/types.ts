import type {
  ApiError,
  ApiResponse,
  ApiSuccess,
  HttpMethod,
} from '@/types/api';

export type { ApiError, ApiResponse, ApiSuccess, HttpMethod };

/**
 * Controls the caching behavior for Next.js `fetch` requests.
 *
 * - 'default': Use the default cache policy determined by Next.js.
 * - 'force-cache': Cache the response indefinitely until manually revalidated (suitable for static data).
 * - 'no-store': Do not cache the response at all (recommended for dynamic or user-specific data).
 * - 'no-cache': Bypass the cache for the fetch, but track the resource in the cache for future invalidation.
 *
 * @see https://nextjs.org/docs/app/api-reference/functions/fetch
 */
export type NextFetchCache =
  | 'default'
  | 'force-cache'
  | 'no-store'
  | 'no-cache';

/**
 * Provides advanced cache control options for Next.js `fetch` requests.
 *
 * @see https://nextjs.org/docs/app/api-reference/functions/fetch
 *
 * @property {number | false} [revalidate] - Specifies revalidation window in seconds; set to `false` for indefinite cache.
 * @property {string[]} [tags] - Tags associated with the cache entry, enabling granular cache invalidation.
 */
export type NextFetchNext = {
  revalidate?: number | false;
  tags?: string[];
};

/**
 * Options for performing an HTTP client request, extending the base `RequestInit`
 * with additional conveniences for application/API needs.
 *
 * - Omits 'body' and 'method' from the base `RequestInit` to allow application-specific typing.
 * - `body` may be native, object, or array (JSON-serializable).
 * - `parseJson` sets whether the response should be parsed as JSON (default: true).
 * - `throwOnError` controls whether HTTP or API errors throw exceptions.
 * - `cache` and `next` provide fine-grained Next.js caching control.
 *
 *  @param {BodyInit | Record<string, unknown> | unknown[]} body - The request body, as a raw value or JSON-serializable object/array.
 *  @param {boolean} parseJson - Whether to automatically parse the response as JSON. Defaults to true.
 *  @param {boolean} throwOnError - If true, throws on HTTP or API error responses; otherwise returns the response/error object. Defaults to false.
 *  @param {NextFetchCache} cache - Controls caching for Next.js fetch. Accepts Next.js cache strategy values.
 *  @param {NextFetchNext} next - Advanced Next.js fetch cache control (revalidation/tags).
 */
export type ClientRequestInit = Omit<RequestInit, 'body' | 'method'> & {
  body?: BodyInit | Record<string, unknown> | unknown[];
  parseJson?: boolean;
  throwOnError?: boolean;
  cache?: NextFetchCache;
  next?: NextFetchNext;
};

/**
 * Options for read-only HTTP requests (e.g., GET and DELETE), excluding the request body.
 *
 * Use this type when performing read operations to enforce that no request body is included.
 * @see ClientRequestInit
 */
export type ReadOptions = Omit<ClientRequestInit, 'body'>;

/**
 * Options for write operations (e.g., POST, PUT, and PATCH), allowing a request body.
 *
 * Use this type for requests that modify server state and require a payload.
 * @see ClientRequestInit
 */
export type WriteOptions = ClientRequestInit;

/**
 * Complete client options, including HTTP method, request body, caching, and parsing flags.
 *
 * @param {HttpMethod} method - Optional HTTP verb. If omitted, defaults are determined by the calling client.
 * @param {ClientRequestInit} init - Extended request options with custom application fields.
 */
export type ClientOptions = ClientRequestInit & {
  method?: HttpMethod;
};

/**
 * Options for the internal throw-or-return helper used by response handlers.
 * When throwOnError is false, either fallbackResponse or a generic error response is returned.
 *
 * @param {boolean} throwOnError - If true, throws an ApiClientError.
 * @param {Record<string, unknown>} errors - Optional detailed errors, keyed by field or context.
 * @param {string} requestId - Optional request ID from the response headers.
 * @param {ApiError} payload - Optional parsed error payload from the backend.
 * @param {ApiResponse<T>} fallbackResponse - Optional fallback response to return when throwOnError is false.
 */
export type ThrowOrReturnOptions<T> = {
  throwOnError: boolean;
  errors?: Record<string, unknown>;
  requestId?: string;
  payload?: ApiError;
  fallbackResponse?: ApiResponse<T>;
};
