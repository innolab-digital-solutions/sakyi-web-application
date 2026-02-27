import { useQuery } from '@tanstack/react-query';

import { http } from '@/lib/api/client';

import { buildQueryString } from './builders';
import type {
  TablePageData,
  TablePagination,
  TableQueryOptions,
  TableQueryParams,
  TableQueryResponse,
  UseTableReturn,
} from './type';

/**
 * Data-fetching hook for paginated table endpoints.
 *
 * This hook integrates the shared HTTP client with TanStack Query
 * and normalizes the paginated response into a convenient shape
 * for table components.
 *
 * @template TItem - Row/item type contained in the table data array.
 * @param endpoint - Relative API endpoint (e.g. `"admin/users"`).
 * @param params - Optional query string params (page, per_page, filters, etc.).
 * @param options - Additional TanStack Query options (excluding queryKey/queryFn).
 */
export const useTable = <TItem>(
  endpoint: string,
  params?: TableQueryParams,
  options?: TableQueryOptions<TItem>,
): UseTableReturn<TItem> => {
  const { placeholderData, ...restOptions } = options ?? {};

  const query = useQuery<TableQueryResponse<TItem>, Error>({
    ...restOptions,
    placeholderData: placeholderData ?? ((prev) => prev),
    queryKey: ['table', endpoint, params ?? {}],
    queryFn: async () => {
      const queryString = buildQueryString(params);

      const response = await http.get<TablePageData<TItem>>(
        `${endpoint}${queryString}`,
        { throwOnError: false },
      );

      if (response.status === 'error') {
        throw new Error(response.message);
      }

      return response;
    },
  });

  const page = query.data?.data ?? null;
  const rows = page?.data ?? [];
  const pagination: TablePagination<TItem> | null = page
    ? (({ data: _rows, ...meta }) => meta)(page)
    : null;

  return {
    rows,
    pagination,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isSuccess: query.isSuccess,
    isError: query.isError,
    error: query.error ?? null,
    refetch: query.refetch,
  };
};

export default useTable;
