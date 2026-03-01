'use client';

import { useQuery } from '@tanstack/react-query';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { fetchTablePage } from '@/services/table';

import type {
  TableControls,
  TablePageData,
  TablePagination,
  TableQueryParams,
  TableQueryResponse,
  UseTableHookOptions,
  UseTableReturn,
} from './types';

const TABLE_PARAM_KEYS = ['page', 'per_page', 'search'] as const;

type TableParamKey = (typeof TABLE_PARAM_KEYS)[number];

const buildInitialStateFromUrl = <TItem>(
  searchParams: URLSearchParams,
  options?: UseTableHookOptions<TItem>,
) => {
  const initialPage =
    Number(searchParams.get('page')) || options?.initialPage || 1;
  const initialPerPage =
    Number(searchParams.get('per_page')) || options?.initialPerPage || 10;
  const initialSearch =
    searchParams.get('search') ?? options?.initialSearch ?? '';

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
};

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
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const searchParamsString = searchParams.toString();

  const fromUrl = options?.syncWithUrl
    ? buildInitialStateFromUrl<TItem>(
        new URLSearchParams(searchParamsString),
        options,
      )
    : null;

  const [page, setPage] = useState(
    fromUrl?.initialPage ?? options?.initialPage ?? 1,
  );
  const [perPage, setPerPage] = useState(
    fromUrl?.initialPerPage ?? options?.initialPerPage ?? 10,
  );
  const [search, setSearch] = useState(
    fromUrl?.initialSearch ?? options?.initialSearch ?? '',
  );

  const onSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const params: TableQueryParams = {
    page,
    per_page: perPage,
    ...(search ? { search } : {}),
    ...options?.params,
    ...(options?.syncWithUrl && fromUrl ? fromUrl.extraParamsFromUrl : {}),
  };

  const { placeholderData, ...restOptions } = options ?? {};

  const query = useQuery<TableQueryResponse<TItem>, Error>({
    ...restOptions,
    placeholderData: placeholderData ?? ((prev) => prev),
    queryKey: ['table', endpoint, params],
    queryFn: async () => {
      const response = await fetchTablePage<TablePageData<TItem>>(
        endpoint,
        params,
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

  const controls: TableControls<TItem> = {
    search: {
      value: search,
      onChange: onSearchChange,
    },
    perPage: {
      value: perPage,
      onChange: setPerPage,
    },
    pagination: {
      page,
      onPageChange: setPage,
      meta: pagination,
    },
    isLoading: query.isLoading,
    query,
  };

  // When table state changes via UI interactions, push the new state
  // into the URL query string (while preserving other params).
  useEffect(() => {
    if (!options?.syncWithUrl) return;
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(searchParamsString);

    urlParams.set('page', String(controls.pagination.page));
    urlParams.set('per_page', String(controls.perPage.value));

    if (controls.search.value) {
      urlParams.set('search', controls.search.value);
    } else {
      urlParams.delete('search');
    }

    const nextQuery = urlParams.toString();
    const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;
    const currentUrl = `${window.location.pathname}${window.location.search}`;

    if (nextUrl !== currentUrl) {
      router.replace(nextUrl, { scroll: false });
    }
  }, [
    controls.pagination.page,
    controls.perPage.value,
    controls.search.value,
    options,
    pathname,
    router,
    searchParamsString,
  ]);

  return {
    rows,
    controls,
  };
};

export default useTable;
