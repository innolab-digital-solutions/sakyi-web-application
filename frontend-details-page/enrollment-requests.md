# Admin enrollment requests — API response and UI guide

This document describes the **`GET`** / **`PATCH`** / **`POST …/cancel`** admin responses where the payload type is **`EnrollmentRequestResource`** (`App\Http\Resources\V1\Web\Admin\EnrollmentRequestResource`).

Routes (v1 web admin):

- **`GET`** `…/enrollment-requests` — paginated **`data`** array; each element is one resource.
- **`GET`** `…/enrollment-requests/{enrollment_request}` — single resource as **`data`**.
- **`PATCH`** `…/enrollment-requests/{enrollment_request}` — updated resource as **`data`**.
- **`POST`** `…/enrollment-requests/{enrollment_request}/cancel` — cancelled resource as **`data`**.

---

## Compatibility note (important)

- **Existing top-level keys, nested keys, names, and their order were not changed.** The listing screen can keep the same accessors as before (e.g. `data[].id`, `data[].status`, … in the array case).
- **New data is appended only:**
  - New field inside **`client`**: **`contact_phone`** (after **`picture_url`**).
  - New fields inside **`contract`** (when a contract exists): **`voided_at`**, **`void_reason`** (after **`signed_at`**).
  - New fields inside **`onboarding_intake`** (when an intake exists): **`completed_at`**, **`cancelled_at`** (after **`status`**).
  - **New top-level key after `timestamps`:** **`enrollments`** (array).

---

## Payload shape (`data`)

All fields below are documented in **serialization order**. Types are described for integration; nullability matches the backend.

### Top level (unchanged order for original keys)

| Field               | Type           | Notes                                                         |
| ------------------- | -------------- | ------------------------------------------------------------- |
| `id`                | number         |                                                               |
| `code`              | string         | Business code                                                 |
| `phone`             | string         | Phone captured on the request (may differ from profile)       |
| `status`            | string         | Enrollment request status enum value                          |
| `cancellation_note` | string \| null |                                                               |
| `contacted_at`      | string \| null | ISO 8601                                                      |
| `completed_at`      | string \| null | ISO 8601                                                      |
| `cancelled_at`      | string \| null | ISO 8601                                                      |
| `client`            | object \| null | Present when relation loaded (admin routes load it)           |
| `program`           | object \| null | Present when relation loaded                                  |
| `handler`           | object \| null | Last staff handler; present when relation loaded              |
| `contract`          | object \| null | Enrollment contract reachable from this pipeline; else `null` |
| `onboarding_intake` | object \| null | Present when relation loaded                                  |
| `timestamps`        | object         | `created_at`, `updated_at` (ISO 8601)                         |
| **`enrollments`**   | **array**      | **New.** See below                                            |

### `client` (existing keys unchanged; \*\*`contact_phone` appended`)

| Field               | Type               |
| ------------------- | ------------------ |
| `id`                | number             |
| `client_code`       | string \| null     |
| `name`              | string \| null     |
| `email`             | string \| null     |
| `picture_url`       | string \| null     |
| **`contact_phone`** | **string \| null** |

Compare **`phone`** on the enrollment request vs **`contact_phone`** on the client for outreach (they can differ).

### `program` (unchanged)

Includes `title` and `slug` when **`translation`** is loaded (admin routes load it).

### `handler` (unchanged)

### `contract` (existing keys unchanged; **`voided_at`** / **`void_reason`** appended when contract exists)

| Field             | Type               |
| ----------------- | ------------------ |
| `id`              | number             |
| `code`            | string             |
| `status`          | string             |
| `sent_at`         | string \| null     |
| `signed_at`       | string \| null     |
| **`voided_at`**   | **string \| null** |
| **`void_reason`** | **string \| null** |

### `onboarding_intake` (existing keys unchanged; timeline fields appended when intake exists)

| Field              | Type               |
| ------------------ | ------------------ |
| `id`               | number             |
| `code`             | string             |
| `status`           | string             |
| **`completed_at`** | **string \| null** |
| **`cancelled_at`** | **string \| null** |

### `enrollments` (new top-level array)

Items are **summaries** for the pipeline detail view, sorted by **`id` descending** (newest first).

Each item:

| Field          | Type           | Notes                                                |
| -------------- | -------------- | ---------------------------------------------------- |
| `id`           | number         |                                                      |
| `code`         | string         |                                                      |
| `status`       | string         | e.g. `scheduled`, `active`, `completed`, `cancelled` |
| `starts_at`    | string \| null | Date **`YYYY-MM-DD`**                                |
| `ends_at`      | string \| null | Date **`YYYY-MM-DD`**                                |
| `completed_at` | string \| null | ISO 8601                                             |
| `cancelled_at` | string \| null | ISO 8601                                             |

**When there is no onboarding intake:** `onboarding_intake` is `null` and **`enrollments` is `[]`**.

**When there is an intake but no enrollments yet:** **`enrollments` is `[]`**.

**Choosing a “primary” row in the UI (optional):** Prefer an item with `status === 'active'`, else `scheduled`, else the first entry (already newest-first).

---

## UI / UX structure for the **details** page

### 1. Header / summary

- Show **`code`**, **`status`**, **`phone`**, and **`timestamps.created_at`**.
- Show **`cancellation_note`** prominently when **`status`** is cancelled (or when `cancelled_at` is set).

### 2. Two-column or stacked cards: **Client** and **Program**

- **Client:** name, picture, email, **`client_code`**, link to the full client profile route.
- Surface **both** request **`phone`** and **`client.contact_phone`** with short labels so staff know which is which.

### 3. Pipeline / journey (recommended)

A horizontal stepper or vertical timeline, in business order:

1. **Enrollment request** (this record) — use request status and `contacted_at` / `completed_at` / `cancelled_at`.
2. **Onboarding intake** — from `onboarding_intake`. If `null`, show “Not started” and link to the action that creates intake (if your product has one).
3. **Contract** — from `contract`. If `null`, empty state. If **`voided_at`** / **`void_reason`** present, show as a warning or secondary line.
4. **Enrollment** — derived from **`enrollments`**. If empty, “No enrollment yet”. If present, show the chosen summary row and deep-link to the enrollment admin screen using `id` or `code` as your app routes require.

Keep **intake answers** and **full contract body** on their dedicated screens; this page only needs **status + IDs/codes + dates** plus navigation.

### 4. Operations / audit

- **Handler** block: who last touched the request.
- Optional compact **activity** line from ISO timestamps (request + intake + contract + enrollment).

### 5. Listing vs detail

- **Listing** now receives the same extended fields (including **`enrollments`**). You can ignore **`enrollments`** in the table to avoid noise, or show a compact badge (e.g. count or “Active” if any item is `active`).

---

## Summary for frontend implementers

1. **Do not rename or reorder** existing fields; only **read** the new appended fields.
2. **`enrollments`** is included whenever the **`onboarding_intake`** relation is eager-loaded (all current admin enrollment-request controllers load it via `EnrollmentRequest::relationshipsForAdminResource()`). Value is **`[]`** if there is no intake or no enrollment rows yet. If a future caller uses this resource without loading **`onboarding_intake`**, the **`enrollments`** key may be omitted—defensive UI may default to **`[]`**.
3. Build the details page as **overview + deep links**; use **`enrollments`** to show conversion state without a second request when this payload is already loaded.
