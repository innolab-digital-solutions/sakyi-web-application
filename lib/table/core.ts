'use client';

import { useQuery } from '@tanstack/react-query';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import type {
  TableControls,
  TableListPayload,
  TablePaginationMeta,
  TableQueryParams,
  TableQueryResponse,
  UseTableHookOptions,
  UseTableReturn,
} from './types';
import {
  buildInitialStateFromUrl,
  fetchTablePage,
  normalizeTableResponse,
  tableQueriesEqual,
} from './utils';

const DEFAULT_PAGE = 1;
const DEFAULT_PER_PAGE = 15;
const DEFAULT_SEARCH_DEBOUNCE_MS = 300;

/**
 * Data-fetching hook for paginated table endpoints.
 *
 * Owns pagination and search state, keeps URL query params in sync with the API
 * when `syncWithUrl` is enabled, and exposes TanStack Query plus control props
 * for table layouts (`TableListWrapper`, etc.).
 *
 * Search is debounced by default so the API and URL update after typing pauses;
 * the search field still updates on every keystroke.
 *
 * @template TItem - Row type for each table entry.
 * @param endpoint - Relative API path (e.g. `"lookup/goals"`).
 * @param options - URL sync, initial values, extra filters, and `useQuery` options.
 */
export const useTable = <TItem>(
  endpoint: string,
  options?: UseTableHookOptions<TItem>,
): UseTableReturn<TItem> => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const searchParamsString = searchParams.toString();

  const {
    syncWithUrl,
    initialPage,
    initialPerPage,
    initialSearch,
    params: optionParams,
    placeholderData,
    searchDebounceMs = DEFAULT_SEARCH_DEBOUNCE_MS,
    ...queryOptions
  } = options ?? {};

  const debounceMs = searchDebounceMs;

  const fromUrl = syncWithUrl
    ? buildInitialStateFromUrl(new URLSearchParams(searchParamsString), {
        initialPage,
        initialPerPage,
        initialSearch,
      })
    : null;

  /** Skips the URL→state sync when the URL change came from our own `router.replace`. */
  const lastWrittenQueryRef = useRef<string | null>(null);

  /** Skips resetting to page 1 when `appliedSearch` changes due to URL sync. */
  const skipPageResetForUrlSyncRef = useRef(false);

  const extraParamsFromUrl = useMemo(() => {
    if (!syncWithUrl) return {};
    return buildInitialStateFromUrl(
      new URLSearchParams(searchParamsString),
      {
        initialPage,
        initialPerPage,
        initialSearch,
      },
    ).extraParamsFromUrl;
  }, [syncWithUrl, searchParamsString, initialPage, initialPerPage, initialSearch]);

  const initialSearchValue = fromUrl?.initialSearch ?? initialSearch ?? '';

  const [page, setPage] = useState(
    () => fromUrl?.initialPage ?? initialPage ?? DEFAULT_PAGE,
  );
  const [perPage, setPerPage] = useState(
    () => fromUrl?.initialPerPage ?? initialPerPage ?? DEFAULT_PER_PAGE,
  );
  const [searchInput, setSearchInput] = useState(initialSearchValue);
  const [appliedSearch, setAppliedSearch] = useState(initialSearchValue);

  /** Commit draft search to the query after the debounce window (or immediately if debounce is 0). */
  useEffect(() => {
    if (debounceMs <= 0) {
      setAppliedSearch(searchInput);
      return;
    }
    const id = window.setTimeout(() => {
      setAppliedSearch(searchInput);
    }, debounceMs);
    return () => window.clearTimeout(id);
  }, [searchInput, debounceMs]);

  /**
   * When the applied search term changes from user typing (not from URL sync),
   * reset to the first page.
   */
  const isFirstAppliedSearchEffect = useRef(true);
  useEffect(() => {
    if (isFirstAppliedSearchEffect.current) {
      isFirstAppliedSearchEffect.current = false;
      return;
    }
    if (skipPageResetForUrlSyncRef.current) {
      skipPageResetForUrlSyncRef.current = false;
      return;
    }
    setPage(1);
  }, [appliedSearch]);

  /**
   * Clears the ref when the router reports the same query we wrote. Does not
   * overwrite local state from the URL here — doing so races with
   * `router.replace` (stale `searchParams` would reset search / per-page while
   * the user is typing or before the URL updates).
   */
  useEffect(() => {
    if (!syncWithUrl) return;
    if (
      lastWrittenQueryRef.current !== null &&
      tableQueriesEqual(lastWrittenQueryRef.current, searchParamsString)
    ) {
      lastWrittenQueryRef.current = null;
    }
  }, [searchParamsString, syncWithUrl]);

  /**
   * Back/forward: align table state with the URL (browser history), not from
   * the replace loop above.
   */
  useEffect(() => {
    if (!syncWithUrl) return;

    const onPopState = () => {
      const next = buildInitialStateFromUrl(
        new URLSearchParams(window.location.search),
        {
          initialPage,
          initialPerPage,
          initialSearch,
        },
      );
      lastWrittenQueryRef.current = null;
      skipPageResetForUrlSyncRef.current = true;
      startTransition(() => {
        setPage(next.initialPage);
        setPerPage(next.initialPerPage);
        setSearchInput(next.initialSearch);
        setAppliedSearch(next.initialSearch);
      });
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [syncWithUrl, initialPage, initialPerPage, initialSearch]);

  const onPerPageChange = useCallback((nextPerPage: number) => {
    setPerPage(nextPerPage);
    setPage(1);
  }, []);

  const params: TableQueryParams = useMemo(() => {
    const search = appliedSearch.trim();
    return {
      page,
      per_page: perPage,
      ...(search ? { search } : {}),
      ...optionParams,
      ...extraParamsFromUrl,
    };
  }, [page, perPage, appliedSearch, optionParams, extraParamsFromUrl]);

  const query = useQuery<TableQueryResponse<TItem>, Error>({
    ...queryOptions,
    placeholderData: placeholderData ?? ((prev) => prev),
    queryKey: ['table', endpoint, params],
    queryFn: async () => {
      const response = await fetchTablePage<TableListPayload<TItem>>(endpoint, params);

      if (response.status !== 'success') {
        throw new Error('Unexpected table API error shape.');
      }

      return response as TableQueryResponse<TItem>;
    },
  });

  const { rows, meta: paginationMeta } = query.data
    ? normalizeTableResponse(query.data)
    : { rows: [] as TItem[], meta: null };

  /**
   * When the API returns a bare array without `meta.pagination`, keep the footer
   * usable (range + pagination) using the current page slice as a single page.
   */
  const paginationMetaResolved: TablePaginationMeta | null =
    paginationMeta ??
    (query.isSuccess && query.data?.status === 'success'
      ? {
          current_page: page,
          per_page: perPage,
          last_page: 1,
          total: rows.length,
          from: rows.length > 0 ? 1 : 0,
          to: rows.length,
          has_more_pages: false,
        }
      : null);

  const isDebouncing =
    debounceMs > 0 && searchInput !== appliedSearch;

  const controls: TableControls<TItem> = {
    search: {
      value: searchInput,
      onChange: setSearchInput,
      ...(debounceMs > 0 ? { isDebouncing } : {}),
    },
    perPage: {
      value: perPage,
      onChange: onPerPageChange,
    },
    pagination: {
      page,
      onPageChange: setPage,
      meta: paginationMetaResolved,
    },
    isLoading: query.isFetching,
    query,
  };

  useEffect(() => {
    if (!syncWithUrl) return;
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(searchParamsString);

    urlParams.set('page', String(page));
    urlParams.set('per_page', String(perPage));

    const trimmed = appliedSearch.trim();
    if (trimmed) {
      urlParams.set('search', trimmed);
    } else {
      urlParams.delete('search');
    }

    const nextQuery = urlParams.toString();
    const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;
    const currentUrl = `${window.location.pathname}${window.location.search}`;

    if (nextUrl !== currentUrl) {
      lastWrittenQueryRef.current = nextQuery;
      router.replace(nextUrl, { scroll: false });
    }
  }, [
    page,
    perPage,
    appliedSearch,
    pathname,
    router,
    searchParamsString,
    syncWithUrl,
  ]);

  return {
    rows,
    controls,
  };
};

export default useTable;
