# Operational logging and report generation (admin dashboard)

This document is for the **admin frontend** (React/Vue, etc.): it describes how the backend models **operational report authoring**, which APIs to call, and a recommended **single-page “report workspace”** UX that stays aligned with the care-plan data model and the mobile “polished report” screens (period KPIs, target vs. actual per day, care-team feedback, publish).

**Base path:** all endpoints below are under `GET|POST|PUT` `https://{host}/api/v1/web/admin/…` and require a **Sanctum** bearer token for an **admin** user.

**Authorization:** all routes use the existing `view` policy on the parent `care_plan` (same idea as the care plan logging list). The care plan must be **active** or **completed** for the workspace and for creating a new report; otherwise the API responds with `422` validation error.

---

## 1) Concepts (map this to the UI)

| Layer | Role |
|--------|------|
| **Plan instructions (targets)** | Each scheduled day has section rows (nutrition, movement, activity, recovery) with optional `target_value` + unit — what the doctor prescribed. |
| **Client raw logs** | `care_plan_day_item_logs` hold `actual_value`, notes, `meta`, and optional media, keyed to a line item and a calendar `logged_at` date. |
| **Report snapshot (output)** | A **report run** stores the final numbers and narrative the client will see: metrics + daily points + care-team feedback. It is versioned and can be **draft** or **published**. |
| **Operational work** | The admin does not edit raw client logs in this flow; they **author** the report (adjust aggregates, add narrative, add meta notes) and then **publish**. |

**Status values** (`care_plan_report_runs.status`):

- `draft` — editable; not shown to the client as final.
- `published` — immutable snapshot; `locked_at` / `published_at` / `generated_at` are set.
- `generated` — may exist for legacy or seed data; new flows use `draft` → `published`.

Each run also stores **`period_starts_on`** and **`period_ends_on`**, which drive the report header and which `care_plan_days` are in scope (matched by `target_date` in that range).

---

## 2) Recommended admin UX (single “report workspace”)

Use **one screen** (one route) with **no full-page navigation** for the main loop:

1. **Sticky context** — care plan, client, selected **period** (start/end) within plan bounds, optional “last published” copy.
2. **Evidence column / rail** (read-only) — for each day in the period, list each line item with **target** vs **log** (actual, notes, image thumbnails). Clicking a thumbnail opens a **drawer or lightbox**; do not leave the page.
3. **Worksheet** — bind a grid to `suggested_metrics` from the server (or to `report_run.metrics` when resuming a draft). The doctor edits cells, per-day `daily_points`, and optional `meta` (e.g. “excluded outlier on Tue”).
4. **Narrative** — `summary` and `focus_next_period` (and optional internal `notes`). **Publishing** requires a non-empty **summary** (backend validation).
5. **Preview** (optional) — a read-only right panel that mirrors the mobile layout using the current draft payload, still the same URL.
6. **Actions** — “Save draft” → `POST` / `PUT` report run; “Publish” → `POST .../publish`.

**Autosave:** call `PUT` on a debounced interval after local edits, or on blur of major fields.

---

## 3) API reference

All successful responses use the standard envelope: `{ "status": "success", "message": "…", "data": { … } }` (and `meta.version` as elsewhere).

### 3.1 Load the workspace (evidence + suggested metrics, optional existing draft)

**`GET` `/api/v1/web/admin/care-plans/{care_plan}/report-workspace`**

**Query (choose one path):**

| Purpose | Query parameters |
|--------|------------------|
| New period (no saved draft) | `period_starts_on` and `period_ends_on` (inclusive, `Y-m-d`). Do **not** send `report_run_id`. |
| Resume a **draft** | `report_run_id` = existing draft’s id. Do **not** send period — the run’s `period_starts_on` / `period_ends_on` are used. |

Validation: period fields and `report_run_id` are **mutually exclusive** (sending both fails validation).

**`data` shape (simplified):**

