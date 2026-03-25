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

import { fetchTablePage } from './fetch';
import { normalizeTableResponse } from './normalize';
import {
  applyUrlParamPatch,
  buildTableRequestParams,
  DEFAULT_TABLE_PARAM_KEYS,
  ensureTableUrlDefaults,
  parseTableUrlParams,
} from './params';
import type {
  TablePaginationMeta,
  TableQueryResponse,
  TableTanstackOptions,
  UseTableOptions,
  UseTableReturn,
} from './types';

const DEFAULT_SEARCH_DEBOUNCE_MS = 300;

/**
 * Returns true when two query strings represent the same key/value pairs
 * (order-insensitive).
 */
export const tableQueriesEqual = (a: string, b: string): boolean => {
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
};

/**
 * Data-fetching hook for admin tables.
 *
 * Provides a unified table query model for list endpoints, including:
 * - URL-synced query params (pagination/search + dynamic filters)
 * - debounced search input
 * - optional pagination / optional search
 * - full TanStack Query capability via a dedicated `tanstack` options object
 *
 * The core rule: when `params.sync` is enabled, the URL is the source of truth.
 * The backend request params are derived from the URL, so the frontend route query
 * string and backend request always match.
 *
 * @template TItem - Row type for each table entry.
 * @param endpoint - Relative API path (e.g. `ENDPOINTS.ADMIN...LIST`).
 * @param options - Params config, search/pagination toggles, and TanStack options.
 * @returns Table rows plus UI controls (search/pagination/params + query state).
 */
