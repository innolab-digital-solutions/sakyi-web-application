# Operational logs & client period reports (admin API)

This document is the **single reference** for admin frontends building **operational logging** (internal rollups from client raw logs) and **client-facing period reports** (review, publish, archive). It replaces the former `admin-operational-logs-and-period-reports-table-listing.md` and `operational-logs-handling-and-report-generating.md`.

**Base URL:** `https://{host}/api/v1/web/admin`

**Auth:** `Authorization: Bearer {sanctum_token}` (admin). List routes use `Gate::viewAny(CarePlan::class)`; care-plan-scoped routes use `Gate::view` on the route `care_plan`.

**Version:** Responses include `meta.version` (e.g. `v1`) on success payloads.

---

## 1. Two concepts (do not merge in the UI)

| Concept | Table / model | Purpose |
|--------|-----------------|--------|
| **Operational log** | `care_plan_operational_logs` | **Internal only:** at **most one row per care plan** (enforced in DB and on create). Period, adherence, metrics, daily points. Status: `draft`, `in_progress`, or `locked`. |
| **Client report** | `care_plan_report_runs` | **Client-facing lifecycle:** at **most one row per care plan** (enforced in DB). Care-team feedback (summary, focus, notes), review, publish. Linked **one-to-one** to that care plan’s operational log after “submit for review”. Status: `in_review`, `published`, `archived`. |

**Metrics** always live on the **operational log**. The client report row **does not** duplicate period/adherence/metrics; it references the same metrics via the linked operational log.

**Feedback** (`care_plan_report_feedback`) belongs **only** to the client report row, not to the operational log.

---

## 2. What to remove or change from the old frontend flow

The previous design treated **one** `care_plan_report_runs` row as both “draft metrics container” and “report”, with statuses `draft` / `generated` / `published` and a **Generate** step. That is **gone**. Migrate as follows:

| Old behavior | Action |
|----------------|--------|
| Single entity for both “work in progress” and “report” | **Split:** use **operational log** for metrics editing; **client report** for narrative + publish. |
| Statuses `draft`, `generated`, `published` on one row | **Drop** for the client report row. Client report uses `in_review`, `published`, `archived`. **Operational log** has its own `draft` → `in_progress` → `locked` lifecycle (see §3). |
| `GET /operational-logs` with `include_published` | **Remove** this query param — it never applied to the new model and is not supported. |
| `POST .../report-runs/{id}/generate` | **Remove** — replaced by `POST .../operational-logs/{id}/submit-for-review`, which creates the client report in `in_review`. |
| `POST /report-runs` to create an operational log | **Removed** — use `POST .../operational-logs/draft` (empty worksheet) or `POST .../operational-logs` (at least one metric). |
| `PUT /report-runs/{id}` updating metrics + feedback | **Split:** metrics → `PUT .../operational-logs/{id}`; feedback only → `PUT .../report-runs/{id}`. |
| List tables both backed by `care_plan_report_runs` with the same row shape | **Replace:** **Operational logs** list = `CarePlanOperationalLog` rows; **Period reports** list = `CarePlanReportRun` rows (different JSON — see below). |
| `timestamps.generated_at` on lists | **Drop** — use `submitted_for_review_at` on client report rows. Operational log list has no `generated_at`. |
| Workspace `GET` only `report_run_id` or period | **Add** `operational_log_id` as a third way to load context (mutually exclusive with the other two). |
| Per–care-plan list key `data.report_runs` | **Rename to** `data.client_reports` (see §6). |

---

## 3. Status values (strings in JSON)

**Operational log** (`care_plan_operational_logs.status`):

| Value | Meaning |
|--------|---------|
| `draft` | Period is set; no metrics saved yet (or empty `metrics`). Same idea as a care plan draft — the row appears in **Operational logs** lists so the admin is not looking at an empty table. |
| `in_progress` | At least one metric row exists, or you used `POST …/operational-logs` with metrics. Figures can still be edited. |
| `locked` | Internal figures frozen (e.g. after the client report is published). |

**Transitions (backend):**

- `POST …/operational-logs/draft` (default period = care plan; optional sub-range) → **`draft`**.
- `POST …/operational-logs` with a **non-empty** `metrics` array → **`in_progress`** (this route does not create a draft).
- `PUT …/operational-logs/{id}`: if the log was **`draft`** and after the update it has **at least one** metric row → **`in_progress`**.
- **Submit for review** (`POST …/submit-for-review`) is allowed only when status is **`in_progress`** (not `draft`). Save metrics first.

