## Table library examples (`@/lib/table`)

This document shows **how to use** `useTable` from `@/lib/table`, and what the **expected output** looks like:
- **URL query string** on the frontend route (when `params.sync=true`)
- **backend request params** sent to the endpoint
- **hook return shape** you get in the component

> Notes
> - When `params.sync=true`, the **URL is the source of truth**, and the backend request params are derived from the URL.
> - When `params.writeInitialToUrl=true`, missing defaults are **written into the URL** (so URL === request).

---

### Example 1: Basic table (URL sync + defaults written into URL)

```ts
import { useTable } from '@/lib/table';

const { rows, controls } = useTable<MyRow>(ENDPOINTS.ADMIN.MODULES.PROGRAMS.LIST, {
  params: {
    enabled: true,
    sync: true,
    writeInitialToUrl: true,
    initial: {
      page: 1,
      per_page: 15,
    },
  },
});
```

#### Expected result
- **If the user visits**: `/admin/programs` (no query params)
- **The library writes URL defaults** to:
  - `/admin/programs?page=1&per_page=15`
- **Backend request** to:
  - `ENDPOINTS.ADMIN.MODULES.PROGRAMS.LIST?page=1&per_page=15`
- **Return shape**:
  - `rows`: `MyRow[]`
  - `controls.search.value`: `''` (unless URL had `search`)
  - `controls.pagination.page`: `1`
  - `controls.pagination.perPage`: `15`
  - `controls.params.values`: `{}` (no dynamic filters yet)

---

### Example 2: Debounced search (URL + backend kept in sync)

```ts
const { rows, controls } = useTable<MyRow>(ENDPOINTS.ADMIN.MODULES.PROGRAMS.LIST, {
  params: { enabled: true, sync: true, writeInitialToUrl: true },
  search: { enabled: true, debounceMs: 300 },
});

// In your UI
controls.search?.onChange('yoga');
```

#### Expected result
- While typing (within 300ms):
  - `controls.search.isDebouncing === true`
  - URL may still be: `?page=1&per_page=15` (no `search` yet)
- After 300ms without typing:
  - URL becomes: `?page=1&per_page=15&search=yoga`
  - Backend request params include: `{ page: 1, per_page: 15, search: 'yoga' }`
  - Page resets to 1 when search changes (because URL changes `search` and the hook writes `page=1`).

---

### Example 3: Dynamic filters (extra params) with `controls.params.set/clear`

Scenario: You have a Status dropdown in UI, but the **filter is a backend param** (not local frontend filtering).

```ts
const { rows, controls } = useTable<MyRow>(ENDPOINTS.ADMIN.MODULES.UNITS.LIST, {
  params: { enabled: true, sync: true, writeInitialToUrl: true },
});

// Set filter -> writes to URL -> backend request follows URL
controls.params.set({ status: 'published' });

// Clear filter
controls.params.clear(['status']);
```

#### Expected result
- After `controls.params.set({ status: 'published' })`:
  - URL: `?page=1&per_page=15&status=published`
  - Backend request params: `{ page: 1, per_page: 15, status: 'published' }`
  - Page resets to 1 (default behavior)
- After `controls.params.clear(['status'])`:
  - URL: `?page=1&per_page=15`
  - Backend request params: `{ page: 1, per_page: 15 }`

---

### Example 4: Allowlist extra params (safety / consistency)

Only accept a known set of dynamic filters from the URL.

```ts
const { rows, controls } = useTable<MyRow>(ENDPOINTS.ADMIN.MODULES.PROGRAMS.LIST, {
  params: {
    enabled: true,
    sync: true,
    writeInitialToUrl: true,
    extra: {
      mode: 'allowlist',
      allowlist: ['status', 'type', 'is_active'],
    },
  },
});
```

#### Expected result
- If URL is: `?page=1&per_page=15&status=draft&unknown=123`
  - `controls.params.values` includes only: `{ status: 'draft' }`
  - Backend request params do **not** include `unknown`.

---

### Example 5: Write default filter values into the URL

This is useful for a “default filtered view” where URL must show defaults.

