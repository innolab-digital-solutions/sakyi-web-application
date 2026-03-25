import type {
  QueryKey,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';

import type { ApiSuccess } from '@/types/api';

/**
 * URL key mapping for table-owned query params.
 *
 * This library “owns” a small set of keys for table mechanics (pagination + search).
 * All other keys in the URL are treated as dynamic filters (“extra params”).
 */
export type TableParamKeys = {
  /** URL key for the current page. @default 'page' */
  page: string;
  /** URL key for page size (rows per page). @default 'per_page' */
  perPage: string;
  /** URL key for search term. @default 'search' */
  search: string;
};

/**
 * Dynamic params that are attached to list requests.
 *
 * These come from the URL (when `params.sync` is enabled) and represent
 * backend filters like `status`, `type`, `is_active`, etc.
 */
export type TableQueryParams = Record<string, unknown>;

/**
 * Pagination block returned by list endpoints under `meta.pagination`.
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

/**
 * Laravel-style paginator embedded in `data` (alternative shape used by some APIs).
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

export type TableListPayload<TItem> = TItem[] | TablePageData<TItem>;

/**
 * Successful list response shape used by this project’s API client.
 *
 * Note: meta already includes the shared `Meta` type via `ApiSuccess`.
 */
export type TableQueryResponse<TItem> = ApiSuccess<
  TableListPayload<TItem>,
  {
    pagination?: TablePaginationMeta;
    [key: string]: unknown;
  }
>;

export type TableTanstackOptions<TItem> = Omit<
  UseQueryOptions<TableQueryResponse<TItem>, Error, TableQueryResponse<TItem>, QueryKey>,
  'queryKey' | 'queryFn'
>;

export type TableParamsOptions = {
  /** Master enable switch for param-driven behavior. @default true */
  enabled?: boolean;
  /**
   * When true, the URL search params become the source of truth for request params.
   * @default false
   */
  sync?: boolean;
  /**
   * When true, missing defaults are written into the URL so the URL and backend request
   * remain identical.
   * @default true (when sync is true)
   */
  writeInitialToUrl?: boolean;
  /** Defaults for owned keys and extra filter keys. */
  initial?: Record<string, unknown>;
  /** URL history strategy for param updates. @default 'replace' */
  history?: 'replace' | 'push';
  extra?: {
    /** Controls which extra keys are accepted from the URL. @default 'passthrough' */
    mode?: 'passthrough' | 'allowlist';
    /** When mode is allowlist, only these keys are included and settable. */
    allowlist?: readonly string[];
    /** Reset page to 1 when extra params change. @default true */
    resetPageOnChange?: boolean;
    /** Optional sanitizer/coercer applied before writing values to URL. */
    clean?: (next: Record<string, unknown>) => Record<string, unknown>;
  };
};

export type UseTableOptions<TItem> = {
  params?: TableParamsOptions;
  pagination?: { enabled?: boolean };
  search?: { enabled?: boolean; debounceMs?: number };
  tanstack?: TableTanstackOptions<TItem>;
  response?: {
    normalize?: (
      response: TableQueryResponse<TItem>,
    ) => { rows: TItem[]; meta: TablePaginationMeta | null };
  };
};

export type TableSearchControls = {
  /** Current input value (updates on every keystroke). */
  value: string;
  onChange: (value: string) => void;
  /** True while the input has not yet been applied to the list query (debounce window). */
  isDebouncing?: boolean;
};

export type TablePaginationControls = {
  page: number;
  perPage: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  /** Normalized API pagination; null before the first successful load. */
  meta: TablePaginationMeta | null;
};

export type TableParamsControls = {
  /** Current extra params (dynamic filters) derived from the URL. */
  values: Record<string, string>;
  /**
   * Sets one or more extra params. Pass `null`/`undefined`/'' to delete a key.
   * Updates the URL; request params follow the URL.
   */
  set: (patch: Record<string, unknown>) => void;
  /** Clears one or more keys from the URL. */
  clear: (keys: readonly string[]) => void;
};

export type TableControls<TItem> = {
  search?: TableSearchControls;
  pagination?: TablePaginationControls;
  params: TableParamsControls;
  query: UseQueryResult<TableQueryResponse<TItem>, Error>;
};

export type UseTableReturn<TItem> = {
  rows: TItem[];
  controls: TableControls<TItem>;
};

