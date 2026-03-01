# Architecture

This document records high-level structure and how it aligns with the engineering standards (see `.cursor/rules/engineering-standards.mdc`).

## Layer overview

The codebase follows a clear dependency direction:

- **Presentation**: `app/`, `components/`, `context/` — UI, routing, and client state. Depends on application (services) and config (paths); does **not** call the HTTP client or endpoints directly.
- **Application (use cases)**: `lib/api/services/` — auth, table fetch, and form submission. Owns orchestration and is the only layer that calls the HTTP client and endpoint config. Hooks (`useForm`, `useTable`) and context (`AuthContext`) call into services, not into `lib/api/client`.
- **Infrastructure**: `lib/api/client`, `config/endpoints`, `config/paths` — HTTP client, endpoints, and route paths. Used only by the application layer (services) and by app/layout for routing config where needed.
- **Domain / types**: `types/`, `lib/schemas/` — shared contracts, entity types, and validation schemas. No dependency on infrastructure or presentation. The shared API response contract is in `types/api.ts` and is used by both `types/admin/*` and `lib/api/client`.

## Application layer (services)

**Decision**: Use an explicit application layer under `lib/api/services/` so that presentation (context, hooks) does not depend on infrastructure.

- **`lib/api/services/auth.ts`**: `checkSession()` and `logout()`. Use the HTTP client and admin auth endpoints. Consumed by `AuthContext`.
- **`lib/api/services/table.ts`**: `fetchTablePage(endpoint, params)`. Builds query string and calls the HTTP client. Consumed by `useTable`.
- **`lib/api/services/form.ts`**: `submitRequest(method, url, body?, options?)`. Dispatches to the appropriate HTTP method. Consumed by `useForm`.

Context and hooks import only from `@/lib/api/services/*` (and from `@/types/api`, `@/config/paths` as needed). They do **not** import `@/lib/api/client` or `@/config/endpoints`. This keeps presentation and application boundaries clear and makes it easy to test or swap implementations by injecting or mocking services.

## Dependency direction

- **Types / domain**: `types/api.ts`, `types/admin/*`, `lib/schemas/*` — no imports from `lib/api`, `services`, `app`, or `components`.
- **Infrastructure**: `lib/api/client` depends on `types/api` for the response contract; it does not depend on services or presentation.
- **Application (services)**: Depends on `lib/api/client` and `config/endpoints` (and `types` where needed). Does not depend on context, hooks, or components.
- **Presentation**: Context and hooks depend on `lib/api/services/`, `config/paths`, and `types`. They do not depend on `lib/api/client` or `config/endpoints`.
