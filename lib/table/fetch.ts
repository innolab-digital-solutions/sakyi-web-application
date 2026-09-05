import { http } from '@/lib/api/client';
import type { ApiResponse } from '@/types/api';

/**
 * Constructs a query string from a provided object of parameters.
 *
 * Converts key-value pairs in the given params object into a URL-encoded query string.
 * Ignores keys whose values are undefined or null.
 *
 * @param {Record<string, unknown>} [params] - The query parameters as a record object.
 * @returns {string} A query string starting with '?', or an empty string if no parameters exist.
 */
export const buildQueryString = (params?: Record<string, unknown>): string => {
  if (!params) return '';
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    sp.append(key, String(value));
  }
  const qs = sp.toString();
  return qs ? `?${qs}` : '';
};

/**
 * Fetches a page of table data from a specified API endpoint, with optional query parameters.
 *
 * Constructs the full URL with query string and calls the shared HTTP client.
 * Throws on HTTP errors by default. Pass `signal` so React Query can cancel an
 * in-flight request when the search/page key changes before the response arrives.
 *
 * @template T Response data type
 * @param {string} endpoint - The API endpoint path.
 * @param {Record<string, unknown>} [params] - Optional query parameters to include.
 * @param {{ signal?: AbortSignal }} [options] - Optional fetch abort signal from React Query.
 * @returns {Promise<ApiResponse<T>>} The structured API response with data of type T.
 */
export const fetchTablePage = async <T>(
  endpoint: string,
  params?: Record<string, unknown>,
  options?: { signal?: AbortSignal },
): Promise<ApiResponse<T>> => {
  const url = params ? `${endpoint}${buildQueryString(params)}` : endpoint;
  return http.get<T>(url, {
    throwOnError: true,
    ...(options?.signal ? { signal: options.signal } : {}),
  });
};
