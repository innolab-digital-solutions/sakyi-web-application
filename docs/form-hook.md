## Form Handling Hook (`hooks/form`)

This document describes the custom `useForm` hook and supporting utilities in `hooks/form`. The hook provides a consistent, type‑safe way to manage form state, validation, and HTTP submissions on top of the shared API client.

All public exports live behind the index:

```ts
import { useForm, validate, deepClone, isEqual } from '@/hooks/form';
import type {
  FormData,
  FormErrors,
  SubmitOptions,
  UseFormOptions,
  UseFormReturn,
} from '@/hooks/form';
```

---

## Goals and Design Principles

- **Unify form handling** across pages and admin modules.
- **Integrate deeply with the HTTP client** (`lib/api/client`) instead of each form wiring `fetch` manually.
- **First‑class validation**:
  - Zod‑based schemas.
  - Field‑error mapping.
  - Clear separation between validation errors and system failures.
- **Developer‑friendly API**:
  - Inertia‑style `useForm` interface with `get/post/put/patch/destroy`.
  - `transform` builder for request shaping.
  - Dirty state and cancellation built‑in.

The hook is designed to feel familiar if you have used Inertia.js v1’s `useForm`, but with a type‑safe, Zod‑based core and Next‑/fetch‑aware HTTP integration.

---

## Module Layout

Files under `hooks/form`:

- `core.ts` – implementation of the `useForm` hook.
- `types.ts` – shared form types (`FormData`, `FormErrors`, `UseFormReturn`, etc.).
- `validation.ts` – Zod validation helper (`validate`).
- `builders.ts` – HTTP method and transform builders.
- `utils.ts` – internal utilities (`deepClone`, `isEqual`).
- `index.ts` – barrel exports for consumers.

Consumers should always import from `@/hooks/form`.

---

## `useForm` Overview

```ts
const form = useForm(
  {
    email: '',
    password: '',
  },
  { schema: LoginSchema },
);
```

Admin login schemas live under `@/domains/auth/schemas` (see `LoginSchema`).

Form state is inferred from the Zod schema you pass in via `FormData<TSchema>`. The hook exposes:

- **State**
  - `data` – current form values.
  - `errors` – field errors (validation + server).
  - `isDirty` – `true` if data differs from defaults.
  - `processing` – `true` while an HTTP request is in flight.
- **Data manipulation**
  - `setData` – update one field or merge partial data.
  - `reset` – reset all or specific fields to defaults.
  - `setDefaults` – update tracked defaults from current data or a partial object.
  - `setDataAndDefaults` – set data and defaults atomically.
- **Error handling**
  - `setError` – set errors for a field or multiple fields.
  - `clearErrors` – clear all or specific field errors.
- **Request control**
  - `cancel` – abort the current submission (if any).
- **Submission**
  - `submit(method, url, options)` – full control.
  - HTTP shortcuts: `get`, `post`, `put`, `patch`, `destroy`.
- **Transforms**
  - `transform(fn)` – build a chain of transformed HTTP methods (`transform(fn).post(...)`).

---

## Typing and Validation

### `FormData<TSchema>`

`FormData<TSchema>` is inferred from the Zod schema and extended with an index signature:

```ts
type FormData<TSchema extends ZodType> = z.infer<TSchema> &
  Record<string, unknown>;
```

This allows:

- Strong typing for schema‑defined fields.
- Flexibility for additional keys or nested structures when needed.

### `FormErrors<T>`

```ts
type FormErrors<T> = Partial<Record<keyof T | string, string>>;
```

Notes:

- Supports direct keys from `FormData<TSchema>` and string paths (e.g. `"address.city"`).
- Used consistently across validation and server error mapping.

### Validation (`validation.ts`)

`validate(schema, data)`:

- Runs `schema.safeParse(data)`.
- When valid: returns `{ success: true, errors: {} }`.
- When invalid:
  - Flattens `ZodIssue`s to a field‑error map using dot‑separated paths.
  - Only keeps the first error per field.

The hook calls this automatically on submit when `options.schema` is provided.

---

## Submitting Forms

### Core `submit` method

```ts
await form.submit('POST', '/admin/auth/login', {
  onSuccess: (response) => {
    /* ... */
  },
  onError: (validationError) => {
    /* field errors already set */
  },
  onFailure: (systemError) => {
    /* network/server issues */
  },
  onFinish: () => {
    /* always called */
  },
});
```

