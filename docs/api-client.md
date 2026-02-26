## HTTP API Client (`lib/api/client`)

This document describes the custom HTTP client built for this project and how to use it effectively across the codebase.

The client sits in `lib/api/client` and is the **single integration point** between the frontend and the backend HTTP API.

All consumers should import from the barrel:

```ts
import { http, client, apiConfig, ApiClientError } from '@/lib/api/client';
import type { ApiResponse } from '@/lib/api/client';
```

---

## Goals and Design Principles

- **Single, well‑typed entry point** for all HTTP calls.
- **Centralized concerns**:
  - Base URL and versioning
  - CSRF handling (Laravel Sanctum)
  - Credentials and caching
  - Error normalization
  - Request body serialization
- **Safe by default**:
  - Rejects absolute URLs (prevents SSRF / arbitrary host usage).
  - Includes `credentials: 'include'` for cookie‑based auth.
  - Adds CSRF headers for unsafe methods when possible.
- **Flexible error strategy**:
  - `throwOnError: true` → throws `ApiClientError`.
  - `throwOnError: false` → returns `ApiResponse<'error'>`.
- **Next.js‑aware**:
  - Supports `cache` and `next` options (revalidation, tags).

---

## High-Level Architecture

Files in `lib/api/client`:

- `index.ts` – barrel exports (public surface).
- `constants.ts` – default API endpoints and shared messages.
- `config.ts` – runtime API configuration (`apiConfig`).
- `csrf.ts` – reads CSRF cookie (`getCsrfToken`).
- `build.ts` – URL resolution, header building, and body serialization.
- `handlers.ts` – response and error handling helpers.
- `errors.ts` – `ApiClientError` class.
- `types.ts` – shared API/client types.
- `core.ts` – low‑level `client` function that wraps `fetch`.
- `http.ts` – convenience `http.get/post/put/patch/delete` helpers.

### Public API (`index.ts`)

```ts
export { api as apiConfig } from './config';
export { client } from './core';
export { getCsrfToken } from './csrf';
export { ApiClientError } from './errors';
export { http } from './http';
export type {
  ApiError,
  ApiResponse,
  ApiSuccess,
  ClientOptions,
  ClientRequestInit,
  HttpMethod,
  NextFetchCache,
  NextFetchNext,
} from './types';
```

Prefer importing from `@/lib/api/client` instead of deep paths to keep call sites consistent.

---

## Configuration and Base URLs

### `apiConfig` (`config.ts`)

`apiConfig` exposes two computed endpoints:

- `versionEndpoint` – base URL for versioned API routes, e.g. `https://api.../v1`.
- `domainEndpoint` – bare API domain, used for Sanctum endpoints, e.g. `https://api...`.

They are configurable via env vars:

- `NEXT_PUBLIC_API_VERSION_ENDPOINT`
- `NEXT_PUBLIC_API_DOMAIN_ENDPOINT`

If not provided, they fall back to the defaults in `constants.ts`.

### URL resolution (`build.ts`)

All HTTP calls must pass **relative** logical endpoints (e.g. `"admin/auth/login"`, `"sanctum/csrf-cookie"`).

`resolveApiUrl(endpoint: string)`:

- Trims the input and **rejects absolute URLs** (`http://`, `https://`, `//`) by throwing.
- Normalizes leading slashes.
- Routes Sanctum endpoints (those starting with `sanctum/`) to:

  ```ts
  `${apiConfig.domainEndpoint}/${normalizedPath}`;
  ```

- Routes all other endpoints to:

  ```ts
  `${apiConfig.versionEndpoint}/${normalizedPath}`;
  ```

This guarantees:

- A single place that knows how to construct API URLs.
- No accidental calls to arbitrary hosts.

---

## Request Building

### Headers (`buildRequestHeaders`)

`buildRequestHeaders(method, init)`:

- Always includes:

  ```ts
  Accept: 'application/json';
  ```

- Merges any `init.headers` (supports both `Headers` and plain objects).
- For non‑`GET` methods, attempts to read the CSRF token from the `XSRF-TOKEN` cookie using `getCsrfToken()` and, if found, adds:

  ```ts
  'X-XSRF-TOKEN': token;
  ```

This is tailored for Laravel Sanctum’s session‑based CSRF model.

### Body serialization (`serializeRequestBody`)

`serializeRequestBody(body, headers)`:

- If `body` is:
  - `string`, `FormData`, or `URLSearchParams` → passes through unchanged.
  - An object containing any `File` → builds a `FormData` payload (multi‑part).
  - Any other object → JSON‑stringifies and sets `Content-Type: application/json`.
- Returns `{ body: BodyInit | undefined; contentTypeSet: boolean }`.

Callers do not set `Content-Type` themselves; they pass plain objects and let the client handle it.

---

## Core Client (`core.ts`)

### `client<T>(endpoint: string, options?: ClientOptions): Promise<ApiResponse<T>>`

