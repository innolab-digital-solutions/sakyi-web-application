# API client guide

How to call the Laravel API through `client` and `http` in `lib/api/client`. Env and layering: [project-architecture.md](./project-architecture.md).

## Purpose

This repository must never call the Laravel API with ad-hoc `fetch` from feature code. `@/lib/api/client` is the single integration layer that standardizes:

- Versioned URL building
- CSRF priming and XSRF header handling (Sanctum-style)
- JSON and multipart/form-data request serialization
- Response normalization into `ApiResponse` (`success` / `error`)
- Optional thrown errors (`ApiClientError`) when `throwOnError: true`

## When to use what

- Use `http.get` / `http.post` / etc. for most call sites.
- Use `client` when you need fine control (`parseJson`, `throwOnError`, `signal`, `cache`, `next`, headers).
- Put HTTP calls in `domains/.../*.service.ts` (or a shared lib) rather than components, except where a dedicated hook owns the call (for example `useForm`).

## Public surface

Import from `@/lib/api/client` only:

```ts
import {
  client,
  http,
  ApiClientError,
  API_UNAUTHORIZED_EVENT,
  dispatchApiUnauthorized,
} from '@/lib/api/client';
import type {
  ApiError,
  ApiResponse,
  ApiSuccess,
  ClientOptions,
  HttpMethod,
} from '@/lib/api/client';
```

`ensureCsrfCookie` and `getCsrfToken` are not re-exported from the barrel; CSRF is applied inside `client`. Do not import `handlers.ts` from feature code.

## Quick rules (Do / Don’t)

- **Do** use endpoint constants from `config/api/endpoints` for request paths.
- **Do** assume `credentials: 'include'` is required for session cookies.
- **Do** decide whether you want thrown exceptions (`throwOnError: true`) or a returned error object (`throwOnError: false`).
- **Don’t** pass absolute URLs into `client`/`http` (they are rejected by design).
- **Don’t** import `lib/api/client/*` internals from feature code.

## URLs

`buildVersionedEndpoint` prepends `base.versionEndpoint` from `config/api/base.ts` to a relative path. Absolute URLs (`http://`, `https://`, `//`) throw.

CSRF priming uses a separate request: `GET` `${base.domainEndpoint}/sanctum/csrf-cookie` (see `constants.ts`), not the versioned base.

Resource calls use the strings from `config/api/endpoints` as the path passed into `client` / `http`.

## Cookbook: common request patterns

### GET (simple)

```ts
import { http } from '@/lib/api/client';

const response = await http.get<User[]>(ENDPOINTS.ADMIN.USERS.LIST);
if (response.status === 'success') {
  console.log(response.data);
}
```

### GET (with query params)

Prefer building query params close to the call site (services), not in components.

```ts
import { http } from '@/lib/api/client';

const params = new URLSearchParams({
  page: '1',
  per_page: '15',
  search: 'yoga',
});

const response = await http.get<User[]>(
  `${ENDPOINTS.ADMIN.USERS.LIST}?${params.toString()}`,
);
```

### POST (JSON body)

```ts
import { http } from '@/lib/api/client';

const response = await http.post<User>(ENDPOINTS.ADMIN.USERS.CREATE, {
  name: 'Alice',
  email: 'alice@example.com',
});
```

### PATCH / PUT (JSON body)

```ts
import { http } from '@/lib/api/client';

await http.patch<User>(ENDPOINTS.ADMIN.USERS.UPDATE('42'), {
  name: 'Alice Updated',
});
```

### DELETE

```ts
import { http } from '@/lib/api/client';

await http.delete(ENDPOINTS.ADMIN.USERS.DELETE('42'));
```

### File upload (FormData is automatic)

If the body contains a `File`/`Blob`, the client will serialize as `FormData`.

```ts
import { http } from '@/lib/api/client';

const avatar = new File(['...'], 'avatar.png', { type: 'image/png' });

const response = await http.post<User>(
  ENDPOINTS.ADMIN.USERS.UPLOAD_AVATAR('42'),
  { avatar },
);
```

### Abort / cancel an in-flight request (AbortController)

```ts
import { client } from '@/lib/api/client';

const controller = new AbortController();

const promise = client<User[]>(ENDPOINTS.ADMIN.USERS.LIST, {
  method: 'GET',
  signal: controller.signal,
});

controller.abort();
await promise; // will resolve/throw based on internal handler behavior
```

## Request flow (core.ts)