**Client report** (`care_plan_report_runs.status`):

| Value | Meaning |
|--------|---------|
| `in_review` | Submitted for review; narrative may be edited; not yet published to the client app. |
| `published` | Final for the client-facing snapshot; operational log is locked. |
| `archived` | Optional terminal state for old reports (list by explicit `status` if you show them). |

---

## 4. Standard success envelope

### 4.1 Single resource

```json
{
  "status": "success",
  "message": "…",
  "data": { },
  "meta": { "version": "v1" }
}
```

### 4.2 Paginated lists (`GET operational-logs`, `GET period-reports`, `GET care-plan-logs`)

Items are a **top-level array** in `data` (not wrapped in a key). Pagination is in `meta.pagination`:

```json
{
  "status": "success",
  "message": "…",
  "data": [ { } ],
  "meta": {
    "version": "v1",
    "pagination": {
      "current_page": 1,
      "per_page": 15,
      "total": 42,
      "last_page": 3,
      "from": 1,
      "to": 15,
      "has_more_pages": true,
      "path": "https://{host}/api/v1/web/admin/…",
      "next_page_url": "…",
      "prev_page_url": null
    }
  }
}
```

Use `page` and `per_page` query parameters for pagination. Default `per_page` is **15** for `operational-logs` and `period-reports`, **10** for `care-plan-logs` (see each controller).

### 4.3 Created (HTTP 201)

Same JSON envelope as §4.1 (`status: success`, `message`, `data`, `meta.version`), but the HTTP status is **201** for creates:

- `POST /care-plans/{care_plan}/operational-logs/draft` → *Operational log draft created successfully.*
- `POST /care-plans/{care_plan}/operational-logs` → *Operational log created successfully.*
- `POST /care-plans/{care_plan}/operational-logs/{operational_log}/submit-for-review` → *Client report submitted for review successfully.*

`data` uses the shapes in **§4.5** (operational log for the first two, client report for submit-for-review).

### 4.4 Error responses (validation / domain)

Validation failures (typically HTTP **422**) use the shared error envelope: `status: "error"`, `message`, `errors` (object: field / rule keys → string or array of messages), and `meta.version`. Other HTTP codes follow the same `status` + `message` pattern where applicable.

### 4.5 Authoritative `data` shapes (match PHP services / resources)

These are the **exact** server shapes your UI should model (types: dates `Y-m-d` strings, datetimes ISO 8601 strings from `toISOString()`).

#### 4.5.1 Operational log — `formatOperationalLog` (service)

Used for: **`data`** on `POST` draft, `POST` store, `PUT` op log; **`data.operational_log`** inside **`GET report-workspace`**. Does **not** include care team feedback.

```json
{
  "id": 1,
  "code": "SKOL-2026-…",
  "status": "in_progress",
  "adherence_percentage": 72,
  "period": { "starts_on": "2026-04-10", "ends_on": "2026-04-16" },
  "client_report_id": 9,
  "timestamps": { "locked_at": null },
  "metrics": [
    {
      "id": 10,
      "section": "nutrition",
      "metric_key": "meals_total_kcal",
      "label": "…",
      "target_value": 14000.0,
      "actual_value": 13200.0,
      "unit": "kcal",
      "days_on_target": 5,
      "days_total": 7,
      "display_order": 0,
      "meta": null,
      "daily_points": [
        {
          "id": 100,
          "day_number": 1,
          "target_value": 2000.0,
          "actual_value": 1900.0,
          "on_target": true,
          "meta": null
        }
      ]
    }
  ]
}
```

- `client_report_id` is `null` until a client report row exists.
- `timestamps.locked_at` is set when the op log is `locked` (e.g. after publish).
- `metrics` is ordered by `display_order` (and each metric’s `daily_points` by `day_number`).

#### 4.5.2 Client report — `formatReportRun` (service)

Used for: **`data`** on `GET` / `PUT` report run, `POST` publish, and **`201`** on submit-for-review. Includes full metrics (via linked op) + feedback. **Does not** include `generated_by`.

```json
{
  "id": 9,
  "code": "SKR-2026-…",
  "status": "in_review",
  "operational_log_id": 1,
  "adherence_percentage": 72,
  "period": { "starts_on": "2026-04-10", "ends_on": "2026-04-16" },
  "timestamps": {
    "submitted_for_review_at": "2026-04-20T10:00:00.000000Z",
    "published_at": null,
    "locked_at": null
  },
  "metrics": [],
  "feedback": {
    "summary": "…",
    "focus_next_period": "…",
    "notes": "…"
  }
}
```

