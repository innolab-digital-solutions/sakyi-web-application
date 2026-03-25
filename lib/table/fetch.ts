import { http } from '@/lib/api/client';
import type { ApiResponse } from '@/types/api';

/**
 * Serializes params into a query string for GET requests.
 *
 * Omits undefined/null; coerces values to strings for URL encoding.
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
 * Fetches a list endpoint page using the shared HTTP client.
 */
export const fetchTablePage = async <T>(
  endpoint: string,
  params?: Record<string, unknown>,
): Promise<ApiResponse<T>> => {
  const url = params ? `${endpoint}${buildQueryString(params)}` : endpoint;
  return http.get<T>(url, { throwOnError: true });
};