For `method !== 'GET'`, `ensureCsrfCookie` runs first (browser only; no-op on server). Then headers include `Accept: application/json`, your `headers`, and `X-XSRF-TOKEN` when the `XSRF-TOKEN` cookie exists (`csrf.ts`).

`fetch` uses `credentials: 'include'`. Default `cache` is `no-store`. You may pass `next` (revalidate, tags) for Next.js fetch caching.

Body serialization (`builders.buildSerializedRequestBody`): empty / undefined / empty plain object sends no body. `string`, `FormData`, `URLSearchParams` pass through. Plain objects become JSON with `Content-Type: application/json`. Objects containing `File` or `Blob` become `FormData`.

## Response handling

With `parseJson` true (default): 204 returns a success shape with `data` undefined. The body is parsed as JSON. A response is treated as failure when `!response.ok` or when the parsed JSON has `status === 'error'`. Those go through `handleBackendApiError`.

With `parseJson` false: the body is read as text and wrapped in a success or error shape (`handlers.handleNonJsonResponse`).

## ApiResponse shape

Types come from `@/types/api` and are re-exported from `client/types.ts`.

- Success: `status: 'success'`, `message`, `data`, required `meta` with required `version` (plus optional extra keys).
- Error: `status: 'error'`, `message`, required `meta` with required `version`, optional `errors`, optional `data`.

When the backend payload does not include `meta.version` (or when the client creates a synthetic fallback response), the client uses `base.apiVersion` from `config/api/base.ts`.

## throwOnError

Default is `true`. When true, failures throw `ApiClientError` (network, invalid JSON, HTTP/API error path). When false, you get an `ApiResponse` with `status: 'error'` instead.

`useForm` always uses `throwOnError: false` so it can fill `form.errors` and callbacks.

### Error handling patterns

#### Pattern A: prefer thrown exceptions (`throwOnError: true`)

Use this when you want a `try/catch` boundary and treat failures as exceptions.

```ts
import { client, ApiClientError } from '@/lib/api/client';

try {
  const response = await client<User[]>(ENDPOINTS.ADMIN.USERS.LIST, {
    method: 'GET',
    throwOnError: true,
  });
  // response is success-shaped here
} catch (error) {
  if (error instanceof ApiClientError) {
    if (error.isUnauthorized) {
      // redirect or show login UI
    }
  }
  throw error;
}
```

#### Pattern B: prefer result objects (`throwOnError: false`)

Use this when you want `if (status === 'error')` flow without exceptions.

```ts
import { client } from '@/lib/api/client';

const response = await client<User[]>(ENDPOINTS.ADMIN.USERS.LIST, {
  method: 'GET',
  throwOnError: false,
});

if (response.status === 'error') {
  // response.message + optional response.errors
  return;
}
```

## http helpers

`http.get`, `http.post`, `http.put`, `http.patch`, `http.delete` delegate to `client` with the right `method`. POST/PUT/PATCH take an optional body as the second argument.

## ApiClientError

Thrown when `throwOnError` is true. Fields include `status`, optional `errors`, `requestId`, `payload`. Helpers: `isUnauthorized` (401 or 419), `isForbidden`, `isNotFound`, `isValidationError` (422), `isServerError`, `isClientError`, `isNetworkError` (status 0).

## 401 and the browser

`handleBackendApiError` dispatches `API_UNAUTHORIZED_EVENT` (see `events.ts`) when the HTTP status is 401 and `window` exists. Auth UI can listen and redirect; the API remains authoritative.

## Module map

`core.ts` orchestrates the request. `http.ts` exposes verb helpers. `builders.ts` builds URL, headers, body. `csrf.ts` cookie fetch and token read. `handlers.ts` normalizes errors (internal). `errors.ts` defines `ApiClientError`. `constants.ts` messages and CSRF paths. `types.ts` client options and re-exports. `events.ts` unauthorized dispatch. `index.ts` is the public barrel.

## When to use what

Prefer `http.get` / `http.post` / etc. in services and hooks when the defaults fit.

Use `client` when you need `parseJson: false`, a specific `throwOnError`, `signal`, or other `RequestInit` fields merged into the call.

Put HTTP calls in `domains/.../*.service.ts` (or shared infrastructure), not scattered in UI components, except where `useForm` owns the call.

## Checklist

- **Paths**: relative paths only; use `config/api/endpoints`.\n+- **Auth**: assume cookies; do not remove `credentials: 'include'` behavior.\n+- **Errors**: choose `throwOnError` strategy and handle accordingly.\n+- **Uploads**: pass plain objects; client will choose JSON vs FormData.\n+- **No bypass**: do not use ad-hoc `fetch` to the API from feature code.
