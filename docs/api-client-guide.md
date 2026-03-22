# API client guide

How to call the Laravel API through `client` and `http` in `lib/api/client`. Env and layering: [project-architecture.md](./project-architecture.md).

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

## URLs

`buildVersionedEndpoint` prepends `base.version` from `config/api/base.ts` to a relative path. Absolute URLs (`http://`, `https://`, `//`) throw.

CSRF priming uses a separate request: `GET` `${base.domain}/sanctum/csrf-cookie` (see `constants.ts`), not the versioned base.

Resource calls use the strings from `config/api/endpoints` as the path passed into `client` / `http`.

## Request flow (core.ts)

For `method !== 'GET'`, `ensureCsrfCookie` runs first (browser only; no-op on server). Then headers include `Accept: application/json`, your `headers`, and `X-XSRF-TOKEN` when the `XSRF-TOKEN` cookie exists (`csrf.ts`).

`fetch` uses `credentials: 'include'`. Default `cache` is `no-store`. You may pass `next` (revalidate, tags) for Next.js fetch caching.

Body serialization (`builders.buildSerializedRequestBody`): empty / undefined / empty plain object sends no body. `string`, `FormData`, `URLSearchParams` pass through. Plain objects become JSON with `Content-Type: application/json`. Objects containing `File` or `Blob` become `FormData`.

## Response handling

With `parseJson` true (default): 204 returns a success shape with `data` undefined. The body is parsed as JSON. A response is treated as failure when `!response.ok` or when the parsed JSON has `status === 'error'`. Those go through `handleBackendApiError`.

With `parseJson` false: the body is read as text and wrapped in a success or error shape (`handlers.handleNonJsonResponse`).

## ApiResponse shape

Types come from `@/types/api` and are re-exported from `client/types.ts`. Success: `status: 'success'`, `message`, `data`, optional `meta`. Error: `status: 'error'`, `message`, optional `errors`, optional `data`.

## throwOnError

Default is `true`. When true, failures throw `ApiClientError` (network, invalid JSON, HTTP/API error path). When false, you get an `ApiResponse` with `status: 'error'` instead.

`useForm` always uses `throwOnError: false` so it can fill `form.errors` and callbacks.

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

Relative paths only. Endpoints from `config/api/endpoints`. Handle both thrown `ApiClientError` (when `throwOnError` true) and `ApiResponse` with `status === 'error'` (when false). Do not bypass the client for same-origin API traffic from app code.
