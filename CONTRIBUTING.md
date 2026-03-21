# Contributing

## Prerequisites

- Node.js 20+
- npm

## Setup

```bash
npm ci
cp .env.example .env.local
# Fill in API URLs and any local overrides.
```

## Required public env (CI / production)

These must be non-empty in production and in CI (see `scripts/verify-env.mjs`):

- `NEXT_PUBLIC_API_DOMAIN_ENDPOINT`
- `NEXT_PUBLIC_API_VERSION_ENDPOINT`

## Commands

| Command                      | Purpose                                                                                                             |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`                | Next.js dev server                                                                                                  |
| `npm run lint`               | ESLint                                                                                                              |
| `npm run format`             | Prettier (write)                                                                                                    |
| `npx prettier --check .`     | Prettier (check, used in CI)                                                                                        |
| `npx tsc --noEmit`           | Typecheck                                                                                                           |
| `npm run verify:env`         | Ensure required env vars are set                                                                                    |
| `npm run build`              | Production build                                                                                                    |
| `npm run test:vitest`        | Unit tests (Vitest)                                                                                                 |
| `npm run test:vitest:watch`  | Vitest watch mode                                                                                                   |
| `npm run test:playwright`    | Playwright with UI (local)                                                                                          |
| `npm run test:playwright:ci` | Playwright headless (CI-style; needs `npm run build` first, port `3000` free unless you set `PLAYWRIGHT_TEST_PORT`) |

## Forms

CRUD and API-submitting forms must use `useForm` from `@/lib/form` with Zod schemas from `domains/<feature>/schemas/`. See [docs/form-hook.md](docs/form-hook.md).

## Architecture

- [docs/architecture.md](docs/architecture.md) — layers, routing, performance notes.
- [docs/domains-conventions.md](docs/domains-conventions.md) — `domains/` layout.
- [docs/security.md](docs/security.md) — trust boundaries and env rules.

## Pull requests

CI runs lint, Prettier check, TypeScript, env verification, unit tests, production build, and Playwright smoke tests. Ensure your branch passes locally before opening a PR.
