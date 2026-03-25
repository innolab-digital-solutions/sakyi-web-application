# Form handling guide

How to submit forms to the Laravel API with `useForm` from `@/lib/form`. Wider layout, domains, and HTTP rules: [project-architecture.md](./project-architecture.md).

## Purpose

`@/lib/form` exists to make API-submitting forms consistent, predictable, and easy to maintain. It standardizes:

- Field state (single source of truth)
- Dirty tracking and defaults
- Client-side Zod validation (optional)
- Server validation error mapping into `form.errors`
- Submission lifecycle and callbacks (`onSuccess`, `onError`, `onFailure`, `onFinish`)
- Abort/cancel for in-flight requests

## When to use it

Use `useForm` in Client Components whenever the user submits data to the API (login, CRUD, contact, and similar). The hook calls `client` from `@/lib/api/client` with `throwOnError: false`, so it can read `status`, `message`, and `errors` without try/catch for normal failures.

Do not perform the same submission with raw `fetch` or by calling `http` / `client` from the form component.

UI that never talks to the API (for example a client-only filter) can use `useState` or other local state.

## Imports

```ts
import { useForm } from '@/lib/form';
import type { FormSubmitOptions, UseFormReturn } from '@/lib/form';
```

Feature code should not import `lib/form/core.ts`, `validator.ts`, `utils.ts`, or `shortcuts.ts`. `validateFormFields` is internal and not re-exported from the barrel.

## Constructor

`useForm(initialFields, options?)`

`initialFields` is a plain object. Keys should match your Zod schema (if any) and the JSON body the API expects.

`FormOptions` only supports `schema?: ZodType`. There is no request transform: for non-GET methods the body is the current `fields` object, passed through the API client (JSON or FormData when the client detects files, same as any `client` call).

```ts
const form = useForm({ email: '', password: '' }, { schema: LoginSchema });
```

## Cookbook: common scenarios

### Scenario A: Create form (POST)

```ts
'use client';

import { useForm } from '@/lib/form';
import { ENDPOINTS } from '@/config/api/endpoints';
import { CreateThingSchema } from '@/domains/things/schemas/create.schema';

export const CreateThingForm = () => {
  const form = useForm(
    { name: '', status: 'draft' },
    { schema: CreateThingSchema },
  );

  const submit = async () => {
    await form.post(ENDPOINTS.ADMIN.THINGS.CREATE, {
      onSuccess: () => {
        // redirect / toast / reset defaults
      },
      onError: () => {
        // validation errors are already in form.errors
      },
      onFailure: () => {
        // non-field error (e.g. permissions) – show a toast
      },
    });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      {/* bind inputs to form.fields + form.setData */}
    </form>
  );
};
```

**Expected result**:

- Zod schema fails → request is not sent; `form.errors` is filled; `onError` runs; `onFinish` runs.
- Backend returns `status:'error'` with `errors` map → `form.errors` is filled; `onError` runs.
- Backend returns `status:'error'` without `errors` map → `onFailure` runs.
- Backend returns `status:'success'` → `onSuccess` runs and dirty state resets.

### Scenario B: Edit form (load entity then `setDataAndDefaults`)

When editing, the form should not be “dirty” immediately after data loads.

```ts
const form = useForm(
  { name: '', status: 'draft' },
  { schema: UpdateThingSchema },
);

useEffect(() => {
  if (!thing) return;
  form.setDataAndDefaults({
    name: thing.name,
    status: thing.status,
  });
}, [thing]); // eslint-disable-line react-hooks/exhaustive-deps
```

Then submit:

```ts
await form.patch(ENDPOINTS.ADMIN.THINGS.UPDATE(String(id)));
```

### Scenario C: Server validation errors (422-style field errors)

If the backend responds with `errors: { field: 'message' }`, `useForm`:

- writes them into `form.errors`
- calls `onError(errorResponse)`

You should not duplicate that mapping in components.

### Scenario D: Cancel / abort an in-flight submit

Use this when the user closes a modal/sheet, navigates away, or presses “Cancel”.

```ts
form.cancel(); // aborts current request (if any) and clears isSubmitting
```

### Scenario E: Reset behavior

```ts
form.reset(); // resets all fields to defaults
form.reset('email', 'password'); // resets only specific keys
```

If you want the current values to become the new “clean” baseline:

```ts
form.setDefaults(); // snapshot current fields into defaults and clears dirty
```

### Scenario F: Dynamic forms

If you need dynamic keys, `useForm({})` is supported, but prefer a stable schema and stable keys whenever possible.\n+
Dynamic forms still benefit from:\n+- `setData` partial updates\n+- shared submit flow\n+

## Callbacks (what to use and why)

