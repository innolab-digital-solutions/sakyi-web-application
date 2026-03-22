import { http } from '@/lib/api/client';
import type { ApiResponse } from '@/types/api';

import type {
  TablePageData,
  TablePaginationMeta,
  TableQueryParams,
  TableQueryResponse,
} from './types';

/** Core keys owned by the table hook; other URL keys are passed through to the API. */
export const TABLE_PARAM_KEYS = ['page', 'per_page', 'search'] as const;

export type TableParamKey = (typeof TABLE_PARAM_KEYS)[number];

/**
 * Returns true when two query strings represent the same key/value pairs
 * (order-insensitive).
 */
export function tableQueriesEqual(a: string, b: string): boolean {
  const A = new URLSearchParams(a);
  const B = new URLSearchParams(b);
  const keysA = [...new Set([...A.keys()])].sort();
  const keysB = [...new Set([...B.keys()])].sort();
  if (keysA.length !== keysB.length) return false;
  for (let i = 0; i < keysA.length; i += 1) {
    if (keysA[i] !== keysB[i]) return false;
  }
  for (const key of keysA) {
    if (A.get(key) !== B.get(key)) return false;
  }
  return true;
}

/**
 * Serializes table query params into a query string for GET requests.
 * Omits undefined/null; coerces numbers and booleans to strings.
 */
export function buildTableQueryString(params?: TableQueryParams): string {
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
 * Fetches one page of a paginated list using the shared HTTP client.
 */
export async function fetchTablePage<T>(
  endpoint: string,
  params?: TableQueryParams,
): Promise<ApiResponse<T>> {
  const queryString = buildTableQueryString(params);
  const url = params ? `${endpoint}${queryString}` : endpoint;
  return http.get<T>(url, { throwOnError: true });
}

/**
 * Reads page, per_page, search, and any extra query keys from the current URL
 * so API params stay aligned with `?search=&page=&per_page=`.
 */
export function buildInitialStateFromUrl(
  searchParams: URLSearchParams,
  options?: { initialPage?: number; initialPerPage?: number; initialSearch?: string },
) {
  const initialPage = Number(searchParams.get('page')) || options?.initialPage || 1;
  const initialPerPage =
    Number(searchParams.get('per_page')) || options?.initialPerPage || 15;
  const initialSearch = searchParams.get('search') ?? options?.initialSearch ?? '';

  const extraParamsFromUrl: TableQueryParams = {};

  searchParams.forEach((value, key) => {
    if (TABLE_PARAM_KEYS.includes(key as TableParamKey)) return;
    if (!value) return;
    extraParamsFromUrl[key] = value;
  });

  return {
    initialPage,
    initialPerPage,
    initialSearch,
    extraParamsFromUrl,
  };
}

/**
 * Normalizes Laravel-style list responses:
 * - `data: T[]` with `meta.pagination` (this project’s API)
 * - `data: { data: T[], current_page, ... }` (embedded paginator)
 */
export function normalizeTableResponse<TItem>(
  response: TableQueryResponse<TItem>,
): { rows: TItem[]; meta: TablePaginationMeta | null } {
  if (response.status !== 'success') {
    return { rows: [], meta: null };
  }

  const payload = response.data as unknown;

  if (Array.isArray(payload)) {
    const pagination = response.meta?.pagination;
    if (pagination && typeof pagination === 'object') {
      return { rows: payload, meta: pagination as TablePaginationMeta };
    }
    return { rows: payload, meta: null };
  }

  if (
    payload &&
    typeof payload === 'object' &&
    'data' in payload &&
    Array.isArray((payload as TablePageData<TItem>).data)
  ) {
    const pageData = payload as TablePageData<TItem>;
    const { data: rows, ...meta } = pageData;
    return { rows, meta: meta as unknown as TablePaginationMeta };
  }

  return { rows: [], meta: null };
}

/**
 * Builds a compact list of page numbers to show in the pagination control
 * (current window with first/last when needed).
 */
export function getVisiblePageNumbers(
  currentPage: number,
  lastPage: number,
  maxButtons = 5,
): number[] {
  if (lastPage < 1) return [1];
  const safeLast = Math.max(1, lastPage);
  const current = Math.min(Math.max(1, currentPage), safeLast);

  if (safeLast <= maxButtons) {
    return Array.from({ length: safeLast }, (_, i) => i + 1);
  }

  const half = Math.floor(maxButtons / 2);
  let start = Math.max(1, current - half);
  let end = Math.min(safeLast, start + maxButtons - 1);
  start = Math.max(1, end - maxButtons + 1);

  const pages: number[] = [];
  for (let p = start; p <= end; p += 1) pages.push(p);
  return pages;
}
