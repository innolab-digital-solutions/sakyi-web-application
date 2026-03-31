# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Production build
npm run start            # Start production server

# Code quality (also run in CI on PRs to main/dev)
npm run lint             # ESLint
npm run lint:fix         # ESLint with auto-fix
npm run format           # Prettier

# Testing
npm run test:vitest          # Run unit/component tests once
npm run test:vitest:watch    # Watch mode
npm run test:playwright      # E2E tests with UI
npm run test:playwright:ci   # E2E tests headless (CI)

# Env
npm run verify:env       # Verify required environment variables
```

## Architecture Overview

This is a **Next.js App Router** application with two distinct sections: a public marketing site and a protected admin dashboard.

### Directory Structure

| Directory                | Purpose                                                                              |
| ------------------------ | ------------------------------------------------------------------------------------ |
| `app/(marketing)/`       | Public-facing marketing pages                                                        |
| `app/admin/(auth)/`      | Admin login page                                                                     |
| `app/admin/(dashboard)/` | Protected admin pages (requires auth)                                                |
| `domains/`               | Domain-driven business logic — each domain has `services/`, `schemas/`, and `types/` |
| `config/`                | Centralized config: API endpoints, routes constants, navigation, i18n languages      |
| `lib/`                   | API client, providers (TanStack Query), utilities, localization, Sentry integration  |
| `components/ui/`         | shadcn/ui component library (Radix UI primitives)                                    |
| `components/admin/`      | Admin-specific components                                                            |
| `components/shared/`     | Components shared across admin and marketing                                         |
| `context/`               | React Context: `AuthContext`, `LanguageContext`                                      |
| `hooks/`                 | Custom React hooks                                                                   |
| `types/`                 | Global TypeScript types                                                              |
| `tests/`                 | Vitest unit/component tests                                                          |
| `e2e/`                   | Playwright E2E tests                                                                 |

### Domain Structure

Each feature lives in `domains/<feature>/` with this internal structure:

```
domains/auth/
  services/   # API calls using lib/api/client
  schemas/    # Zod validation schemas
  types/      # TypeScript types for the domain
```

Existing domains: `auth`, `programs`, `units`, `nutrition-categories`, `onboarding`, `blogs`, `client`, `contact`, `user`.

### API Layer

**HTTP client** is in `lib/api/client/`. All API calls go through the typed `http` helper (`get`, `post`, `put`, `patch`, `delete`), never raw `fetch`.

**API endpoints** are defined in `config/api/endpoints/admin.ts` and `config/api/endpoints/lookup.ts` as constants — use these rather than hardcoding URLs.

**Response type:** All API calls return `ApiResponse<T>` which is `ApiSuccess<T> | ApiError`. Services unwrap this; components consume the typed result.

**CSRF:** Automatically handled — the client lazily fetches the XSRF-TOKEN cookie before non-GET requests (Laravel Sanctum compatible).

**Error handling:** 401 responses dispatch `API_UNAUTHORIZED_EVENT` → `AuthContext` catches it and redirects to login. Retry logic: 5xx/408/429 retry up to 2 times; 4xx do not retry.

### Authentication

Cookie-based session auth via Laravel Sanctum. `AuthProvider` (in `context/`) calls `authService.me()` on mount. The dashboard layout's auth guard checks `isAuthenticated` — unauthenticated users are redirected to `/admin/login`.

Use `useAuth()` hook to access `user`, `isAuthenticated`, `isLoading`, `hasInitialized`, `checkSession()`, and `logout()`.

### Routes

Routes are defined as constants in `config/routes/admin.ts` and `config/routes/marketing.ts`. Always use these constants — never hardcode path strings. Navigation items for the sidebar are in `config/navigation/admin.ts`.

### Data Fetching

TanStack Query (React Query v5) manages all server state. Define queries/mutations in domain service files, then use them in page/component files via `useQuery`/`useMutation`. Query keys should be co-located with the service.

### Styling

Tailwind CSS v4 with `tailwind-merge` + `clsx` (combined via a `cn()` utility in `lib/`). Follow existing component patterns in `components/ui/` for new UI elements. Use `class-variance-authority` (CVA) for component variants.

### Localization

The app supports English (`en`) and Myanmar (`my`). Use the `useLanguage()` hook and its translation function `t('key.path')` for all user-facing strings. Language preference is persisted to localStorage.

### Forms

Zod schemas live in `domains/<feature>/schemas/`. Forms use React Hook Form with Zod resolvers. Reuse existing form component patterns from `components/admin/modules/`.

## Environment Variables

Copy `.env.example` to `.env.local`. Key variables:

- `NEXT_PUBLIC_API_DOMAIN_ENDPOINT` — API base URL (no trailing slash)
- `NEXT_PUBLIC_API_VERSION_ENDPOINT` — Versioned API base (e.g. `https://api.example.com/api`)
- `NEXT_PUBLIC_API_VERSION` — API version string (e.g. `v1`)

## Tech Stack

- **Next.js 16 / React 19** — App Router
- **TypeScript 5** — strict mode
- **TanStack Query v5** — server state / data fetching
- **Zod v4** — schema validation
- **shadcn/ui + Radix UI** — component primitives
- **Tailwind CSS v4** — styling
- **TipTap** — rich text editor
- **Vitest** — unit/component tests
- **Playwright** — E2E tests
- **Sentry** — error tracking