Responsibilities:

- Resolve the URL via `resolveApiUrl`.
- Build headers and serialize body.
- Invoke `fetch` with:
  - `credentials: 'include'` (for cookie‑based auth).
  - `cache` and `next` options from `ClientOptions`.
- Handle response cases:
  - Network errors → `handleNetworkFailure`.
  - `parseJson: false` → `handleNonJson`.
  - `204` → `handleNoContent`.
  - JSON parse errors → `handleJsonParseFailure`.
  - Backend errors (`status: 'error'`) → `handleBackendError`.

`ClientOptions` extends `ClientRequestInit`:

- `method?: HttpMethod` – defaults to `'GET'`.
- `body?: BodyInit | Record<string, unknown> | unknown[]`.
- `parseJson?: boolean` – default `true`.
- `throwOnError?: boolean` – default `true`.
- `cache?: NextFetchCache`.
- `next?: NextFetchNext`.

Most use cases should not call `client` directly; prefer the `http` helpers unless you have special needs.

---

## Convenience HTTP Helpers (`http.ts`)

`http` wraps `client` with method‑specific helpers:

```ts
http.get<T>(endpoint: string, options?: ReadOptions): Promise<ApiResponse<T>>;
http.post<T>(endpoint: string, body?: WriteOptions['body'], options?: WriteOptions): Promise<ApiResponse<T>>;
http.put<T>(endpoint: string, body?: WriteOptions['body'], options?: WriteOptions): Promise<ApiResponse<T>>;
http.patch<T>(endpoint: string, body?: WriteOptions['body'], options?: WriteOptions): Promise<ApiResponse<T>>;
http.delete<T>(endpoint: string, options?: ReadOptions): Promise<ApiResponse<T>>;
```

### Simple usage

```ts
import { http } from '@/lib/api/client';

// GET list
const res = await http.get<User[]>('admin/users', { cache: 'no-store' });
if (res.status === 'success') {
  console.log(res.data);
} else {
  console.error(res.message);
}

// POST with JSON body
const createRes = await http.post<User>('admin/users', { name: 'Alice' });
```

The helpers automatically:

- Set the correct HTTP method.
- Serialize body (JSON or FormData).
- Apply CSRF, credentials, and caching defaults.

---

## Error Handling and Types

### `ApiResponse<T>`

All responses from `client` / `http` have the shape:

- `ApiSuccess<T>`:

  ```ts
  {
    status: 'success';
    message: string;
    data: T;
    meta?: Record<string, unknown>;
  }
  ```

- `ApiError`:

  ```ts
  {
    status: 'error';
    message: string;
    errors?: Record<string, unknown>;
    data?: unknown;
  }
  ```

### `throwOnError`

- When `throwOnError: true` (default in `client`, overridden to `false` when used by the `useForm` hook):
  - Network/backend failures result in an `ApiClientError` being thrown.
- When `throwOnError: false` (used by `hooks/form`):
  - The client returns `ApiResponse<T>` with `status: 'error'` instead of throwing.
  - Callers decide how to handle and surface errors.

### `ApiClientError`

Thrown when `throwOnError: true`:

- Contains:
  - `status: number`
  - `errors?: Record<string, unknown>`
  - `requestId?: string`
  - `payload?: ApiErrorPayload`
- Provides helpers:
  - `isForbidden`, `isNotFound`, `isServerError`, `isValidationError`, `isUnauthorized`.

Example:

```ts
import { client, ApiClientError } from '@/lib/api/client';

try {
  const res = await client<User>('admin/me', { method: 'GET' });
  if (res.status === 'success') {
    // ...
  }
} catch (error) {
  if (error instanceof ApiClientError && error.isUnauthorized) {
    // e.g. redirect to login
  }
}
```

---

## Integration with `hooks/form`

The `hooks/form` module builds on top of the client:

- Uses the `http` helpers with `throwOnError: false` to:
  - Submit data.
  - Interpret `ApiError.errors` as field errors when present.
  - Route non‑field failures to `onFailure`.
- Exposes:
  - `form.submit(method, url, options)`
  - Shortcut methods: `form.get/post/put/patch/destroy`.

This pattern centralizes the mechanics of HTTP + validation in `lib/api/client` and keeps form components focused on UI and callbacks.

---

## When to Use What

- **Use `http.get/post/...`** for almost all component‑level data fetching and mutations.
- **Use `client`** only when:
  - You need full control over `parseJson`, `throwOnError`, `cache`, or `next`.
  - You are building another abstraction (e.g. a domain‑specific SDK wrapper).
- **Never call `fetch` directly against the backend** from components or hooks:
  - You’ll bypass CSRF handling, error normalization, and environment configuration.

By consistently going through `@/lib/api/client`, the team gets:

- A single place to evolve API behavior.
- Predictable error handling.
- Less duplication and fewer subtle bugs around URLs, headers, or body formats.