export const useTable = <TItem>(
  endpoint: string,
  options: UseTableOptions<TItem> = {},
): UseTableReturn<TItem> => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();

  const paramsOpt = options.params ?? {};
  const paramsEnabled = paramsOpt.enabled !== false;
  const syncUrl = paramsEnabled && paramsOpt.sync === true;
  const writeDefaultsToUrl = syncUrl && (paramsOpt.writeInitialToUrl ?? true);
  const history = paramsOpt.history ?? 'replace';
  const keys = DEFAULT_TABLE_PARAM_KEYS;

  const paginationEnabledRaw = options.pagination?.enabled !== false;
  const searchEnabledRaw = options.search?.enabled !== false;
  /**
   * `params.enabled` is a master switch for table param mechanics.
   * When disabled, search/pagination controls are removed and request params are not derived from URL.
   */
  const paginationEnabled = paramsEnabled && paginationEnabledRaw;
  const searchEnabled = paramsEnabled && searchEnabledRaw;
  const debounceMs = options.search?.debounceMs ?? DEFAULT_SEARCH_DEBOUNCE_MS;

  const extraMode = paramsOpt.extra?.mode ?? 'passthrough';
  const extraAllowlist = paramsOpt.extra?.allowlist ?? [];
  const resetPageOnChange = paramsOpt.extra?.resetPageOnChange ?? true;
  const cleanExtra = paramsOpt.extra?.clean;

  /** Skips the URL→state sync when the URL change came from our own navigation. */
  const lastWrittenQueryRef = useRef<string | null>(null);
  /** Skips resetting to page 1 when applied search changes due to URL sync. */
  const skipPageResetForUrlSyncRef = useRef(false);

  const navigateToQuery = useCallback(
    (nextQuery: string) => {
      if (typeof window === 'undefined') return;
      const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;
      const currentUrl = `${window.location.pathname}${window.location.search}`;
      if (nextUrl === currentUrl) return;

      lastWrittenQueryRef.current = nextQuery;
      const navigate =
        history === 'push'
          ? router.push.bind(router)
          : router.replace.bind(router);
      navigate(nextUrl, { scroll: false });
    },
    [history, pathname, router],
  );

  const setUrlParams = useCallback(
    (patch: Record<string, unknown>) => {
      if (!syncUrl) return;
      const cleaned = cleanExtra ? cleanExtra(patch) : patch;
      const current = new URLSearchParams(searchParamsString);
      const next = applyUrlParamPatch(current, cleaned);
      navigateToQuery(next.toString());
    },
    [syncUrl, cleanExtra, searchParamsString, navigateToQuery],
  );

  /**
   * If URL sync is enabled, materialize defaults into the URL when missing so URL===request.
   */
  useEffect(() => {
    if (!syncUrl || !writeDefaultsToUrl) return;
    const current = new URLSearchParams(searchParamsString);
    const { next, changed } = ensureTableUrlDefaults({
      current,
      paginationEnabled,
      searchEnabled,
      initial: paramsOpt.initial,
    });
    if (!changed) return;
    navigateToQuery(next.toString());
  }, [
    syncUrl,
    writeDefaultsToUrl,
    searchParamsString,
    keys,
    paginationEnabled,
    searchEnabled,
    paramsOpt.initial,
    navigateToQuery,
  ]);

  /**
   * Clear loop guard when the router reports the same query we wrote.
   */
  useEffect(() => {
    if (!syncUrl) return;
    if (
      lastWrittenQueryRef.current !== null &&
      tableQueriesEqual(lastWrittenQueryRef.current, searchParamsString)
    ) {
      lastWrittenQueryRef.current = null;
    }
  }, [searchParamsString, syncUrl]);

  const parsed = useMemo(() => {
    return parseTableUrlParams(new URLSearchParams(searchParamsString));
  }, [searchParamsString]);

  const extraValues = useMemo(() => {
    if (!syncUrl) return {};
    if (extraMode === 'allowlist') {
      const out: Record<string, string> = {};
      for (const k of extraAllowlist) {
        const v = parsed.extra[k];
        if (v) out[k] = v;
      }
      return out;
    }
    return parsed.extra;
  }, [syncUrl, parsed.extra, extraMode, extraAllowlist]);

  // Local search input for debounce (URL remains source of truth when syncUrl enabled).
  const initialSearchValue = parsed.search ?? '';
  const [searchInput, setSearchInput] = useState(initialSearchValue);
  const [appliedSearch, setAppliedSearch] = useState(initialSearchValue);

  // Align local search state with URL changes (back/forward, external navigation).
  useEffect(() => {
    if (!syncUrl) return;
    skipPageResetForUrlSyncRef.current = true;
    startTransition(() => {
      setSearchInput(initialSearchValue);
      setAppliedSearch(initialSearchValue);
    });
  }, [syncUrl, initialSearchValue]);

  // Debounce applied search.
  useEffect(() => {
    if (!searchEnabled) return;
    if (debounceMs <= 0) {
      startTransition(() => setAppliedSearch(searchInput));
      return;
    }
    const id = window.setTimeout(() => {
      startTransition(() => setAppliedSearch(searchInput));
    }, debounceMs);
    return () => window.clearTimeout(id);
  }, [searchInput, debounceMs, searchEnabled]);

  // Write applied search into URL (source of truth) when enabled.
  useEffect(() => {
    if (!syncUrl || !searchEnabled) return;
    const trimmed = appliedSearch.trim();
    setUrlParams({ [keys.search]: trimmed || null });
  }, [syncUrl, searchEnabled, appliedSearch, keys.search, setUrlParams]);

  // When applied search changes due to typing (not URL sync), reset page to 1.
  const isFirstAppliedSearchEffect = useRef(true);
  useEffect(() => {
    if (!syncUrl || !paginationEnabled || !searchEnabled) return;
    if (isFirstAppliedSearchEffect.current) {
      isFirstAppliedSearchEffect.current = false;
      return;
    }
    if (skipPageResetForUrlSyncRef.current) {
      skipPageResetForUrlSyncRef.current = false;
      return;
    }
    setUrlParams({ [keys.page]: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedSearch]);

  const page = parsed.page ?? Number(paramsOpt.initial?.[keys.page] ?? 1);
  const perPage =
    parsed.perPage ?? Number(paramsOpt.initial?.[keys.perPage] ?? 15);

  const requestParams = useMemo(() => {
    if (!paramsEnabled) return {};
    return buildTableRequestParams({
      page,
      perPage,
      search: searchEnabled ? (syncUrl ? parsed.search : appliedSearch) : null,
      extra: extraValues,
      paginationEnabled,
      searchEnabled,
    });
  }, [
    paramsEnabled,
    page,
    perPage,
    parsed.search,
    appliedSearch,
    extraValues,
    paginationEnabled,
    searchEnabled,
    syncUrl,
  ]);

  const tanstack: TableTanstackOptions<TItem> = options.tanstack ?? {};

  const query = useQuery<TableQueryResponse<TItem>, Error>({
    ...tanstack,
    placeholderData: tanstack.placeholderData ?? ((prev) => prev),
    queryKey: ['table', endpoint, requestParams],
    queryFn: async () => {
      const response = await fetchTablePage(endpoint, requestParams);
      if (response.status !== 'success') {
        throw new Error('Unexpected table API error shape.');
      }
      return response as TableQueryResponse<TItem>;
    },
  });

  const normalizer = options.response?.normalize ?? normalizeTableResponse;
  const { rows, meta } = query.data
    ? normalizer(query.data)
    : { rows: [] as TItem[], meta: null };

  /**
   * When the API returns a bare array without `meta.pagination`, keep the footer usable
   * using the current page slice as a single page.
   */
  const metaResolved: TablePaginationMeta | null =
    meta ??
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

  const onPageChange = useCallback(
    (nextPage: number) => {
      if (!syncUrl || !paginationEnabled) return;
      setUrlParams({ [keys.page]: nextPage });
    },
    [syncUrl, paginationEnabled, setUrlParams, keys.page],
  );

  const onPerPageChange = useCallback(
    (nextPerPage: number) => {
      if (!syncUrl || !paginationEnabled) return;
      setUrlParams({ [keys.perPage]: nextPerPage, [keys.page]: 1 });
    },
    [syncUrl, paginationEnabled, setUrlParams, keys.perPage, keys.page],
  );

  const isDebouncing = debounceMs > 0 && searchInput !== appliedSearch;

  return {
    rows,
    controls: {
      search: searchEnabled
        ? {
            value: searchInput,
            onChange: setSearchInput,
            ...(debounceMs > 0 ? { isDebouncing } : {}),
          }
        : undefined,
      pagination: paginationEnabled
        ? {
            page,
            perPage,
            onPageChange,
            onPerPageChange,
            meta: metaResolved,
          }
        : undefined,
      params: {
        values: extraValues,
        set: (patch) => {
          if (!syncUrl) return;
          const nextPatch = { ...patch };
          if (resetPageOnChange && paginationEnabled) {
            nextPatch[keys.page] = 1;
          }
          if (extraMode === 'allowlist') {
            for (const k of Object.keys(nextPatch)) {
              const isOwned =
                k === keys.page || k === keys.perPage || k === keys.search;
              if (isOwned) continue;
              if (!extraAllowlist.includes(k)) delete nextPatch[k];
            }
          }
          setUrlParams(nextPatch);
        },
        clear: (keysToClear) => {
          if (!syncUrl) return;
          const patch: Record<string, unknown> = {};
          for (const k of keysToClear) patch[k] = null;
          if (resetPageOnChange && paginationEnabled) patch[keys.page] = 1;
          setUrlParams(patch);
        },
      },
      query,
    },
  };
};

