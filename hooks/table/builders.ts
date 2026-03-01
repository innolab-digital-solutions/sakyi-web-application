import type { TableQueryParams } from './types';

/**
 * Build a stable query string from table query parameters.
 *
 * `undefined` and `null` values are omitted entirely.
 */
export const buildQueryString = (params?: TableQueryParams): string => {
  if (!params) return '';

  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    searchParams.append(key, String(value));
  }

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};
