import { TABLE_PARAM_KEYS } from './constants';
import type {
  BuildTableRequestParamsArgs,
  EnsureTableUrlDefaultsArgs,
  EnsureTableUrlDefaultsResult,
  ParsedTableUrlParams,
} from './types';

/**
 * Parses the table-related URL search parameters and extracts standard pagination, search,
 * and any additional parameters into a structured object suitable for table state handling.
 *
 * @param searchParams - The URLSearchParams object containing key-value pairs from the table route.
 * @returns {ParsedTableUrlParams} An object containing parsed `page`, `perPage`, `search`, and `extra` properties:
 *   - `page`: number|null — The page number parameter, converted to a positive integer if present and valid; otherwise null.
 *   - `perPage`: number|null — The per-page parameter, converted to a positive integer if present and valid; otherwise null.
 *   - `search`: string|null — The search value, trimmed if non-empty; otherwise null.
 *   - `extra`: Record<string, string> — Any additional key-value pairs not claimed by standard table parameters.
 *
 * This function is used to centralize and sanitize parsing of table-related params from the browser URL,
 * ensuring consistent handling and easy extension for future param keys.
 */
export const parseTableUrlParams = (
  searchParams: URLSearchParams,
): ParsedTableUrlParams => {
  const owned = new Set([
    TABLE_PARAM_KEYS.page,
    TABLE_PARAM_KEYS.perPage,
    TABLE_PARAM_KEYS.search,
  ]);

  const pageRaw = searchParams.get(TABLE_PARAM_KEYS.page);
  const perPageRaw = searchParams.get(TABLE_PARAM_KEYS.perPage);
  const searchRaw = searchParams.get(TABLE_PARAM_KEYS.search);

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
    page:
      typeof page === 'number' && Number.isFinite(page) && page > 0
        ? page
        : null,
    perPage:
      typeof perPage === 'number' && Number.isFinite(perPage) && perPage > 0
        ? perPage
        : null,
    search,
    extra,
  };
};

/**
 * Ensures URLSearchParams contains default table parameters based on config.
 *
 * Adds missing defaults for pagination or search params as determined by flags and
 * user-provided initial values. If pagination or search is disabled, associated params
 * are removed from the result.
 *
 * - Pagination params (`page`, `perPage`) are set to provided values or sensible defaults (1 & 15) if enabled and missing.
 * - Search param (`search`) is set to initial value or removed if disabled or empty.
 * - Extra keys in `initial` are set if not present already.
 *
 * @param args - Configuration object:
 *   - current: Current URLSearchParams to base defaults upon.
 *   - paginationEnabled: Whether pagination-related params should be enforced.
 *   - searchEnabled: Whether the search param should be enforced.
 *   - initial: Optional object of initial/default param values to apply for keys not present.
 *
 * @returns Object containing:
 *   - next: New URLSearchParams with defaults applied.
 *   - changed: True if resulting params differ from original.
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
    setIfMissing(TABLE_PARAM_KEYS.page, initial[TABLE_PARAM_KEYS.page] ?? 1);
    setIfMissing(
      TABLE_PARAM_KEYS.perPage,
      initial[TABLE_PARAM_KEYS.perPage] ?? 15,
    );
  } else {
    next.delete(TABLE_PARAM_KEYS.page);
    next.delete(TABLE_PARAM_KEYS.perPage);
  }

  if (args.searchEnabled) {
    setIfMissing(
      TABLE_PARAM_KEYS.search,
      initial[TABLE_PARAM_KEYS.search] ?? '',
    );
    if (next.get(TABLE_PARAM_KEYS.search) === '') {
      next.delete(TABLE_PARAM_KEYS.search);
    }
  } else {
    next.delete(TABLE_PARAM_KEYS.search);
  }

  for (const [key, value] of Object.entries(initial)) {
    if (
      key === TABLE_PARAM_KEYS.page ||
      key === TABLE_PARAM_KEYS.perPage ||
      key === TABLE_PARAM_KEYS.search
    ) {
      continue;
    }
    setIfMissing(key, value);
  }

  const changed = next.toString() !== args.current.toString();
  return { next, changed };
};

/**
 * Applies a patch to URLSearchParams by setting or deleting keys based on values.
 *
 * Any patch key with a nullish or empty-string value is deleted from the result.
 * All other keys are set (as stringified).
 *
 * @param current - The base URLSearchParams to apply the patch to.
 * @param patch - Key-value object of changes; nullish/empty values remove keys.
 * @returns A new URLSearchParams with patch applied.
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

/**
 * Builds the parameter object for a table request based on provided arguments.
 *
 * Combines standard pagination and search params (conditionally, depending
 * on enabled flags and presence of values) with any additional params from
 * the `extra` object, omitting any extra keys whose values are falsy.
 *
 * @param args - Table request configuration:
 *   - page: Current page number to include if pagination is enabled,
 *   - perPage: Items per page to include if pagination is enabled,
 *   - search: Search query to include if search is enabled and not empty,
 *   - extra: Additional custom key-value string params to add,
 *   - paginationEnabled: Whether to include pagination params,
 *   - searchEnabled: Whether to include a search param.
 * @returns A params object composed from standard and extra params,
 *          including only enabled, non-empty values.
 */
export const buildTableRequestParams = (
  args: BuildTableRequestParamsArgs,
): Record<string, string | number | boolean> => {
  const out: Record<string, string | number | boolean> = {};

  if (args.paginationEnabled) {
    if (args.page != null) out[TABLE_PARAM_KEYS.page] = args.page;
    if (args.perPage != null) out[TABLE_PARAM_KEYS.perPage] = args.perPage;
  }

  if (args.searchEnabled && args.search != null && args.search.trim().length) {
    out[TABLE_PARAM_KEYS.search] = args.search.trim();
  }

  for (const [k, v] of Object.entries(args.extra)) {
    if (!v) continue;
    out[k] = v;
  }

  return out;
};
