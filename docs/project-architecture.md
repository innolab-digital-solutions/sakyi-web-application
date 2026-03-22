# SaKyi web application — project architecture

This document is the single place for how the front end is organized, how it talks to the backend, and what conventions to follow when you change or add features. Use `CONTRIBUTING.md` for machine setup, scripts, and review expectations.

## Role of this repository

The product has a **Laravel API** for business rules, persistence, authentication, and authorization. This repo is the **Next.js** user interface. The browser must never be treated as a security boundary: anything sensitive is validated and enforced on the API. The front end’s job is to present data, collect input, and call the API through one HTTP integration layer.

## Product surfaces

**Marketing** — public, SEO-oriented pages (home, about, programs, blog, contact). Route group: `app/(marketing)/`.

**Admin** — authenticated dashboard for operations and content that feeds the public site (web) and mobile apps. Unauthenticated entry: `app/admin/(auth)/`. Authenticated shell, CRUD, and operations: `app/admin/(dashboard)/`.

Keep imports scoped by surface: avoid pulling admin-only modules into marketing routes (and the reverse) so bundles stay smaller and boundaries stay obvious.

## Stack (at a glance)

Next.js App Router, React, TypeScript, Tailwind, shared primitives under `components/ui/`. Server Components by default; Client Components only where the browser must run logic (events, local state, browser APIs). Validation with Zod. Interactive data with TanStack Query where refetch or client-driven behavior matters. API calls go through `lib/api/client` — not ad hoc `fetch` to the API host from UI code (the client itself uses `fetch` internally).

## Top-level layout

- `app/` — routes, layouts, error boundaries.
- `components/` — UI: `marketing/`, `admin/`, `shared/`, `ui/`.
- `config/` — routes, API path constants, navigation, fonts, language list, API base URLs, production env helpers (`config/env.ts`). Not domain business rules.
- `context/` — React context for client boundaries (`LanguageContext`, `AuthContext`).
- `domains/` — feature modules: types, services, Zod schemas, small pure transforms.
- `hooks/` — small reusable hooks (e.g. `use-mobile.ts`).
- `lib/` — infrastructure: API client, `lib/form`, **paginated admin tables** (`lib/table` — `useTable` + types), Sentry, localization, `lib/providers` (e.g. TanStack Query).
- `public/` — static assets (images, SVG, icons).
- `types/` — cross-cutting TypeScript; **`types/api.ts`** is the canonical `ApiResponse` / `ApiSuccess` / `ApiError` contract (also re-used by `lib/api/client/types.ts`).
- `proxy.ts` — Next.js proxy, matcher `/admin/:path*` (see Security).
- `docs/` — internal documentation.
- `instrumentation.ts`, `instrumentation-client.ts` — Next.js hooks for Sentry and runtime wiring.
- `sentry.server.config.ts`, `sentry.edge.config.ts` — Sentry SDK entrypoints for server/edge.
- `scripts/` — e.g. `verify-env.mjs`, optional git hooks under `scripts/git-hooks/`.

Rule of thumb: if it describes **what the API returns** or **how we validate a payload**, it belongs in `domains/`. If it is **layout, routing, or presentation**, it belongs in `app/` or `components/`.

## App shell and providers

`app/layout.tsx` composes the global tree: `TanstackQueryProvider` (`lib/providers/TanstackQueryProvider.tsx`), Radix `TooltipProvider`, `LanguageProvider`, and Sonner `Toaster`. Add new cross-app client providers here only when they truly need to wrap the whole site.

## Admin layouts and guards

- `app/admin/(auth)/layout.tsx` — `AuthProvider` and `RouteGuard` with **`mode='guest'`** (login and other unauthenticated admin entry).
- `app/admin/(dashboard)/layout.tsx` — `AuthProvider` and `RouteGuard` with **`mode='protected'`** plus dashboard chrome (sidebar, header).

The API remains authoritative; guards improve UX and routing.

## Layering and dependency direction

Dependencies should point **inward** toward feature modules and shared libraries, not the other way around.

1. **Presentation** — `app/`, `components/`: UI, events, composition. Calls domain services and hooks through stable imports.
2. **Application** — route-level wiring, loading/error UI, Server Components that orchestrate calls to domain services.
3. **Domain** — `domains/*`: DTO shapes, Zod schemas, feature-scoped HTTP functions (`*.service.ts` or equivalent), constants, optional `transformers.ts`.
4. **Infrastructure** — `lib/api/client`, `config/api/base`, `config/api/endpoints`: transport, env-aware URLs.