Submission flow:

1. **Clear previous errors** via `clearErrors()`.
2. **Validate** with Zod if a schema is configured.
3. **Set `processing = true`** and attach an `AbortController`.
4. **Compute payload**:
   - Use raw `data` or the output of `transformFn` if the user called `transform`.
5. **Perform request** using the `http` helpers from `lib/api/client` with `throwOnError: false`.
6. **Handle response**:
   - If `status === 'error'`:
     - If `errors` map is present → treat as validation errors:
       - Populate `form.errors`.
       - Call `onError` callback.
     - Else → treat as system failure:
       - Call `onFailure` callback.
   - If `status === 'success'`:
     - Clear errors.
     - Mark `isDirty = false`.
     - Call `onSuccess`.
7. **Always** call `onFinish` and set `processing = false` in `finally`.

### HTTP Shortcuts

For convenience, you rarely need to call `submit` directly. Instead use:

```ts
await form.post('/admin/auth/login', {
  onSuccess: (response) => {
    /* ... */
  },
});
```

Shortcuts:

- `form.get(url, options?)`
- `form.post(url, options?)`
- `form.put(url, options?)`
- `form.patch(url, options?)`
- `form.destroy(url, options?)`

Each one calls `submit` with the appropriate HTTP method and your callbacks.

---

## Transforming Data Before Submit

Complex forms often need to transform data (e.g. flatten nested structures, strip empty strings, or build multi‑part payloads). The transform builder supports this:

```ts
form
  .transform((data) => ({
    ...data,
    email: data.email.toLowerCase().trim(),
  }))
  .post('/admin/users', {
    onSuccess: (response) => {
      /* ... */
    },
  });
```

Under the hood:

- `buildTransformChain` wraps the core `submit` with an extra `transform` function.
- The transform’s result is passed to the HTTP client as the payload (either left as is, or further serialized to JSON/FormData by the API client).

Use `transform` for:

- Normalizing input (trimming, lowercasing).
- Renaming fields to match backend expectations.
- Converting UI‑friendly values into backend‑friendly payloads.

---

## Dirty State and Defaults

The hook tracks a separate `defaults` snapshot:

- On initialization, `defaults` is a deep clone of the initial data.
- `isDirty` is set by comparing `data` to `defaults` using `isEqual`.

You can control defaults explicitly:

- `setDefaults()` – use current `data` as the new defaults.
- `setDefaults(field, value)` – override a single default.
- `setDefaults(partial)` – merge partial defaults.
- `setDataAndDefaults(partial)` – update both data and defaults at once.

This is useful when:

- Loading existing entities (edit forms).
- Resetting dirty state after a successful save.

---

## Error Handling Patterns

Typical patterns for handling validation and system errors:

```ts
await form.post('/admin/clients', {
  onError: (error) => {
    // Validation errors are already copied into form.errors
    // Optionally log or show a toast
  },
  onFailure: (error) => {
    // Network/server error, no field-level map
    showToast(error.message);
  },
});
```

Key points:

- You **do not** need to manually map field errors; the hook does that for you.
- Use `onError` when the backend response has a structured `errors` payload.
- Use `onFailure` for generic failures (no structured field map).

---

## Utilities

### `deepClone`

Used to avoid accidental shared references when initializing or updating default values. It:

- Uses `structuredClone` when available.
- Falls back to a simple recursive clone for arrays and plain objects.

### `isEqual`

Compares two values using `JSON.stringify`. This is sufficient for typical form payloads (`string`, `number`, `boolean`, plain objects/arrays).

> Note: If you later introduce non‑serializable values (e.g. `Date` objects or class instances) into `FormData`, consider tightening equality semantics or constraining supported types.

---

## When to Use `useForm`

Use `useForm` when:

- You have a **stateful form** with validation, dirty tracking, and HTTP submission.
- You want a **consistent, Inertia‑style API** across different parts of the app.
- You want to **centralize error handling** and avoid repeated fetch/try/catch logic.

Use simple local state (`useState`, `react-hook-form`, etc.) when:

- The form is tiny and has no server interaction.
- You only collect a transient value (e.g. a search box that doesn’t submit via the API client).

For anything that talks to the backend and deserves consistent UX (loading, errors, dirty state), `useForm` is the preferred, higher‑level primitive. It sits on top of the HTTP client so the team gets aligned behavior across all forms. +