- `metrics` is the same structure as in §4.5.1 (`formatMetric` / `daily_points`).
- `feedback` is `null` if no row exists.

#### 4.5.3 Client report — list/summary `formatReportRunSummary` (service)

Used only for **`GET /care-plans/{care_plan}/report-runs`**: each element inside **`data.client_reports`**. Lighter than §4.5.2 (no `metrics` / `feedback` / `operational_log_id`).

```json
{
  "id": 9,
  "code": "SKR-2026-…",
  "status": "in_review",
  "adherence_percentage": 72,
  "period": { "starts_on": "2026-04-10", "ends_on": "2026-04-16" },
  "timestamps": {
    "submitted_for_review_at": "2026-04-20T10:00:00.000000Z",
    "published_at": null,
    "locked_at": null
  },
  "generated_by": { "id": 5, "name": "…" }
}
```

`generated_by` is `null` if not loaded. With the **one report per care plan** rule, `data.client_reports` has **0 or 1** item.

#### 4.5.4 Care plan logging — `CarePlanLogResource` (index + show)

**`GET /care-plan-logs`**, **`GET /care-plan-logs/{carePlan}`** — `data` is a paginated **array of care plans** (index) or a **single object** (show). Relevant fields for reporting:

```json
{
  "id": 2,
  "code": "…",
  "cycle_number": 1,
  "status": "active",
  "starts_on": "2026-04-10",
  "ends_on": "2026-04-20",
  "last_logged_at": "2026-04-18T12:00:00.000000Z",
  "days_count": 7,
  "completion_signal": {
    "window_days_total": 7,
    "window_elapsed_days": 3,
    "window_progress_percentage": 42,
    "logged_days_count": 2,
    "logging_progress_percentage": 28,
    "is_logging_recent": true
  },
  "enrollment": {
    "id": 1,
    "code": "…",
    "client": { "id": 34, "client_code": "…", "name": "…", "email": "…", "picture_url": null },
    "program": { "id": 1, "code": "…", "thumbnail_url": "…", "title": "…" }
  },
  "operational_log": null,
  "timestamps": { "created_at": "…", "updated_at": "…" }
}
```

- **`operational_log`**: at most **one** row per care plan. When the relation is loaded and present, the object matches **`CarePlanOperationalLogResource`** (§5.1). In this context the nested `care_plan` and `client` fields on that resource are usually **`null`** (parent `data` already carries `care_plan` / enrollment client context).

#### 4.5.5 Report workspace — merged `data` (controller + `buildWorkspace`)

**`GET /care-plans/{care_plan}/report-workspace`** returns **`data`** as the union of:

- **`care_plan`** — `{ id, code, status, starts_on, ends_on }` (date strings)
- **`client`** — `{ id, name, client_code, email, picture_url }` or `null`
- **`period`**, **`evidence`**, **`suggested_metrics`** — from `CarePlanReportWorkspaceService::buildWorkspace`
- **`operational_log`** — `formatOperationalLog` (§4.5.1) or `null`
- **`client_report`** and **`report_run`** — same object: `formatReportRun` (§4.5.2) or `null` (alias for backward compatibility)

**`evidence`**: array of days, each with `day_index`, `day_number`, `target_date`, and `items` (nutrition / activity / recovery / movement rows with `section`, `morph`, `item_id`, `title`, `target`, `log`, etc.).

**`suggested_metrics`**: array of suggested worksheet rows (shape aligns with `metrics` in §4.5.1 for binding; includes `metrics.*.daily_points` with `present` rules on create—see `StoreCarePlanOperationalLogRequest`).

---

## 5. Global admin lists (sidebar / dashboards)

### 5.1 Operational logs (internal) — `GET /operational-logs`

**Route name:** `v1.web.admin.operational-logs.index`

**Purpose:** Rows are **operational logs** (not client reports). Use for “internal authoring / rollups per period”.

**Query parameters:**

| Param | Type | Description |
|--------|------|-------------|
| `status` | string | Optional. `draft`, `in_progress`, or `locked`. If omitted, **all** operational logs are returned (all statuses). |
| `search` | string | Optional. Matches operational log `code`, care plan `code`, client name/email/client_code. |
| `care_plan_id` | integer | Optional. Filter to one care plan. |
| `per_page` | integer | Optional, 1–100, default 15. |
| `page` | integer | Optional. |