- `care_plan` — `id`, `code`, `status`, `starts_on`, `ends_on`
- `client` — `id`, `name`, `client_code`, `email`, `picture_url` (if profile loaded)
- `period` — `starts_on`, `ends_on` (always the effective period for this response)
- `evidence` — array of per-day objects:
  - `day_index` — 1..N in the selected **period** (use for display order)
  - `day_number` — plan’s global `care_plan_days.day_number` (for cross-links to the builder)
  - `target_date` — `Y-m-d`
  - `items` — list of:
    - `section` — `nutrition` | `movement` | `activity` | `recovery`
    - `morph` — `nutrition` | `movement` | `activity` | `recovery` (concrete type)
    - `item_id` — id of the row
    - `title`, `guidance`
    - `target` — `{ value, unit, unit_id }` or `null` (movement has no target in DB)
    - `log` — `null` or `{ id, is_completed, actual_value, unit, notes, meta, media[] }` with `media[].url` when present
- `suggested_metrics` — **auto-rolled** metrics you can pre-fill in the form (see §4)
- `report_run` — `null` when not resuming, or the same structure as `GET …/report-runs/{id}` when `report_run_id` is passed (current draft with `metrics` + `feedback`)

**Route name (Laravel):** `v1.web.admin.care-plans.report-workspace`

---

### 3.2 List report runs (history for this care plan)

**`GET` `/api/v1/web/admin/care-plans/{care_plan}/report-runs`**

**`data`:** `{ "report_runs": [ { id, code, status, adherence_percentage, period, timestamps, generated_by? }, … ] }`

Use this for a side list or “previous reports” on the same workspace page.

**Route name:** `v1.web.admin.care-plans.report-runs.index`

---

### 3.3 Get one run (full snapshot)

**`GET` `/api/v1/web/admin/care-plans/{care_plan}/report-runs/{report_run}`**

Returns the full `report_run` object including `metrics` and nested `daily_points` (for edit forms).

**Route name:** `v1.web.admin.care-plans.report-runs.show`

---

### 3.4 Create a draft (first save)

**`POST` `/api/v1/web/admin/care-plans/{care_plan}/report-runs`**

**Body (JSON):**

- `period_starts_on`, `period_ends_on` — required, must sit inside the care plan’s own date range, and the server must have `care_plan_days` with `target_date` in that range.
- `metrics` — **required** as an array (may be empty `[]` for a bare draft). Each metric:
  - `section` — one of: `nutrition`, `movement`, `activity`, `recovery`
  - `metric_key` — string, unique per run (e.g. `meals_total_kcal`, `activity_walking`, `recovery_sleep`)
  - `label` — display string
  - `target_value`, `actual_value` — numbers or null
  - `unit` — short string (e.g. `kcal`, `steps`, `L`)
  - `days_on_target`, `days_total` — small integers
  - `display_order` — integer; server also re-orders in `suggested_metrics`
  - `meta` — optional object (formula notes, audit text)
  - `daily_points` — required array; each point:
    - `day_number` — 1..N within the **metric’s period** (same as `day_index` in evidence)
    - `target_value`, `actual_value` — optional numbers
    - `on_target` — boolean
    - `meta` — optional
- `adherence_percentage` — optional; if omitted, derived from the submitted `metrics` (mean of `days_on_target` / `days_total` per metric).
- `feedback` — optional; if present: `summary`, `focus_next_period`, `notes` (all optional strings for a draft; **summary** must be non-empty at publish time).

**Response:** `201` with the full saved run (includes `id`, `code`, `status: "draft"`, `metrics`, `feedback`).

**Route name:** `v1.web.admin.care-plans.report-runs.store`

**Typical use:** pre-fill the body with `suggested_metrics` from the workspace `GET` (or merge your local edits) and `POST` once to create a draft, then `PUT` for later saves.

---

### 3.5 Update a draft

**`PUT` `/api/v1/web/admin/care-plans/{care_plan}/report-runs/{report_run}`**

You may send a **partial** body:

