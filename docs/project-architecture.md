# SaKyi web application — project architecture

This document is the single place for how the front end is organized, how it talks to the backend, and what conventions to follow when you change or add features. Use `CONTRIBUTING.md` for machine setup, scripts, and review expectations.

## Role of this repository

The product has a **Laravel API** for business rules, persistence, authentication, and authorization. This repo is the **Next.js** user interface. The browser must never be treated as a security boundary: anything sensitive is validated and enforced on the API. The front end’s job is to present data, collect input, and call the API through one HTTP integration layer.

## Product surfaces

**Marketing** — public, SEO-oriented pages (home, about, programs, blog, contact). Route group: `app/(marketing)/`.

**Admin** — authenticated dashboard for operations and content that feeds the public site (Web) and mobile application (Android and IOS). Unauthenticated entry: `app/admin/(auth)/`. Authenticated shell, CRUD and Operations: `app/admin/(dashboard)/`.

Keep imports scoped by surface: avoid pulling admin-only modules into marketing routes (and the reverse) so bundles stay smaller and boundaries stay obvious.

## Stack (at a glance)

Next.js App Router, React, TypeScript, Tailwind, shared primitives under `components/ui/`. Server Components by default; Client Components only where the browser must run logic (events, local state, browser APIs). Validation with Zod. Interactive data with TanStack Query where refetch or client-driven behavior matters. API calls go through `lib/api/client` — not ad hoc `fetch` to the API host from UI code.

## Top-level layout

- `app/` — routes, layouts, error boundaries.
- `components/` — UI: `marketing/`, `admin/`, `shared/`, `ui/`.
- `config/` — routes, API path constants, navigation, fonts, language list, API base URLs. Not domain business rules.
- `context/` — React context for client boundaries (e.g. language, auth).
- `domains/` — feature modules: types, services, Zod schemas, small pure transforms.
- `hooks/` — reusable hooks (e.g. `use-mobile`).
- `lib/` — infrastructure: API client, form hook, table hook, Sentry, localization core, providers.
- `public/` — static assets (e.g. images, svg and icons).
- `types/` — cross-cutting TypeScript types (e.g. generic API envelope).
- `proxy.ts` — Next.js proxy, matcher `/admin/:path*` (see below).
- `docs/` — internal documentation.

Rule of thumb: if it describes **what the API returns** or **how we validate an admin payload**, it belongs in `domains/`. If it is **layout, routing, or presentation**, it belongs in `app/` or `components/`.

## Layering and dependency direction

Dependencies should point **inward** toward feature modules and shared libraries, not the other way around.

1. **Presentation** — `app/`, `components/`: UI, events, composition. Calls domain services and hooks through stable imports.
2. **Application** — route-level wiring, loading/error UI, Server Components that orchestrate calls to domain services.
3. **Domain** — `domains/*`: DTO shapes, Zod schemas, feature-scoped HTTP functions (`*.service.ts`), constants, optional `transformers.ts`.
4. **Infrastructure** — `lib/api/client`, `config/api/base`, `config/api/endpoints`: transport, env-aware URLs.

Prefer `domains/.../services/...` over duplicating HTTP logic inside components.

## Routing and URL constants

Marketing and admin path strings live in `config/routes/`. API path segments live in `config/api/endpoints/`. Use these instead of hard-coding URLs so renames stay centralized.

## Feature modules (`domains/`)

Each folder under `domains/<feature>/` is one product feature: types, API access, validation, and optional mapping from API JSON to UI types. No JSX here.

**Dual surface (public + admin CRUD)** — For features like programs: `types/marketing.ts`, `types/admin.ts`, `services/marketing.service.ts`, `services/admin.service.ts`, and `schemas/` for admin writes. Export stable names from `types/index.ts` when useful. Marketing routes should import only marketing services and types; admin routes import admin services, admin types, and schemas.

**Admin-only (e.g. auth)** — Services and schemas without a separate marketing surface.

**Schemas** — Zod in `domains/<feature>/schemas/`, one main concern per file. Prefer a shared base for create/update overlap, then thin create/update exports. Co-locate inferred input types with schemas.

**Transformers** — When the API uses different field names than the UI types (e.g. excerpt vs overview), normalize in `transformers.ts` and call from the relevant `*.service.ts` after the HTTP call.

Concrete examples today: `domains/programs/` (full dual surface + schemas + `transformers.ts`), `domains/blogs/` (marketing-focused; extend when admin diverges), `domains/auth/`, `domains/user/` (align with session/auth payloads).

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

