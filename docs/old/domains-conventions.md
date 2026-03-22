# Domain modules (`domains/`)

Each folder under `domains/<feature>/` groups **one product feature**: API access, types, validation, and small pure transforms. UI stays in `components/` and routes in `app/`.

## Surfaces: marketing vs admin

| Pattern          | When                                            | Layout                                                                                                                                         |
| ---------------- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dual-surface** | Public site + admin CRUD (e.g. programs, blogs) | `types/marketing.ts`, `types/admin.ts`, `services/marketing.service.ts`, `services/admin.service.ts`, optional `schemas/` for **admin** writes |
| **Admin-only**   | No public API for the feature (e.g. auth)       | `services/*.service.ts`, `schemas/*.schema.ts`                                                                                                 |

**Imports:** Marketing routes import only `marketing.service` and marketing types. Admin routes import `admin.service`, admin types, and `schemas/`.

## Programs (`domains/programs/`)

- **Types:** `types/marketing.ts` (public DTO), `types/admin.ts` (admin DTO), `types/index.ts` exports `Program` (marketing) and `AdminProgram`.
- **HTTP:** `services/marketing.service.ts` / `admin.service.ts`.
- **Validation:** `schemas/base.schema.ts` (`ProgramBodySchema`) → `create.schema.ts` (`ProgramCreateSchema`) → `update.schema.ts` (`ProgramUpdateSchema` = partial body). Import from `@/domains/programs/schemas`.
- **Constants:** `constants.ts` (e.g. `STATUS`).

## Blogs (`domains/blogs/`)

- **Types:** `types/marketing.ts` today; add `types/admin.ts` when admin responses differ.
- **HTTP:** `services/marketing.service.ts`; add `admin.service.ts` when needed.

## Auth (`domains/auth/`)

- **Admin-only:** `auth.service.ts`, `schemas/login.schema.ts`, barrel `schemas/index.ts`.

## Schemas folder convention

- Zod files live in **`domains/<feature>/schemas/`** with **one module per file** (`login.schema.ts`, `create.schema.ts`, …).
- Prefer a **`base`** schema shared by create/update, then **`ProgramCreateSchema`** and **`ProgramUpdateSchema`** (often `ProgramBodySchema.partial()`).
- Export inferred input types next to each schema (`ProgramCreateInput`, `ProgramUpdateInput`).

## User (`domains/user/`)

Shared user DTOs for session/auth; keep aligned with `auth.service` responses.

## API → UI mapping

When JSON field names differ from marketing/admin types (e.g. `excerpt` vs `overview`), add **`transformers.ts`** in the feature folder and call it from the relevant `*.service.ts` after `http.get`.
