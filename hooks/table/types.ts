import type {
  QueryKey,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';

import type { TableQueryParams } from '@/lib/api/services/table';
import type { ApiSuccess } from '@/types/api';

export type { TableQueryParams };

export interface TablePageData<TItem> {
  data: TItem[];
  current_page: number;
  first_page_url: string | null;
  from: number | null;
  last_page: number;
  last_page_url: string | null;
  links: {
    url: string | null;
    label: string;
    page: number | null;
    active: boolean;
  }[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
}

export type TableQueryResponse<TItem> = ApiSuccess<TablePageData<TItem>>;

export type TableQueryOptions<TItem> = Omit<
  UseQueryOptions<
    TableQueryResponse<TItem>,
    Error,
    TableQueryResponse<TItem>,
    QueryKey
  >,
  'queryKey' | 'queryFn'
>;

/**
 * Options for useTable when the hook owns pagination and search state.
 * Extra params (e.g. filters) are merged with page, per_page, and search.
 */
export interface UseTableHookOptions<TItem> extends TableQueryOptions<TItem> {
  /**
   * When true, useTable will sync its core controls (page, per_page, search)
   * with the URL query string (both read on mount and write on change).
   */
  syncWithUrl?: boolean;

  initialPage?: number;
  initialPerPage?: number;
  initialSearch?: string;
  /** Additional query params merged with page, per_page, search (e.g. filters). */
  params?: Omit<TableQueryParams, 'page' | 'per_page' | 'search'>;
}

/**
 * Pagination metadata derived from the backend response,
 * excluding the row data array.
 */
export type TablePagination<TItem> = Omit<TablePageData<TItem>, 'data'>;

/**
 * Config for search controls in table layouts.
 */
export interface TableSearchConfig {
  value: string;
  onChange: (value: string) => void;
}

/**
 * Config for page size controls (rows per page).
 */
export interface TablePerPageConfig {
  value: number;
  onChange: (perPage: number) => void;
}

/**
 * Config for pagination controls (current page, handler, and API metadata).
 */
export interface TablePaginationConfig<TItem = unknown> {
  page: number;
  onPageChange: (page: number) => void;
  /** API response metadata (total, last_page, links, etc.). Null before first load. */
  meta: TablePagination<TItem> | null;
}

/**
 * Grouped table control props used by layout components.
 *
 * This keeps search, page size, pagination, and loading/query wiring nested
 * and easier to pass around instead of many discrete props.
 */
export interface TableControls<TItem = unknown> {
  search: TableSearchConfig;
  perPage: TablePerPageConfig;
  pagination: TablePaginationConfig<TItem>;

  /**
   * Derived loading state for the table query.
   * This mirrors `query.isLoading` but keeps the consuming components
   * decoupled from React Query's full API surface.
   */
  isLoading: boolean;

  /**
   * Underlying TanStack Query result for advanced consumers.
   * Most components should prefer the higher-level fields above.
   */
  query: UseQueryResult<TableQueryResponse<TItem>, Error>;
}

export interface UseTableReturn<TItem> {
  /** Flattened list of row items for rendering the table. */
  rows: TItem[];

  /** Nested config for controls, loading state, and query meta. */
  controls: TableControls<TItem>;
}
