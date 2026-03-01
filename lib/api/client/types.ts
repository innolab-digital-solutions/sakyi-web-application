import type {
  ApiError,
  ApiResponse,
  ApiSuccess,
  HttpMethod,
} from '@/types/api';

export type { ApiError, ApiResponse, ApiSuccess, HttpMethod };

/**
 * Fetch cache strategies supported by Next.js.
 * @see https://nextjs.org/docs/app/api-reference/functions/fetch
 */
export type NextFetchCache =
  | 'default'
  | 'force-cache'
  | 'no-store'
  | 'no-cache';

/**
 * Next.js fetch `next` option for controlling revalidation and cache tags.
 * @see https://nextjs.org/docs/app/api-reference/functions/fetch
 */
export type NextFetchNext = {
  revalidate?: number | false;
  tags?: string[];
};

/**
 * Represents options for configuring API client requests.
 *
 * Extends the standard {@link RequestInit} (excluding `body` and `method`) to provide additional
 * features tailored for Next.js and typical API workflows, including body serialization, error handling,
 * and advanced caching behaviors.
 *
 * @property {BodyInit | Record<string, unknown> | unknown[]} [body] -
 *   Request body. Accepts JSON-serializable objects, FormData, URLSearchParams, or string.
 * @property {boolean} [parseJson] -
 *   If true (default), parses the response as JSON. If false, returns the response as a string or raw value for 204 responses.
 * @property {boolean} [throwOnError] -
 *   If true (default), throws {@link ApiClientError} for failed responses. If false, returns an {@link ApiResponse} with `status: 'error'`.
 * @property {NextFetchCache} [cache] -
 *   Controls fetch cache behavior for Next.js. Use `"no-store"` for dynamic or auth-dependent endpoints, or `"force-cache"` for static content.
 * @property {NextFetchNext} [next] -
 *   Controls revalidation timing and cache tags for Next.js fetches. Use `revalidate` to set the revalidation window (seconds) or `false` for indefinite cache. Use `tags` for cache tagging.
 */
export type ClientRequestInit = Omit<RequestInit, 'body' | 'method'> & {
  body?: BodyInit | Record<string, unknown> | unknown[];
  parseJson?: boolean;
  throwOnError?: boolean;
  cache?: NextFetchCache;
  next?: NextFetchNext;
};

/**
 * Comprehensive set of client options for API requests.
 *
 * Extends {@link ClientRequestInit} by including the HTTP method.
 * Use this type with the core API client to achieve full control over all aspects of the request, such as
 * method, body serialization, caching, and error handling.
 *
 * Omit the `method` property when utilizing convenience HTTP helper functions,
 * as they automatically set the appropriate method.
 */
export type ClientOptions = ClientRequestInit & {
  method?: HttpMethod;
};