- `metrics` — if present, **replaces all metrics** (and their daily points) for that run.
- `feedback` — if the key is present, upserts or clears the feedback row.
- `adherence_percentage` — if a numeric value is present, it wins; otherwise adherence is recalculated from the stored `metrics` after the update.

Only **`draft`** runs can be updated; otherwise `422`.

**Route name:** `v1.web.admin.care-plans.report-runs.update`

---

### 3.6 Publish (finalize for the client)

**`POST` `/api/v1/web/admin/care-plans/{care_plan}/report-runs/{report_run}/publish`**

**Body (optional):**

- `adherence_percentage` — optional override; if omitted, recalculated from the run’s `metrics` after load.

**Rules:**

- Only **`draft`** runs.
- A feedback row with a **non-empty `summary`** must exist; otherwise `422` with `feedback.summary` error.

**Effect:** `status` → `published`, timestamps set, `adherence_percentage` applied.

**Route name:** `v1.web.admin.care-plans.report-runs.publish`

---

## 4) How `suggested_metrics` are built (so the UI can label them)

The backend heuristics are designed to line up with the product examples (meals, walking, sleep, hydration):

- **Meals (kcal)** — if any nutrition row in the period uses a **kcal** unit, a single metric `meals_total_kcal` is created: per day, targets and actuals are **summed** across kcal rows; period totals and `days_on_target` are derived. Days with no kcal target rows are marked in point `meta`.
- **Activity** — for each **distinct activity title** (case-insensitive) seen in the period, a metric (e.g. `activity_walking`) rolls up that title day-by-day: one row per day with matching `title` if present, else a “row missing on day” point.
- **Recovery** — same as activity, per **distinct recovery title** (e.g. Sleep, Hydration).

**“On target” (auto):** a day point is on target if `actual >= target` when both are present (simplified). Doctors can **override** `on_target` and values when they save the draft.

**Movement** rows appear in **evidence** (for photos / notes) but are **not** auto-rolled into metrics unless you add custom metrics manually in the payload.

---

## 5) Error cases the UI should handle

- **422** with `message` / `errors` when:
  - care plan is not `active` or `completed` (workspace / create);
  - period is outside the plan;
  - no `care_plan_days` exist in the range;
  - period + `report_run_id` are mixed on the workspace `GET` (if both are sent, validation error);
  - publish without non-empty `summary`.
- **404** if `{report_run}` does not belong to `{care_plan}`.
- **401** if not authenticated.

---

## 6) Suggested front-end state model (minimal)

```text
{
  carePlanId,
  period: { startsOn, endsOn } | null,
  reportRunId: string | null,
  evidence: EvidenceDay[],
  formMetrics: ReportMetric[]   // from suggested_metrics or from report_run.metrics
  feedback: { summary, focusNextPeriod, notes } | null
}
```

**Flow:** `GET` workspace (with or without `report_run_id`) → set `formMetrics` and `feedback` from `suggested_metrics` or `report_run` → on save `POST` or `PUT` with the current form → on publish `POST` publish.

---

## 7) Mobile / client read API

A dedicated **client-facing** `GET` for published `care_plan_report_runs` is not part of this admin PR; the mobile app will read the same `metrics` + `feedback` + `period` once that endpoint is added. The admin UIs should treat **published** runs as the source of truth for what the app displays after release.

---

## 8) Related backend files (for support / debugging)

- `App\Services\Web\Admin\CarePlan\CarePlanReportWorkspaceService`
- Controllers under `App\Http\Controllers\V1\Web\Admin\CarePlan\` (see `routes/api/v1/web/admin.php` names in §3)
- Migrations: `care_plan_report_*` + `2026_04_24_100000_add_period_and_draft_to_care_plan_reports.php`

This should be enough to wire a **cohesive report workspace** that keeps doctors on one screen, shows **target vs. actual** from plan + logs, and persists **drafts** and **published** reports against the same schema the mobile “Stress Resilience Blueprint”-style views will consume.