- `onSuccess`: success response; good place to redirect or toast
- `onError`: validation-like errors (Zod failure or backend errors map)\n+- `onFailure`: non-field failure where `errors` is empty (auth, forbidden, generic)\n+- `onFinish`: always runs (after schema failure or network attempt)\n+

## Common pitfalls

- **Bypassing `useForm`**: do not call `http`/`client` directly from form components.\n+- **Mismatched keys**: the keys in `initialFields`, your Zod schema, and backend payload should align.\n+- **Confusing onError vs onFailure**: use `onError` for field-level errors and `onFailure` for non-field failures.\n+- **Dirty surprises**: use `setDataAndDefaults` after loading existing entities for edit.\n+- **Partial reset dirty state**: `reset('a','b')` does not recompute dirty for the whole object until next `setData`.\n+

## Fields and errors

`fields` / `setData` - read and update values. `setData('email', value)` or `setData({ email, name })`.

`errors` / `setError` / `clearErrors` - per-key strings. Zod paths use dots (`address.street`) because `validator.ts` joins `issue.path` with `.`. Only the first issue per path is kept.

For inputs that require `string`, use `String(form.fields.email ?? '')` or an equivalent cast.

`isSubmitting` - true while `client` runs (set before the call, cleared in `finally`).

## Dirty tracking and defaults

`isDirty` compares `fields` to an internal defaults snapshot using `JSON.stringify` via `utils.isEqual`. Prefer simple serializable values in `fields` if you rely on this.

`reset()` with no arguments restores all fields from defaults and sets `isDirty` to false. `reset('a', 'b')` resets only those keys from defaults; the hook does not recompute `isDirty` on that partial path, so dirty state may be stale until the next `setData`.

`setDefaults()` with no arguments copies current `fields` into defaults. Overloads update one or many default keys.

`setDataAndDefaults(partial)` replaces `fields` and defaults from `partial` and clears dirty (typical when loading an entity for edit).

`cancel()` aborts the current `AbortController` and sets `isSubmitting` to false. Each submit attaches a new controller.

## Validation before the network

If `schema` is set, each submit clears errors, then runs `schema.safeParse(fields)`. On failure, `form.errors` is filled, `onError` receives a synthetic `ApiError` (message: please review fields, `errors` aligned with `form.errors`), `onFinish` runs, and no HTTP request is sent.

Without `schema`, validation is skipped.

## HTTP helpers

All route to the same `submit(method, url, options)` in `core.ts`:

- `get` - no body.
- `post`, `put`, `patch` - body from `fields`.
- `destroy` - DELETE (avoids the `delete` keyword).
- `submit('PATCH', url, opts)` - explicit method.

Use relative paths from `config/api/endpoints`, for example `ENDPOINTS.ADMIN.AUTH.LOGIN`.

## Submit sequence (matches `core.ts`)

1. `setErrors({})`
2. Optional Zod; on failure, callbacks as above, then stop.
3. `setIsSubmitting(true)`, new `AbortController`, `client(url, { method, body?, throwOnError: false, signal })`
4. Success: `onSuccess`, clear errors, `isDirty` false.
5. Error response: if `response.errors` is a non-empty object, assign to `form.errors` and call `onError`; else `onFailure`.
6. `finally`: `isSubmitting` false, `onFinish`.

`onFinish` runs after Zod failure (no request) and after every completed request.

## Callbacks

`onSuccess(response)` - `ApiResponse` with `status: 'success'`.

`onError(error)` - Zod failure or API error with a non-empty `errors` map.

`onFailure(error)` - API error without that field map (for example wrong credentials).

`onFinish()` - always at the end of an attempt.

## Zod schemas

Place schemas under `domains/<feature>/schemas/` and align names with `fields` and the API.

## `lib/form` layout

`index.ts` exports `useForm` and public types. `core.ts` implements the hook. `types.ts` defines `FormFields`, `FormOptions`, `FormErrors`, `FormSubmitOptions`, `UseFormReturn`, and re-exports `ApiResponse`, `ApiError`, `HttpMethod` from `@/types/api`. `shortcuts.ts` adds `get`, `post`, `put`, `patch`, `destroy`. `validator.ts` implements `validateFormFields`. `utils.ts` has `deepClone` and `isEqual`.

## Examples in this repository

`components/admin/auth/LoginForm.tsx` - login schema, `form.post`, redirect, `onFailure` and `setError`.

`components/marketing/sections/contact/SendUsMessageSection.tsx` - contact schema, marketing contact endpoint, toasts.

## New form checklist

Schema in `domains/.../schemas/`. `useForm` in a `'use client'` file. Wire `fields`, `setData`, `errors`, `isSubmitting`. Submit with endpoint constants. Use `onSuccess`, `onError`, `onFailure`, `onFinish` instead of bypassing the hook.
