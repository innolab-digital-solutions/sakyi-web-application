import { http } from '@/lib/api/client';
import type { ApiResponse } from '@/types/api';

/**
 * Query parameters for paginated table requests.
 * Kept in the service layer to avoid services depending on hooks.
 */
export type TableQueryParams = {
  page?: number;
  per_page?: number;
  search?: string;
  [key: string]: unknown;
};

/**
 * Builds a query string from table params. Omits undefined and null.
 */
function buildQueryString(params?: TableQueryParams): string {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    searchParams.append(key, String(value));
  }
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Fetches a single page of table data from the given endpoint.
 *
 * Application-layer use case so that the table hook does not depend on
 * the HTTP client directly.
 *
 * @param endpoint - Full path including optional query string (e.g. "admin/programs?page=1&per_page=10").
 * @returns The API response. Caller must check status and throw or map as needed.
 */
export async function fetchTablePage<T>(
  endpoint: string,
  params?: TableQueryParams,
): Promise<ApiResponse<T>> {
  const queryString = buildQueryString(params);
  const url = params ? `${endpoint}${queryString}` : endpoint;
  return http.get<T>(url, { throwOnError: true });
}