**Each row** (`CarePlanOperationalLogResource`) — list/detail for the global op-log table; **not** the same shape as `formatOperationalLog` (§4.5.1). Includes list UX fields: `is_editable`, embedded `care_plan` / `client` / `created_by` when relations are loaded.

```json
{
  "id": 1,
  "code": "SKOL-2026-…",
  "status": "draft",
  "is_editable": true,
  "adherence_percentage": 72,
  "period": { "starts_on": "2026-04-10", "ends_on": "2026-04-16" },
  "client_report": {
    "id": 9,
    "code": "SKR-2026-…",
    "status": "in_review"
  },
  "care_plan": { "id": 2, "code": "…", "status": "active", "starts_on": "…", "ends_on": "…" },
  "client": { "id": 34, "name": "…", "client_code": "…", "email": "…", "picture_url": null },
  "created_by": { "id": 5, "name": "…" },
  "timestamps": {
    "locked_at": null,
    "created_at": "2026-04-18T08:00:00.000000Z",
    "updated_at": "2026-04-20T10:15:00.000000Z"
  }
}
```

- `is_editable` is `true` for `draft` and `in_progress` (not `locked`).
- `client_report` is `null` until a client report row exists (after **submit for review**).
- **Cardinality:** with one operational log per care plan, this list is effectively **one row per care plan** that has a log, plus filters/pagination.

**Open workspace from a row:** prefer `operational_log_id`:

`GET /care-plans/{care_plan_id}/report-workspace?operational_log_id={id}`

(You can also use `care_plan` + `id` from the row’s `care_plan.id`.)

---

### 5.2 Client period reports (global) — `GET /period-reports`

**Route name:** `v1.web.admin.period-reports.index`

**Purpose:** Rows are **client reports** (review / published / archived).

**Query parameters:**

| Param | Type | Description |
|--------|------|-------------|
| `status` | string | Optional. One of `in_review`, `published`, `archived`. If omitted, the default is **`in_review` and `published` only** (archive excluded from the default view). |
| `search` | string | Optional. Same idea as operational logs (report code, care plan code, client fields). |
| `care_plan_id` | integer | Optional. |
| `per_page` | integer | Optional, 1–100, default 15. |
| `page` | integer | Optional. |

**Each row** (`ClientReportListResource`):

```json
{
  "id": 9,
  "code": "SKR-2026-…",
  "status": "in_review",
  "is_editable": true,
  "adherence_percentage": 72,
  "period": { "starts_on": "2026-04-10", "ends_on": "2026-04-16" },
  "operational_log": { "id": 3, "code": "SKOL-2026-…" },
  "care_plan": { "id": 2, "code": "…", "status": "active", "starts_on": "…", "ends_on": "…" },
  "client": { "id": 34, "name": "…", "client_code": "…", "email": "…", "picture_url": null },
  "generated_by": { "id": 5, "name": "…" },
  "timestamps": {
    "submitted_for_review_at": "2026-04-20T10:00:00.000000Z",
    "published_at": null,
    "locked_at": null,
    "created_at": "…",
    "updated_at": "…"
  }
}
```

- `is_editable` is `true` only for `in_review` (narrative/feedback via `PUT` on the client report).
- `generated_by` is the admin who created the **client report** when submitting for review.

**Open workspace:** `GET /care-plans/{id}/report-workspace?report_run_id={id}`

---

### 5.3 Care plan logging (home / detail)

**`GET /care-plan-logs`**, **`GET /care-plan-logs/{carePlan}`**

**Route names:** `v1.web.admin.care-plan-logs.index` · `v1.web.admin.care-plan-logs.show`  
**Response:** `CarePlanLogResource` — see **§4.5.4**. Index is paginated (§4.2); show returns one object. Use **`data.operational_log`** to deep-link to the op-log / workspace flow for that plan (object or `null`).

---

## 6. Per–care-plan: list client reports in history

**`GET /care-plans/{care_plan}/report-runs`**

**Route name:** `v1.web.admin.care-plans.report-runs.index`

**Response `data`:**

```json
{
  "client_reports": []
}
```

Each element in **`client_reports`** is **`formatReportRunSummary`** — see **§4.5.3** (includes `generated_by`, no `metrics`). With at most one client report per care plan, the array has **0 or 1** item.

Use this for a side panel “client report for this care plan” on the workspace.

---

## 7. Report workspace (evidence + suggested metrics + current state)

**`GET /care-plans/{care_plan}/report-workspace`**

**Route name:** `v1.web.admin.care-plans.report-workspace`

**Query — exactly one of three modes (mutually exclusive):**

