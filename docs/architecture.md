# Architecture

This document describes how the SaKyi web application is structured, how major parts interact, and where to put new code. It complements the focused guides [domains-conventions.md](./domains-conventions.md) and [form-hook.md](./form-hook.md).

## Product surfaces

The app serves two distinct audiences in one Next.js codebase:

| Surface       | Role                                                                                               | Routes (typical)   |
| ------------- | -------------------------------------------------------------------------------------------------- | ------------------ |
| **Marketing** | Public, SEO-oriented site: home, about, programs, blog, contact                                    | `app/(marketing)/` |
| **Admin**     | Authenticated dashboard for data entry and platform content (feeds public site and mobile clients) | `app/admin/`       |

Backend business logic and persistence live in a **Laravel API**. This repository is the **Next.js front end**: it calls that API via a shared HTTP client and must not duplicate authoritative validation or secrets on the client.

## Technical stack

- **Framework:** Next.js (App Router), React, TypeScript
- **Styling:** Tailwind CSS, shared UI primitives under `components/ui/`
- **Forms:** Project `useForm` hook with Zod (see [form-hook.md](./form-hook.md))
- **Data fetching (client):** TanStack Query where interactive/refetch flows are needed
- **Validation:** Zod schemas colocated in `domains/<feature>/schemas/` (see [domains-conventions.md](./domains-conventions.md))

## High-level directory map

```
app/                 # App Router: layouts, pages, route groups (marketing vs admin)
components/          # UI: marketing, admin, shared, ui
config/              # Routes, API endpoints, navigation, fonts — not business rules
context/             # React context (e.g. language, auth) for client boundaries
domains/             # Feature modules: types, API services, Zod, constants
hooks/               # Reusable React hooks (tables, etc.)
lib/                 # Infrastructure: API client, form hook, Sentry, utilities, providers
public/              # Static assets
types/               # Cross-cutting TS types (e.g. generic API envelope)
docs/                # Architecture and conventions (this folder)
proxy.ts             # Next.js 16+ Proxy (path-matched; replaces deprecated middleware)
```

**Rule of thumb:** If it is about **what the API returns** or **how we validate an admin payload**, it belongs in **`domains/`**. If it is **layout, styling, or routing**, it belongs in **`app/`** or **`components/`**.

## Application layering

Dependencies should point **inward** toward domain and shared libraries, not the reverse.

1. **Presentation** — `app/`, `components/`: render UI, handle user events, call hooks and domain services through well-defined imports.
2. **Application / orchestration** — route-level composition, loading and error boundaries, sometimes Server Components that call domain services directly.
3. **Domain (feature modules)** — `domains/`: DTO shapes, Zod schemas, feature-scoped API functions (`*.service.ts`), constants.
4. **Infrastructure** — `lib/api/client`, HTTP configuration, `config/api/endpoints`: transport and environment-aware wiring.

Avoid calling the raw HTTP client from random UI files when a **`domains/.../services/...`** function already exists for that operation.

## Routing and route groups

- **`app/(marketing)/`** — Public pages; prefer **Server Components** and server-side data fetching where possible; use Client Components only for interactivity.
- **`app/admin/(auth)/`** — Login and other unauthenticated admin entry points.
- **`app/admin/(dashboard)/`** — Protected admin shell (sidebars, guards) and CRUD pages.

Route path constants live under **`config/routes/`**. API path constants live under **`config/api/endpoints/`**. Import these instead of hard-coding URLs.

## Feature modules (`domains/`)

Each feature (e.g. `programs`, `blogs`, `auth`) owns:

- **Types** split by API surface when responses differ: `types/marketing.ts`, `types/admin.ts`, with a small **`types/index.ts`** barrel for stable names.
- **Services:** `marketing.service.ts` / `admin.service.ts` for HTTP calls only (no JSX).
- **Schemas (admin CRUD):** `schemas/` with a shared base schema where create/update overlap.

Full naming and folder rules are in [domains-conventions.md](./domains-conventions.md).

## Forms and mutations

