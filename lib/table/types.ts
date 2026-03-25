import type {
  QueryKey,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';

import type { ApiSuccess } from '@/types/api';

/** Query parameters merged into paginated list requests (URL and API stay aligned). */
export type TableQueryParams = {
  page?: number;
  per_page?: number;
  search?: string;
  [key: string]: unknown;
};

/**
 * Laravel-style paginator embedded in `data` (alternative to top-level array + meta.pagination).
 */
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

/**
 * Pagination block returned under `meta.pagination` for list endpoints.
 */
export type TablePaginationMeta = {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number | null;
  to: number | null;
  has_more_pages?: boolean;
  path?: string;
  next_page_url?: string | null;
  prev_page_url?: string | null;
};

export type TableListPayload<TItem> = TItem[] | TablePageData<TItem>;

/**
 * Successful list response: either a bare array in `data` with `meta.pagination`,
 * or an embedded paginator object in `data`.
 */
export type TableQueryResponse<TItem> = ApiSuccess<
  TableListPayload<TItem>,
  {
    pagination?: TablePaginationMeta;
    [key: string]: unknown;
  }
>;

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
 * Options for `useTable`: URL sync, initial UI state, extra filters, and TanStack Query options.
 */
export interface UseTableHookOptions<TItem> extends TableQueryOptions<TItem> {
  /**
   * When true, page, per_page, and search are read from and written to the URL
   * so `?search=&page=&per_page=` matches the API request.
   */
  syncWithUrl?: boolean;

  initialPage?: number;
  initialPerPage?: number;
  initialSearch?: string;
  /**
   * Milliseconds to wait after the last keystroke before applying search to the query and URL.
   * Set to `0` to apply on every change (no debounce).
   * @default 300
   */
  searchDebounceMs?: number;
  /** Additional query params merged with page, per_page, and search (e.g. filters). */
  params?: Omit<TableQueryParams, 'page' | 'per_page' | 'search'>;
}

/**
 * Config for search controls in table layouts.
 */
export interface TableSearchConfig {
  /** Current input value (updates on every keystroke). */
  value: string;
  onChange: (value: string) => void;
  /**
   * True while the input has not yet been applied to the list query (debounce window).
   * Omitted when `searchDebounceMs` is 0 or debouncing is disabled.
   */
  isDebouncing?: boolean;
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
export interface TablePaginationConfig {
  page: number;
  onPageChange: (page: number) => void;
  /** Normalized API pagination; null before the first successful load. */
  meta: TablePaginationMeta | null;
}

/**
 * Grouped table control props for layout components (search, page size, pagination, query).
 */
export interface TableControls<TItem = unknown> {
  search: TableSearchConfig;
  perPage: TablePerPageConfig;
  pagination: TablePaginationConfig;

  isLoading: boolean;

  query: UseQueryResult<TableQueryResponse<TItem>, Error>;
}

export interface UseTableReturn<TItem> {
  rows: TItem[];
  controls: TableControls<TItem>;
}