| Mode | Parameters |
|------|------------|
| New period (no saved context) | `period_starts_on`, `period_ends_on` (`Y-m-d`, inclusive range inside the care plan) |
| Resume by **client report** | `report_run_id` |
| Resume by **operational log** | `operational_log_id` |

**Successful `data`:** full merged object is specified in **§4.5.5**. In short:

- `care_plan` / `client` — from `CarePlanReportWorkspaceController` (enrollment + profile)
- `period` — effective `starts_on` / `ends_on` (date strings)
- `evidence` — per-day `items` with targets vs client logs
- `suggested_metrics` — server suggestion; same general shape as stored **metrics** (§4.5.1) for form binding
- `operational_log` — `null` or **`formatOperationalLog`** (§4.5.1) — **no** `feedback` here
- `client_report` / `report_run` — **same** object: **`formatReportRun`** (§4.5.2) or `null` (includes `feedback` and `metrics` when present; **no** `generated_by` in this shape)

**Rules:** care plan must be `active` or `completed`. There must be at least one `care_plan_day` in the period for the “new period” mode, or the API returns `422`.

---

## 8. Create / update operational log (metrics)

Draft creation is **separate** from “create with metrics” (mirrors `CarePlanController@store` for care plan drafts).

### 8.1 Create draft (default period = care plan)

**`POST /care-plans/{care_plan}/operational-logs/draft`**

**Route name:** `v1.web.admin.care-plans.operational-logs.draft`

**Body:** usually empty. The log’s period defaults to the care plan’s `starts_on` and `ends_on` (inclusive; at least one `care_plan_day` must exist in that range, or the API returns `422`). You may **optionally** send `period_starts_on` and `period_ends_on` together to use a sub-range that still lies inside the plan. **Only if this care plan has no operational log yet** — otherwise you get `422` (*An operational log already exists…*).

**Response:** `201` — message *Operational log draft created successfully.*; **`data`** is **`formatOperationalLog`** — **§4.5.1** (`status: "draft"`, `metrics: []` until edited).

**Recommended UX:** call this when the user enters the flow so a row appears in **`GET /operational-logs`**, then open **`GET …/report-workspace?operational_log_id=…`**.

### 8.2 Create with metrics (in progress in one request)

**`POST /care-plans/{care_plan}/operational-logs`**

**Route name:** `v1.web.admin.care-plans.operational-logs.store`

**Body:** **`metrics` (required, min. one item)** in the same shape as before, optional `adherence_percentage`. The period defaults to the care plan’s `starts_on` and `ends_on` if you **omit** `period_starts_on` / `period_ends_on`; you may **optionally** send those two together for a sub-range. **No** `feedback` key.  
Use this when you already have a full `metrics` payload (e.g. from `suggested_metrics` for the same date range the log will use). This endpoint does **not** create a draft; it creates **`in_progress`**. **Only if this care plan has no operational log yet** — same as draft, otherwise `422`.

**Response:** `201` — *Operational log created successfully.*; **`data`** = **`formatOperationalLog`** (§4.5.1), `status: "in_progress"`.

### 8.3 Update

**`PUT /care-plans/{care_plan}/operational-logs/{operational_log}`**

**Route name:** `v1.web.admin.care-plans.operational-logs.update`

**Body:** optional `metrics`, optional `adherence_percentage`. Fails with `422` if the operational log is `locked`.

**Response `data`:** **`formatOperationalLog`** (§4.5.1), `200` OK.

---

## 9. Create client report (submit for review)

**`POST /care-plans/{care_plan}/operational-logs/{operational_log}/submit-for-review`**

**Route name:** `v1.web.admin.care-plans.operational-logs.submit-for-review`  
**Body:** empty object is fine.

**Effect:** creates a `care_plan_report_runs` row in `in_review`, links it to the operational log, sets `submitted_for_review_at`. **Response:** `201` — **`data`** = **`formatReportRun`** (§4.5.2).

**Errors:** `422` if a client report already exists for that operational log, the operational log is **`draft`** (save metrics first), or it is `locked`.

---

## 10. Get / update client report (narrative)

### Show

**`GET /care-plans/{care_plan}/report-runs/{report_run}`**

**Route name:** `v1.web.admin.care-plans.report-runs.show`  
**`data`:** **`formatReportRun`** (§4.5.2) — `metrics` + `feedback` + timestamps; no `generated_by`.

### Update (feedback only)

**`PUT /care-plans/{care_plan}/report-runs/{report_run}`**

