import type { TableParamKeys } from './types';

export const DEFAULT_TABLE_PARAM_KEYS: TableParamKeys = {
  page: 'page',
  perPage: 'per_page',
  search: 'search',
};

export type ParsedTableUrlParams = {
  page: number | null;
  perPage: number | null;
  search: string | null;
  extra: Record<string, string>;
};

/**
 * Parses table-related state from URLSearchParams.
 *
 * - Reads core keys: page/per_page/search (key names are configurable).
 * - Treats all other keys as “extra” dynamic filters (string values only).
 * - Does not apply defaults here; defaults are handled by `ensureTableUrlDefaults`
 *   so the URL and request params remain strictly aligned.
 */
export const parseTableUrlParams = (
  searchParams: URLSearchParams,
): ParsedTableUrlParams => {
  const owned = new Set([
    DEFAULT_TABLE_PARAM_KEYS.page,
    DEFAULT_TABLE_PARAM_KEYS.perPage,
    DEFAULT_TABLE_PARAM_KEYS.search,
  ]);

  const pageRaw = searchParams.get(DEFAULT_TABLE_PARAM_KEYS.page);
  const perPageRaw = searchParams.get(DEFAULT_TABLE_PARAM_KEYS.perPage);
  const searchRaw = searchParams.get(DEFAULT_TABLE_PARAM_KEYS.search);

  const page = pageRaw ? Number(pageRaw) : null;
  const perPage = perPageRaw ? Number(perPageRaw) : null;
  const search =
    searchRaw != null && searchRaw.trim().length > 0 ? searchRaw : null;

  const extra: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    if (owned.has(key)) return;
    if (!value) return;
    extra[key] = value;
  });

  return {
    page: Number.isFinite(page) && page > 0 ? page : null,
    perPage: Number.isFinite(perPage) && perPage > 0 ? perPage : null,
    search,
    extra,
  };
};

export type EnsureTableUrlDefaultsArgs = {
  current: URLSearchParams;
  paginationEnabled: boolean;
  searchEnabled: boolean;
  /**
   * Defaults for core keys and extra filters. Any key present here will be
   * written into the URL when missing.
   */
  initial?: Record<string, unknown>;
};

export type EnsureTableUrlDefaultsResult = {
  next: URLSearchParams;
  changed: boolean;
};

/**
 * Ensures table defaults exist in the URL when missing.
 *
 * This is the “URL as source of truth” rule:
 * - If pagination/search are enabled and keys are missing, write defaults.
 * - If extra filter defaults exist in `initial`, write them if missing.
 *
 * The hook decides when to actually call router.replace/push.
 */
export const ensureTableUrlDefaults = (
  args: EnsureTableUrlDefaultsArgs,
): EnsureTableUrlDefaultsResult => {
  const next = new URLSearchParams(args.current.toString());
  const initial = args.initial ?? {};

  const setIfMissing = (key: string, value: unknown) => {
    if (value === undefined || value === null || value === '') return;
    if (next.get(key) != null) return;
    next.set(key, String(value));
  };

  if (args.paginationEnabled) {
    setIfMissing(
      DEFAULT_TABLE_PARAM_KEYS.page,
      initial[DEFAULT_TABLE_PARAM_KEYS.page] ?? 1,
    );
    setIfMissing(
      DEFAULT_TABLE_PARAM_KEYS.perPage,
      initial[DEFAULT_TABLE_PARAM_KEYS.perPage] ?? 15,
    );
  } else {
    next.delete(DEFAULT_TABLE_PARAM_KEYS.page);
    next.delete(DEFAULT_TABLE_PARAM_KEYS.perPage);
  }

  if (args.searchEnabled) {
    setIfMissing(
      DEFAULT_TABLE_PARAM_KEYS.search,
      initial[DEFAULT_TABLE_PARAM_KEYS.search] ?? '',
    );
    if (next.get(DEFAULT_TABLE_PARAM_KEYS.search) === '') {
      next.delete(DEFAULT_TABLE_PARAM_KEYS.search);
    }
  } else {
    next.delete(DEFAULT_TABLE_PARAM_KEYS.search);
  }

  for (const [key, value] of Object.entries(initial)) {
    if (
      key === DEFAULT_TABLE_PARAM_KEYS.page ||
      key === DEFAULT_TABLE_PARAM_KEYS.perPage ||
      key === DEFAULT_TABLE_PARAM_KEYS.search
    ) {
      continue;
    }
    setIfMissing(key, value);
  }

  const changed = next.toString() !== args.current.toString();
  return { next, changed };
};

/**
 * Applies a patch of params onto URLSearchParams.
 *
 * - `null`/`undefined`/'' deletes the key
 * - other values are set as strings
 */
export const applyUrlParamPatch = (
  current: URLSearchParams,
  patch: Record<string, unknown>,
): URLSearchParams => {
  const next = new URLSearchParams(current.toString());
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined || value === null || value === '') {
      next.delete(key);
      continue;
    }
    next.set(key, String(value));
  }
  return next;
};

export type BuildTableRequestParamsArgs = {
  page: number | null;
  perPage: number | null;
  search: string | null;
  extra: Record<string, string>;
  paginationEnabled: boolean;
  searchEnabled: boolean;
};

/**
 * Builds the backend request params object from the current table state.
 *
 * Omits empty values. Preserves numbers for page/per_page and strings for extra filters.
 */
export const buildTableRequestParams = (
  args: BuildTableRequestParamsArgs,
): Record<string, string | number | boolean> => {
  const out: Record<string, string | number | boolean> = {};

  if (args.paginationEnabled) {
    if (args.page != null) out[DEFAULT_TABLE_PARAM_KEYS.page] = args.page;
    if (args.perPage != null)
      out[DEFAULT_TABLE_PARAM_KEYS.perPage] = args.perPage;
  }

  if (args.searchEnabled && args.search != null && args.search.trim().length) {
    out[DEFAULT_TABLE_PARAM_KEYS.search] = args.search.trim();
  }

  for (const [k, v] of Object.entries(args.extra)) {
    if (!v) continue;
    out[k] = v;
  }

  return out;
};