Prefer `domains/.../services/...` over duplicating HTTP logic inside components.

**Exception:** `domains/auth/auth.service.ts` lives at the feature root (no `services/` subfolder). Dual-surface features like programs use `services/marketing.service.ts` and `services/admin.service.ts`.

## Routing and URL constants

Marketing and admin path strings live in `config/routes/`. API path segments live in `config/api/endpoints/` (including `MARKETING`, `ADMIN`, `LOOKUP`). Use these instead of hard-coding URLs.

## Feature modules (`domains/`)

Each folder under `domains/<feature>/` is one product feature: types, API access, validation, and optional mapping from API JSON to UI types. No JSX here.

**Dual surface (public + admin CRUD)** — For features like programs: `types/marketing.ts`, `types/admin.ts`, `services/marketing.service.ts`, `services/admin.service.ts`, and `schemas/` for admin writes. Export stable names from `types/index.ts` when useful. Marketing routes should import only marketing services and types; admin routes import admin services, admin types, and schemas.

**Marketing-only API shapes** — e.g. `domains/contact/schemas/` for the public contact form, used with `useForm` and `MARKETING_ENDPOINTS.CONTACT`.

**Admin-only (e.g. auth)** — Services and schemas without a separate marketing surface.

**Schemas** — Zod in `domains/<feature>/schemas/`, one main concern per file. Prefer a shared base for create/update overlap, then thin create/update exports. Co-locate inferred input types with schemas.

**Transformers** — When the API uses different field names than the UI types (e.g. excerpt vs overview), normalize in `transformers.ts` and call from the relevant `*.service.ts` after the HTTP call.

Concrete examples today: `domains/programs/`, `domains/blogs/` (marketing-focused; extend when admin diverges), `domains/auth/`, `domains/user/`, `domains/contact/` (contact schema).

## API base URLs

`config/api/base.ts` exposes `base.domain` (API origin, used for Sanctum CSRF cookie fetch) and `base.version` (versioned API root for resource calls). Override with `NEXT_PUBLIC_API_DOMAIN_ENDPOINT` and `NEXT_PUBLIC_API_VERSION_ENDPOINT`; defaults are defined in that file.

## HTTP client (`lib/api/client`)

This is the **only** supported way to call the Laravel API from application code.

Import the public surface from `@/lib/api/client` (e.g. `client`, `http`, `ApiClientError`, response types). Do not import `handlers.ts` from call sites; normalization stays inside the client.

Behavior you can rely on:

- Relative endpoint paths only; absolute URLs are rejected to avoid SSRF-style mistakes.
- `credentials: 'include'` for cookie-based session flows.
- Non-GET requests trigger CSRF cookie ensure + `X-XSRF-TOKEN` when the token cookie is present (Laravel Sanctum-style).
- Responses are normalized to a discriminated union: success payloads vs error shape with optional field-level `errors`.
- Default is `throwOnError: true` on `client`; callers that need a result object can set `throwOnError: false`.

`http.get` / `http.post` / etc. are thin method-specific wrappers over `client`. Use them for most call sites; use `client` directly when you need finer control (caching tags, `parseJson`, `throwOnError`, abort signals).

Unauthorized handling integrates with `API_UNAUTHORIZED_EVENT` (see `lib/api/client/events.ts`) so the admin shell can react (e.g. redirect to login) while the API remains authoritative.

Module layout under `lib/api/client/`: `core.ts` (orchestration), `http.ts`, `builders.ts` (URL + headers + body), `csrf.ts`, `errors.ts`, `handlers.ts`, `constants.ts`, `types.ts`, `events.ts`, barrel `index.ts`.

Contributor guide: [api-client-guide.md](./api-client-guide.md).

## Paginated tables (`lib/table`)

`useTable` in `lib/table/core.ts` drives admin-style lists: pagination, search, optional URL sync, and TanStack Query. It calls the API through `http.get` with typed params. Shared types (`TableControls`, `TablePagination`, etc.) are exported from `@/lib/table`. Layout helpers such as `components/admin/layout/TableLayout.tsx` consume `TableControls`.

## Forms (`lib/form`)

Use `useForm` from `@/lib/form` for flows that submit to the API with shared error and loading behavior. Pass Zod schemas from `domains/<feature>/schemas/` via the form options.