**Route name:** `v1.web.admin.care-plans.report-runs.update`  
**`data`:** **`formatReportRun`** (§4.5.2) after update.

**Body:**

```json
{
  "feedback": {
    "summary": "…",
    "focus_next_period": "…",
    "notes": "…"
  }
}
```

`feedback` is **required** as an object (fields inside may be null/omitted per validation). **Do not** send `metrics` here — use operational log `PUT`.

---

## 11. Publish

**`POST /care-plans/{care_plan}/report-runs/{report_run}/publish`**

**Route name:** `v1.web.admin.care-plans.report-runs.publish`  
**Body (optional):** `adherence_percentage` — override; otherwise recalculated from stored metrics.

**Rules:** client report must be `in_review`. Non-empty **`feedback.summary`** is required. On success, client report becomes `published`, operational log becomes `locked`, timestamps set. **`data`:** **`formatReportRun`** (§4.5.2).

---

## 12. Suggested metrics & evidence

The server builds `suggested_metrics` from care-plan days and client logs in the selected period (nutrition kcal rollups, activity/recovery by title, etc.). Details follow the heuristics in `CarePlanReportWorkspaceService` — the UI can bind the worksheet to `suggested_metrics` for a new period, or to `operational_log.metrics` when resuming.

---

## 13. Error summary

| HTTP | Typical cause |
|------|----------------|
| `401` | Missing/invalid token. |
| `403` | Not allowed to view care plans (lists) or the care plan (scoped routes). |
| `404` | Wrong `care_plan` / `report_run` / `operational_log` id. |
| `422` | Validation (workspace period, publish without summary, update locked op log, etc.). |

---

## 14. Quick reference — routes

| Use case | Method | Path (under `/api/v1/web/admin`) | Route name suffix |
|----------|--------|----------------------------------|-------------------|
| List operational logs | GET | `/operational-logs` | `operational-logs.index` |
| List client reports (global) | GET | `/period-reports` | `period-reports.index` |
| Care plan logging (index / show) | GET | `/care-plan-logs`, `/care-plan-logs/{carePlan}` | `care-plan-logs.index` · `care-plan-logs.show` |
| Workspace | GET | `/care-plans/{care_plan}/report-workspace` | `care-plans.report-workspace` |
| List client reports (plan) | GET | `/care-plans/{care_plan}/report-runs` | `care-plans.report-runs.index` |
| Create operational log draft | POST | `/care-plans/{care_plan}/operational-logs/draft` | `care-plans.operational-logs.draft` |
| Create operational log (with metrics) | POST | `/care-plans/{care_plan}/operational-logs` | `care-plans.operational-logs.store` |
| Update operational log | PUT | `/care-plans/{care_plan}/operational-logs/{operational_log}` | `care-plans.operational-logs.update` |
| Submit for review | POST | `/care-plans/{care_plan}/operational-logs/{operational_log}/submit-for-review` | `care-plans.operational-logs.submit-for-review` |
| Show client report | GET | `/care-plans/{care_plan}/report-runs/{report_run}` | `care-plans.report-runs.show` |
| Update feedback | PUT | `/care-plans/{care_plan}/report-runs/{report_run}` | `care-plans.report-runs.update` |
| Publish | POST | `/care-plans/{care_plan}/report-runs/{report_run}/publish` | `care-plans.report-runs.publish` |

Full Laravel names are prefixed with `v1.web.admin.`.

---

## 15. Backend references (for engineers)

- Service: `App\Services\Web\Admin\CarePlan\CarePlanReportWorkspaceService` (`formatOperationalLog`, `formatReportRun`, `formatReportRunSummary`, `buildWorkspace`, `createDraftOperationalLog`, `createOperationalLog`)
- Controllers: `DraftCarePlanOperationalLogController`, `StoreCarePlanOperationalLogController`, `CarePlanReportWorkspaceController`, `CarePlanLogController`, `ListCarePlanReportRunsController`
- Routes: `routes/api/v1/web/admin.php` (group `care-plans.`, `care-plan-logs`, `operational-logs`, `period-reports`)
- Resources: `CarePlanOperationalLogResource` (global op-log list), `ClientReportListResource` (global period-reports), `CarePlanLogResource` (care-plan logging)
- Migrations: `care_plan_operational_logs`, `care_plan_report_runs`, `care_plan_report_metrics`, `care_plan_report_feedback`, `care_plan_report_daily_points`

---

*Response shapes: prefer **§4.5** and the service methods named there. If a field is missing, confirm the deployed revision against those methods and the resource classes above.*