## Forms (`lib/form`)

Use `useForm` from `@/lib/form` for flows that submit to the API with shared error and loading behavior. Pass Zod schemas from `domains/<feature>/schemas/` via the form options.

The hook keeps **field values** in `fields`, exposes `setData`, `errors`, `isDirty`, `isSubmitting`, reset/defaults helpers, and shortcuts such as `post`, `put`, `patch`, and `destroy`. Submissions use `client` with `throwOnError: false`, map backend `errors` into field errors when present, and use `onFailure` when there is no field map.

Do not bypass this stack with raw `fetch` to the API from components unless there is an explicit exception.

## Localization

Core helpers and dictionaries live under `lib/localization/` (see `core.ts`, `types.ts`, `dictionaries/`). Supported languages and defaults are defined in `config/languages.ts` and reused by localization types.

React integration: `context/LanguageContext.tsx` provides `language`, `setLanguage`, and `translate` backed by `getTranslation`. Use `useLanguage()` in Client Components that must react to language changes; avoid using the hook outside `LanguageProvider`.

Keys use dot notation; placeholders use `:name` style with a replacements object. English is the fallback when a key is missing in the active dictionary.

## Security and trust

The Laravel API owns authentication, authorization, and validation. The admin UI may use `RouteGuard`, `AuthContext`, and similar for UX; they are not a substitute for API checks.

**Environment** — Any `NEXT_PUBLIC_*` variable is visible in the browser. Never put secrets there. CI can validate required keys with `npm run verify:env` (`scripts/verify-env.mjs`).

**Proxy (`proxy.ts`)** — Next.js 16 uses root-level `proxy.ts` with `config.matcher` `/admin/:path*` (not legacy `middleware.ts`). This is not authorization: it only reasons about **presence** of configured cookie names on the request to **this** app’s origin.

  - If `PROXY_ADMIN_SESSION_COOKIE_NAMES` is **unset**, every request under `/admin` is redirected to the admin login path. In practice you need this variable set (comma-separated cookie names) when session cookies are actually sent to the Next origin so normal admin navigation works.
  - If the session cookie is **only** on the API host and never on the Next origin, listing names here would mis-route users; align cookie domain strategy with backend and ops before enabling hints.
  - `/admin/login` is treated as the login entry; when a listed cookie is present and the user hits login, they are redirected toward the admin root. Real session validity still comes from the API (e.g. `/me` and guarded routes).

**Headers** — Baseline security headers are configured in `next.config.ts`. Tighten further (e.g. CSP) per environment if needed.

**Rich text** — If the API stores HTML, sanitize before rendering; avoid unsanitized `dangerouslySetInnerHTML`.

## Errors and observability

Segment error UI: `app/error.tsx`, `app/admin/error.tsx`, `app/global-error.tsx`. They receive `unstable_retry` from Next for recovery attempts and can report to Sentry.

Sentry: server-safe helpers from `@/lib/sentry`. In Client Components, import reporters from `@/lib/sentry/client` so the client boundary stays explicit. Disabling reporting is done via env (see `.env.example` for DSN and enable flags).

## Performance

Prefer server-side fetching for marketing content when you do not need client-only APIs. Use TanStack Query when you need caching, invalidation, or client-driven refetch. Keep marketing and admin code split by import graph.

## Testing

Vitest and Testing Library: `tests/**/*.test.ts(x)`, `npm run test:vitest`. Playwright: `e2e/`, `npm run test:playwright` (UI) or `npm run test:playwright:ci` (headless; production server after `next build` in CI-style flows).

## Recorded architecture decisions

When a change alters a structural convention (routing boundaries, proxy behavior, how we call the API, etc.), record it as a short ADR: `docs/adr/NNNN-title.md` with status, context, decision, and consequences. Supersede an older ADR instead of silently contradicting it. Mention new ADRs in the PR description (and add a one-line pointer here if the decision affects everyday development).

## Checklist for a new feature

1. Decide surface: marketing, admin, or both; place routes under the right `app/` segment.
2. Add or extend `domains/<feature>/` with types and services that match the Laravel contract; use `config/api/endpoints` for paths.
3. For admin writes, add Zod under `domains/<feature>/schemas/` and wire forms with `useForm` from `@/lib/form`.
4. If marketing and admin JSON differ, use separate types (and transformers if names diverge); do not force one DTO for both.

## Related material

- `CONTRIBUTING.md` — local setup, commands, contribution flow.