- Any flow that **submits to the API** should use **`useForm`** from **`@/lib/form`** (see [form-hook.md](./form-hook.md)) with a Zod schema from **`domains/<feature>/schemas/`**.
- Do not bypass the shared form stack with ad hoc `fetch` in components unless there is an approved exception.

## Cross-cutting concerns

- **Localization:** `lib/localization/` and dictionary JSON; pages/components consume translated strings via context/hooks — not hard-coded copy scattered in `domains/` unless it is a stable code/enum.
- **Auth:** Session-sensitive logic uses **`domains/auth/`** and **`context/AuthContext.tsx`**; keep tokens and sensitive data out of client bundles beyond what the product requires.

## Performance and bundles

- Keep **admin-only** modules from being imported by **marketing** routes (and vice versa) so bundles stay aligned with each surface.
- Prefer **server-side fetching** for marketing content when it does not require client-only APIs; use TanStack Query when you need caching, refetch, or client-driven filters.

## Security and trust boundaries

The Laravel API enforces authz and validation. See [security.md](./security.md) for cookies, `NEXT_PUBLIC_*` rules, and Proxy limitations.

## Proxy (Next.js 16+)

`middleware` is deprecated in favor of **`proxy.ts`** at the repository root. This project uses a narrow **`matcher`** for `/admin/:path*` for future admin-only routing or headers. **Do not** treat Proxy as an authorization layer. Official docs: [proxy.js](https://nextjs.org/docs/app/api-reference/file-conventions/proxy).

## Errors and observability

- Route **error boundaries:** `app/error.tsx`, `app/admin/error.tsx`, and `app/global-error.tsx` render fallbacks and use `unstable_retry` (see Next.js [error.js](https://nextjs.org/docs/app/api-reference/file-conventions/error)).
- **Sentry** lives under **`lib/sentry/`**: `index.ts` re-exports server-safe env/sampling helpers; **`client.ts`** re-exports client reporters (`reportClientError`, `reportNotableApiClientError`). Import reporters from `@/lib/sentry/client` in Client Components so the `'use client'` boundary stays explicit. Root `sentry.*.config.ts` and `instrumentation-client.ts` wire `@sentry/nextjs`. To stop sending events without code changes, unset `NEXT_PUBLIC_SENTRY_DSN` or set `NEXT_PUBLIC_SENTRY_ENABLED=false` (see `.env.example`).

## API response mapping

When marketing JSON shape differs from UI types (e.g. `excerpt` vs `overview`), normalize in **`domains/<feature>/transformers.ts`** and call from the relevant `*.service.ts` (see programs).

## Testing

- **Vitest** + Testing Library: `tests/**/*.test.ts(x)` — run `npm run test:vitest`.
- **Playwright:** `e2e/` — run `npm run test:playwright` (UI) or `npm run test:playwright:ci` (headless). CI uses a production server after `next build`.

## Architecture Decision Records

Significant structural decisions are recorded under [docs/adr/](./adr/) (see `0001-record-architecture-decisions.md`).

## Related documents

| Document                                           | Purpose                                                                 |
| -------------------------------------------------- | ----------------------------------------------------------------------- |
| [domains-conventions.md](./domains-conventions.md) | `domains/` layout: marketing vs admin, `schemas/`, examples per feature |
| [form-hook.md](./form-hook.md)                     | `useForm` API, validation, and submission patterns                      |
| [security.md](./security.md)                       | Trust boundaries, env vars, Proxy, cookies                              |
| [CONTRIBUTING.md](../CONTRIBUTING.md)              | Local setup, scripts, PR expectations                                   |

## Contributing

When adding a feature:

1. Decide if it is **marketing**, **admin**, or **both** and place routes under the correct `app/` segment.
2. Add or extend **`domains/<feature>/`** with types and services matching the Laravel contract.
3. For admin writes, add Zod schemas under **`domains/<feature>/schemas/`** and wire forms through **`useForm`**.
4. Reuse **`config/routes`** and **`config/api/endpoints`** for all URLs.

If the API shape for marketing and admin differs, **do not** force a single TypeScript type for both; mirror the backend with separate marketing/admin types (see [domains-conventions.md](./domains-conventions.md)).
