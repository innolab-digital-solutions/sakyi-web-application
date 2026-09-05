# Table data listing guide

How list/table data fetching and state management work under `lib/table`, and how to use `useTable` from `@/lib/table` across the app (marketing, admin, dashboards, and internal tools). Wider context: [project-architecture.md](./project-architecture.md).

## When to use it

Use `useTable` in Client Components whenever you’re rendering a list/table that benefits from a shared, consistent mechanism for:

- Pagination (optional)
- Search (optional, debounced)
- Deep-linking via URL query params (optional; shareable filtered URLs, back/forward support)
- Consistent TanStack Query behavior (loading/error/refetch, caching, “keep previous data”)
- Extra query params for feature-specific filters/facets (optional)

Do not duplicate URL parsing, debounced search, and pagination wiring in feature code. Prefer `useTable` over calling `http.get` directly from list UI components unless the list intentionally opts out of these behaviors.

## Public imports

Import from `@/lib/table` only:

```ts
import { useTable, getVisiblePageNumbers } from '@/lib/table';
import type {
  TableControls,
  TablePaginationMeta,
  TableParamsOptions,
  TableQueryResponse,
  UseTableOptions,
  UseTableReturn,
} from '@/lib/table';
```

Feature code should not import `lib/table/core.ts`, `params.ts`, `fetch.ts`, `normalize.ts`, or `types.ts` directly. The barrel (`lib/table/index.ts`) is the supported surface.

## What `useTable` returns

`useTable(endpoint, options?)` returns:

- `rows`: normalized row array (always `TItem[]`)
- `controls`:
  - `search` (optional): value + onChange (+ `isDebouncing` when debounced)
  - `pagination` (optional): page/perPage setters + pagination meta
  - `params`: extra param values plus `set`/`clear` helpers (no-op unless URL sync is enabled)
  - `query`: the underlying `useQuery` result (loading/error/refetch states)

## Basic usage

```ts
const { rows, controls } = useTable<RowType>(ENDPOINT, {
  params: {
    enabled: true,
    sync: true,
    writeInitialToUrl: true,
    initial: { page: 1, per_page: 15 },
  },
  search: { enabled: true, debounceMs: 500 },
  pagination: { enabled: true },
});
```

### Expected results (basic usage)

- **If the user visits**: `/admin/things` (no query params)\n and `params.sync: true` + `params.writeInitialToUrl: true`:\n - URL becomes: `/admin/things?page=1&per_page=15`\n - Backend request params: `{ page: 1, per_page: 15 }`\n - `controls.pagination.page === 1`\n - `controls.pagination.perPage === 15`\n
- **If the URL includes a search** (after debounce):\n - URL: `?page=1&per_page=15&search=yoga`\n - Request params include `search: 'yoga'`\n - Page is reset to `1` when search changes due to typing.\n

## Pagination, search, and URL params (flexible options)

All three behaviors are independently configurable:

- `options.pagination.enabled` (default: true)
- `options.search.enabled` (default: true) and `options.search.debounceMs` (default: 500)
- `options.params.enabled` (default: true) and `options.params.sync` (default: false)

Important: `params.enabled` is the master switch for table param mechanics. When `params.enabled === false`, `useTable` removes the search/pagination controls and stops deriving request params from the URL.

### URL sync (deep-linking)

When `options.params.sync === true`, the URL becomes the source of truth for:

- `page`
- `per_page`
- `search`

Defaults can be written into the URL so URL === request:

- `params.writeInitialToUrl` (default: true when sync is true)
- `params.history`: `'replace'` (default) or `'push'`

Core keys come from `TABLE_PARAM_KEYS` in `lib/table/constants.ts`.

### Search debounce and page reset

`useTable` keeps a local `searchInput` for immediate typing and debounces into `appliedSearch` (default 500ms). The API request uses `appliedSearch`, not the URL, so a late `router.replace` for an earlier keystroke cannot fetch a stale term or overwrite the field.

When URL sync is enabled:

