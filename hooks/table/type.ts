import type {
  QueryKey,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';

import type { ApiSuccess } from '@/lib/api/client';

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

export type TableQueryParams = {
  page?: number;
  per_page?: number;
  [key: string]: unknown;
};

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
 * Pagination metadata derived from the backend response,
 * excluding the row data array.
 */
export type TablePagination<TItem> = Omit<TablePageData<TItem>, 'data'>;

export interface UseTableReturn<TItem> {
  /**
   * Flattened list of row items for rendering the table.
   */
  rows: TItem[];

  /**
   * Pagination information for the current result set.
   */
  pagination: TablePagination<TItem> | null;

  /**
   * Derived React Query status flags.
   */
  isLoading: boolean;
  isFetching: boolean;
  isSuccess: boolean;
  isError: boolean;

  /**
   * Normalized error instance, if any.
   */
  error: Error | null;

  /**
   * Refetch helper for manually reloading the table.
   */
  refetch: UseQueryResult<TableQueryResponse<TItem>, Error>['refetch'];
}
