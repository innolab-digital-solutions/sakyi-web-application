import type {
  QueryKey,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';

import type { ApiSuccess } from '@/types/api';
import type { Pagination } from '@/types/meta';

/**
 * Maps semantic table parameter keys to their corresponding query string key names.
 * Used for customizing the core keys for page, perPage, and search params.
 *
 * @example
 * {
 *   page: 'page',
 *   perPage: 'per_page',
 *   search: 'search'
 * }
 */
export type TableParamKeys = {
  page: string;
  perPage: string;
  search: string;
};

/**
 * Represents table-related parameters as parsed from the URL.
 *
 * - `page`, `perPage`, and `search` refer to core pagination and filtering state.
 * - `extra` includes all other dynamic string params found in the URL (for additional filtering/facets).
 */
export type ParsedTableUrlParams = {
  page: number | null;
  perPage: number | null;
  search: string | null;
  extra: Record<string, string>;
};

/**
 * General-purpose query params for table requests.
 * Keys are strings; values can be any type.
 */
export type TableQueryParams = Record<string, unknown>;

/**
 * Pagination metadata for table responses.
 * Re-exports the shape from the domain Pagination type.
 */
export type TablePaginationMeta = Pagination;

/**
 * Represents a paginated response payload for a table endpoint.
 *
 * @template TItem - The type for each row/item in the table.
 * @property {TItem[]} data - Array of items for the current page.
 * @property {number} current_page - The current page number.
 * @property {string | null} first_page_url - URL for the first page, if available.
 * @property {number | null} from - The starting item number.
 * @property {number} last_page - The last available page number.
 * @property {string | null} last_page_url - URL for the last page, if available.
 * @property {Array<Object>} links - Page link objects for building pagination UI.
 * @property {string | null} next_page_url - URL for the next page, if available.
 * @property {string} path - Base path for the resource requests.
 * @property {number} per_page - Number of items per page.
 * @property {string | null} prev_page_url - URL for the previous page, if available.
 * @property {number | null} to - The ending item number.
 * @property {number} total - The total number of items.
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
 * Top-level list response shape for a table query.
 * Supports either a paginated object (TablePageData) or a simple array.
 */
export type TableListPayload<TItem> = TItem[] | TablePageData<TItem>;

/**
 * API response type for a table query, augmenting the payload with optional pagination meta.
 *
 * @template TItem - Item type for the table rows.
 */
export type TableQueryResponse<TItem> = ApiSuccess<
  TableListPayload<TItem>,
  {
    pagination?: TablePaginationMeta;
    [key: string]: unknown;
  }
>;

/**
 * Forwarded options for `@tanstack/react-query` useQuery, but disallows queryKey and queryFn,
 * which are auto-managed by the table utility.
 *
 * @template TItem - Item type for the table rows.
 */
export type TableTanstackOptions<TItem> = Omit<
  UseQueryOptions<
    TableQueryResponse<TItem>,
    Error,
    TableQueryResponse<TItem>,
    QueryKey
  >,
  'queryKey' | 'queryFn'
>;

/**
 * Table params (URL/query string) sync and management options.
 *
 * - Controls URL sync, defaults writing, history mode, and advanced behaviors for "extra" custom filters.
 */
export type TableParamsOptions = {
  enabled?: boolean;
  sync?: boolean;
  writeInitialToUrl?: boolean;
  initial?: Record<string, unknown>;
  history?: 'replace' | 'push';
  extra?: {
    mode?: 'passthrough' | 'allowlist';
    allowlist?: readonly string[];
    resetPageOnChange?: boolean;
    clean?: (next: Record<string, unknown>) => Record<string, unknown>;
  };
};

/**
 * High-level options for table utility behavior and configuration.
 *
 * @template TItem - Row/item type.
 */
export type UseTableOptions<TItem> = {
  params?: TableParamsOptions;
  pagination?: { enabled?: boolean };
  search?: { enabled?: boolean; debounceMs?: number };
  tanstack?: TableTanstackOptions<TItem>;
  response?: {
    /**
     * Normalizes a full API table response (including pagination) into flat rows plus meta.
     */
    normalize?: (response: TableQueryResponse<TItem>) => {
      rows: TItem[];
      meta: TablePaginationMeta | null;
    };
  };
};

/**
 * Controls state and events for a table's search box, if enabled.
 */
export type TableSearchControls = {
  value: string;
  onChange: (value: string) => void;
  isDebouncing?: boolean;
};

/**
 * Controls and state for table pagination (page/perPage) UI.
 */
export type TablePaginationControls = {
  page: number;
  perPage: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  meta: TablePaginationMeta | null;
};

/**
 * Parameter/filter controls for manipulating extra params via the URL or state.
 */
export type TableParamsControls = {
  values: Record<string, string>;
  set: (patch: Record<string, unknown>) => void;
  clear: (keys: readonly string[]) => void;
};

/**
 * All controls and state exposed by the table utility, including search, pagination, params, and query state.
 *
 * @template TItem - Row/item type.
 */
export type TableControls<TItem> = {
  search?: TableSearchControls;
  pagination?: TablePaginationControls;
  params: TableParamsControls;
  query: UseQueryResult<TableQueryResponse<TItem>, Error>;
};

/**
 * Return value from the useTable hook/utility.
 * Contains normalized rows and all table UI/query controls.
 *
 * @template TItem - Row/item type.
 */
export type UseTableReturn<TItem> = {
  rows: TItem[];
  controls: TableControls<TItem>;
};

/**
 * Arguments for ensuring default values are applied to table-related URL search parameters.
 *
 * @property {URLSearchParams} current - The current set of URL search parameters.
 * @property {boolean} paginationEnabled - Whether table pagination is enabled.
 * @property {boolean} searchEnabled - Whether table search is enabled.
 * @property {Record<string, unknown>=} initial - Optional object containing initial values for other URL parameters.
 */
export type EnsureTableUrlDefaultsArgs = {
  current: URLSearchParams;
  paginationEnabled: boolean;
  searchEnabled: boolean;
  initial?: Record<string, unknown>;
};

/**
 * Result of applying default table URL parameters.
 *
 * @property {URLSearchParams} next - The resulting URLSearchParams object after applying defaults.
 * @property {boolean} changed - Indicates if any parameters were changed.
 */
export type EnsureTableUrlDefaultsResult = {
  next: URLSearchParams;
  changed: boolean;
};

/**
 * Arguments for building the API request parameters used by the table utility.
 *
 * @property {number | null} page - The current page number, or null if pagination is disabled or not set.
 * @property {number | null} perPage - The number of items per page, or null if pagination is disabled or not set.
 * @property {string | null} search - The current search value, or null if search is disabled or not set.
 * @property {Record<string, string>} extra - Additional custom parameters included in the request.
 * @property {boolean} paginationEnabled - Whether table pagination is enabled.
 * @property {boolean} searchEnabled - Whether table search is enabled.
 */
export type BuildTableRequestParamsArgs = {
  page: number | null;
  perPage: number | null;
  search: string | null;
  extra: Record<string, string>;
  paginationEnabled: boolean;
  searchEnabled: boolean;
};