- Applied search is written to the URL after the debounce pause
- Page is reset to `1` when applied search changes due to typing
- Back/forward navigation updates local search state without causing a page-reset loop
- In-progress typing is never replaced by a delayed URL update for a previous keystroke

## Extra params (filters/facets)

In addition to `page`, `per_page`, and `search`, `useTable` can preserve and manage arbitrary extra query params for feature-specific filters (status, category, date range, and similar).

Configuration lives under `options.params.extra`:

- `mode: 'passthrough' | 'allowlist'` (default: `'passthrough'`)
- `allowlist`: keys allowed when `mode === 'allowlist'`
- `resetPageOnChange` (default: true): page resets to 1 when extra params change (when pagination is enabled)
- `clean(patch)`: sanitize/transform a patch before writing it to the URL

At runtime:

- `controls.params.values` exposes extra params as a string map
- `controls.params.set(patch)` sets keys (nullish/empty values remove keys)
- `controls.params.clear(keys)` removes keys

### Expected results (extra params)

If you set a filter:

```ts
controls.params.set({ status: 'published' });
```

- URL becomes: `?page=1&per_page=15&status=published`\n- Request params include: `{ page: 1, per_page: 15, status: 'published' }`\n- Page resets to `1` when the filter changes (default behavior)\n

If you clear a filter:

```ts
controls.params.clear(['status']);
```

- URL becomes: `?page=1&per_page=15`\n- Request params no longer include `status`\n

## API response expectations and normalization

`useTable` fetches through `fetchTablePage` → `http.get(url, { throwOnError: true })`:

- Network/HTTP failures throw (React Query exposes these on `controls.query.error`)
- Successful calls are expected to return the standard `ApiSuccess` envelope (`status: 'success'`)

The success payload can be either:

- A simple array: `data: TItem[]`
- A paginated object: `data: { data: TItem[]; current_page; per_page; total; last_page; ... }`

Pagination meta can also be provided in `meta.pagination`. The default normalizer supports both shapes (`lib/table/normalize.ts`).

If the API returns a bare array without `meta.pagination`, `useTable` synthesizes a single-page pagination footer so pagination UI can remain stable when enabled.

### What if pagination is enabled but the backend does not paginate?

If you leave `pagination.enabled: true` but the endpoint returns a bare array with no pagination meta, the hook will:\n

- still render `rows` normally\n- synthesize `controls.pagination.meta` as a **single page** (`last_page: 1`, `has_more_pages: false`)\n- disable next-page navigation in typical UI\n

Recommendation: for endpoints that truly don’t paginate, set `pagination: { enabled: false }`.\n

You can override response normalization with:

- `options.response.normalize(response)` → `{ rows, meta }`

Use this when an endpoint returns a success envelope but the `data` shape needs a custom extractor.

## TanStack Query behavior

`useTable` owns the query key and query function:

- `queryKey`: `['table', endpoint, requestParams]`
- `placeholderData`: defaults to “keep previous data” (`prev => prev`)

Pass `options.tanstack` to tune TanStack Query behavior (for example `staleTime`, `enabled`, `retry`, `refetchOnWindowFocus`), but do not set `queryKey` or `queryFn` (they are intentionally managed by `lib/table`).

## Pagination UI helper

Use `getVisiblePageNumbers(currentPage, lastPage, maxButtons = 5)` to render page number buttons in a compact pagination bar.

## Examples in this repository

Search for `useTable(` across components and route screens that render lists. `project-architecture.md` mentions `components/admin/layout/TableLayout.tsx` as a consumer of `TableControls`, but `useTable` is not restricted to admin usage.

## New list/table checklist

- Use `useTable` from `@/lib/table` (not internal files).
- Decide whether you need URL sync (`params.sync: true`) for shareable filtered URLs.
- Keep endpoint strings in `config/api/endpoints` (don’t hard-code paths).
- If you add custom filters, manage them as extra params via `controls.params.set/clear`.
- Ensure the backend response matches one of the supported success shapes (array payload or paginated payload) and uses the standard `ApiSuccess` envelope.