The hook keeps **field values** in `fields`, exposes `setData`, `errors`, `isDirty`, `isSubmitting`, reset/defaults helpers, and shortcuts such as `post`, `put`, `patch`, and `destroy`. Submissions use `client` with `throwOnError: false`, map backend `errors` into field errors when present, and use `onFailure` when there is no field map.

Do not bypass this stack with raw `fetch` to the API from components. The marketing contact section uses the same pattern (`domains/contact` schema + `MARKETING_ENDPOINTS.CONTACT`).

Contributor guide: [form-handling-guide.md](./form-handling-guide.md).

## Localization

Core helpers and dictionaries live under `lib/localization/` (`core.ts`, `types.ts`, `dictionaries/`). Supported languages and defaults are defined in `config/languages.ts` and reused by localization types.

React integration: `context/LanguageContext.tsx` provides `language`, `setLanguage`, and `translate` backed by `getTranslation`. Use `useLanguage()` in Client Components that must react to language changes; avoid using the hook outside `LanguageProvider`.

Keys use dot notation; placeholders use `:name` style with a replacements object. English is the fallback when a key is missing in the active dictionary.

Contributor guide: [localization-guide.md](./localization-guide.md).

## Security and trust

The Laravel API owns authentication, authorization, and validation. The admin UI may use `RouteGuard`, `AuthContext`, and similar for UX; they are not a substitute for API checks.

**Environment** — Any `NEXT_PUBLIC_*` variable is visible in the browser. Never put secrets there. CI can validate required keys with `npm run verify:env` (`scripts/verify-env.mjs`). `config/env.ts` defines `assertProductionPublicEnv()` for optional strict checks in production builds if you wire it in.

**Proxy (`proxy.ts`)** — Next.js 16 uses root-level `proxy.ts` with `config.matcher` `/admin/:path*` (not legacy `middleware.ts`). This is not authorization: it only reasons about **presence** of configured cookie names on the request to **this** app’s origin.

- If `PROXY_ADMIN_SESSION_COOKIE_NAMES` is **unset**, every request under `/admin` is redirected to the admin login path. In practice you need this variable set (comma-separated cookie names) when session cookies are actually sent to the Next origin so normal admin navigation works.
- If the session cookie is **only** on the API host and never on the Next origin, listing names here would mis-route users; align cookie domain strategy with backend and ops before enabling hints.
- `/admin/login` is treated as the login entry; when a listed cookie is present and the user hits login, they are redirected toward the admin root. Real session validity still comes from the API (e.g. `/me` and guarded routes).

**Headers and build** — Baseline security headers and `images.remotePatterns` (API hosts and other remotes) live in `next.config.ts`, which is wrapped with `withSentryConfig` for Sentry. Tighten further (e.g. CSP) per environment if needed.

**Rich text** — If the API stores HTML, sanitize before rendering; avoid unsanitized `dangerouslySetInnerHTML`.

## Errors and observability

Segment error UI: `app/error.tsx`, `app/admin/error.tsx`, `app/global-error.tsx`. They receive `unstable_retry` from Next for recovery attempts and can report to Sentry.

Sentry: server-safe helpers from `@/lib/sentry`. In Client Components, import reporters from `@/lib/sentry/client` so the client boundary stays explicit. Disabling reporting is done via env (see `.env.example` for DSN and enable flags). Root-level `instrumentation.ts`, `instrumentation-client.ts`, and `sentry.*.config.ts` connect the SDK to Next.js.

## Performance

Prefer server-side fetching for marketing content when you do not need client-only APIs. Use TanStack Query when you need caching, invalidation, or client-driven refetch. Keep marketing and admin code split by import graph.

## Testing

Vitest and Testing Library: `tests/**/*.test.ts(x)`, `npm run test:vitest`. Playwright: `e2e/`, `npm run test:playwright` (UI) or `npm run test:playwright:ci` (headless; production server after `next build` in CI-style flows).

## Checklist for a new feature

1. Decide surface: marketing, admin, or both; place routes under the right `app/` segment.
2. Add or extend `domains/<feature>/` with types and services that match the Laravel contract; use `config/api/endpoints` for paths.
3. For writes, add Zod under `domains/<feature>/schemas/` and wire forms through `useForm` from `@/lib/form`.
4. If marketing and admin JSON differ, use separate types (and transformers if names diverge); do not force one DTO for both.

## Related material

- `CONTRIBUTING.md` — local setup, commands, contribution flow.