```ts
const { rows, controls } = useTable<MyRow>(ENDPOINTS.ADMIN.MODULES.PROGRAMS.LIST, {
  params: {
    enabled: true,
    sync: true,
    writeInitialToUrl: true,
    initial: {
      page: 1,
      per_page: 15,
      status: 'published',
    },
  },
});
```

#### Expected result
- Visiting `/admin/programs` becomes:
  - `/admin/programs?page=1&per_page=15&status=published`
- Backend request includes:
  - `{ page: 1, per_page: 15, status: 'published' }`

---

### Example 6: Disable pagination (no `page` / `per_page` in URL or request)

```ts
const { rows, controls } = useTable<MyRow>(ENDPOINTS.ADMIN.MODULES.SOMETHING.LIST, {
  params: { enabled: true, sync: true, writeInitialToUrl: true },
  pagination: { enabled: false },
});
```

#### Expected result
- URL will **not** include `page` or `per_page` (and existing ones are removed by defaults logic).
- Backend request params do **not** include `page/per_page`.
- `controls.pagination` is `undefined`, so layout can hide pagination UI.

---

### Example 7: Disable search (no `search` in URL or request)

```ts
const { rows, controls } = useTable<MyRow>(ENDPOINTS.ADMIN.MODULES.SOMETHING.LIST, {
  params: { enabled: true, sync: true, writeInitialToUrl: true },
  search: { enabled: false },
});
```

#### Expected result
- URL will **not** include `search` (and existing `search` is removed by defaults logic).
- Backend request params do **not** include `search`.
- `controls.search` is `undefined`, so layout can hide the search input.

---

### Example 8: TanStack Query options (namespaced under `tanstack`)

```ts
const { rows, controls } = useTable<MyRow>(ENDPOINTS.ADMIN.MODULES.PROGRAMS.LIST, {
  params: { enabled: true, sync: true, writeInitialToUrl: true },
  tanstack: {
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    retry: 1,
  },
});
```

#### Expected result
- `controls.query` behaves exactly like `useQuery`, but queryKey includes endpoint + params.
- Use `controls.query.isFetching` for background refetch / busy states.

---

### Example 9: Clean / coerce params before writing to URL (`params.extra.clean`)

This is useful for mapping UI values like `'all'` into “remove key”.

```ts
const { controls } = useTable<MyRow>(endpoint, {
  params: {
    enabled: true,
    sync: true,
    writeInitialToUrl: true,
    extra: {
      clean: (next) => {
        const out = { ...next };

        // Example: UI might send status='all' -> remove it from URL
        if (out.status === 'all') out.status = null;

        // Example: trim strings
        if (typeof out.type === 'string') out.type = out.type.trim();

        return out;
      },
    },
  },
});

controls.params.set({ status: 'all' });
```

#### Expected result
- Instead of `?status=all`, the URL will **delete** `status`.
- Backend request params will not include `status`.

---

### Example 10: Custom response normalization (rare)

If a specific endpoint returns a non-standard shape, override `response.normalize`.

```ts
const { rows, controls } = useTable<MyRow>(endpoint, {
  params: { enabled: true, sync: true, writeInitialToUrl: true },
  response: {
    normalize: (response) => {
      // Example (custom): data is always an array, pagination is nested somewhere else
      const rows = Array.isArray(response.data) ? response.data : [];
      return { rows, meta: response.meta.pagination ?? null };
    },
  },
});
```

#### Expected result
- `rows` always matches your override.
- `controls.pagination.meta` is derived from your override (or the hook’s fallback meta behavior).

---

### Example 11: What you can rely on in the return object

```ts
const { rows, controls } = useTable<MyRow>(endpoint, {
  params: { enabled: true, sync: true, writeInitialToUrl: true },
});

// Always:
rows; // MyRow[]
controls.query; // full TanStack Query result
controls.query.isFetching; // boolean (busy incl. background refetch)
controls.params.values; // dynamic filters from URL

// Optional based on options:
controls.search; // undefined if search.disabled OR params.enabled=false
controls.pagination; // undefined if pagination.disabled OR params.enabled=false
```

