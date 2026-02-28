import { useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { http } from '@/lib/api/client';

import { buildQueryString } from './builders';
import type {
  TablePageData,
  TablePagination,
  TableQueryParams,
  TableQueryResponse,
  UseTableHookOptions,
  UseTableReturn,
} from './type';

/**
 * Data-fetching hook for paginated table endpoints.
 *
 * Owns pagination and search state (page, perPage, search) and resets to the
 * first page when search changes. Integrates the shared HTTP client with
 * TanStack Query and returns rows, pagination, and layout props for table UIs.
 *
 * @template TItem - Row/item type contained in the table data array.
 * @param endpoint - Relative API endpoint (e.g. `"admin/programs"`).
 * @param options - Initial state, extra params (e.g. filters), and TanStack Query options.
 */
export const useTable = <TItem>(
  endpoint: string,
  options?: UseTableHookOptions<TItem>,
): UseTableReturn<TItem> => {
  const [page, setPage] = useState(options?.initialPage ?? 1);
  const [perPage, setPerPage] = useState(options?.initialPerPage ?? 10);
  const [search, setSearch] = useState(options?.initialSearch ?? '');

  const onSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const params: TableQueryParams = {
    page,
    per_page: perPage,
    ...(search ? { search } : {}),
    ...options?.params,
  };

  const { placeholderData, ...restOptions } = options ?? {};

  const query = useQuery<TableQueryResponse<TItem>, Error>({
    ...restOptions,
    placeholderData: placeholderData ?? ((prev) => prev),
    queryKey: ['table', endpoint, params],
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

  const pageData = query.data?.data ?? null;
  const rows = pageData?.data ?? [];
  const pagination: TablePagination<TItem> | null = pageData
    ? (({ data: _rows, ...meta }) => meta)(pageData)
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
    page,
    perPage,
    search,
    onPageChange: setPage,
    onPerPageChange: setPerPage,
    onSearchChange,
  };
};

export default useTable;
