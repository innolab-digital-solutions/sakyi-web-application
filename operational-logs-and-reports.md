# Operational logs & client period reports (admin API)

This document is the **single reference** for admin frontends building **operational logging** (internal rollups from client raw logs) and **client-facing period reports** (review, publish, archive). It replaces the former `admin-operational-logs-and-period-reports-table-listing.md` and `operational-logs-handling-and-report-generating.md`.

**Base URL:** `https://{host}/api/v1/web/admin`

**Auth:** `Authorization: Bearer {sanctum_token}` (admin). List routes use `Gate::viewAny(CarePlan::class)`; care-plan-scoped routes use `Gate::view` on the route `care_plan`.

**Version:** Responses include `meta.version` (e.g. `v1`) on success payloads.

---

## 1. Two concepts (do not merge in the UI)

| Concept | Table / model | Purpose |
|--------|-----------------|--------|
| **Operational log** | `care_plan_operational_logs` | **Internal only:** period, adherence, metrics, daily points derived from plan + client logs. Status: `in_progress` or `locked`. |
| **Client report** | `care_plan_report_runs` | **Client-facing lifecycle:** care-team feedback (summary, focus, notes), review, publish. Linked **one-to-one** to an operational log after “submit for review”. Status: `in_review`, `published`, `archived`. |

**Metrics** always live on the **operational log**. The client report row **does not** duplicate period/adherence/metrics; it references the same metrics via the linked operational log.

**Feedback** (`care_plan_report_feedback`) belongs **only** to the client report row, not to the operational log.

---

## 2. What to remove or change from the old frontend flow

The previous design treated **one** `care_plan_report_runs` row as both “draft metrics container” and “report”, with statuses `draft` / `generated` / `published` and a **Generate** step. That is **gone**. Migrate as follows:

| Old behavior | Action |
|----------------|--------|
| Single entity for both “work in progress” and “report” | **Split:** use **operational log** for metrics editing; **client report** for narrative + publish. |
| Statuses `draft`, `generated`, `published` on one row | **Drop.** Client report uses `in_review`, `published`, `archived`. Operational log uses `in_progress`, `locked`. |
| `GET /operational-logs` with `include_published` | **Remove** this query param — it never applied to the new model and is not supported. |
| `POST .../report-runs/{id}/generate` | **Remove** — replaced by `POST .../operational-logs/{id}/submit-for-review`, which creates the client report in `in_review`. |
| `POST /report-runs` creating a “draft report” with metrics + feedback | **Stop** sending feedback here. Prefer `POST .../operational-logs` for metrics; **legacy:** `POST .../report-runs` still creates an **operational log** only (same handler), not a client report. |
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
| `in_progress` | Internal figures can still be edited (unless a submit/publish rule blocks it). |
| `locked` | Internal figures frozen (e.g. after client report is published). |

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

### 4.2 Paginated lists (`GET operational-logs`, `GET period-reports`)

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

Use `page` and `per_page` query parameters for pagination.

---

## 5. Global admin lists (sidebar / dashboards)

### 5.1 Operational logs (internal) — `GET /operational-logs`

**Route name:** `v1.web.admin.operational-logs.index`

**Purpose:** Rows are **operational logs** (not client reports). Use for “internal authoring / rollups per period”.

**Query parameters:**

| Param | Type | Description |
|--------|------|-------------|
| `status` | string | Optional. `in_progress` or `locked`. If omitted, **all** operational logs are returned (both statuses). |
| `search` | string | Optional. Matches operational log `code`, care plan `code`, client name/email/client_code. |
| `care_plan_id` | integer | Optional. Filter to one care plan. |
| `per_page` | integer | Optional, 1–100, default 15. |
| `page` | integer | Optional. |

**Each row** (`CarePlanOperationalLogResource`):

```json
{
  "id": 1,
  "code": "SKOL-2026-…",
  "status": "in_progress",
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

- `is_editable` is `true` only when `status === "in_progress"`.
- `client_report` is `null` until a client report row exists (after **submit for review**).

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

## 6. Per–care-plan: list client reports in history

**`GET /care-plans/{care_plan}/report-runs`**

**Route name:** `v1.web.admin.care-plans.report-runs.index`

**Response `data`:**

```json
{
  "client_reports": [
    {
      "id": 9,
      "code": "…",
      "status": "in_review",
      "adherence_percentage": 72,
      "period": { "starts_on": "…", "ends_on": "…" },
      "timestamps": {
        "submitted_for_review_at": "…",
        "published_at": null,
        "locked_at": null
      },
      "generated_by": { "id": 5, "name": "…" }
    }
  ]
}
```

Use this for a side panel “previous reports for this care plan” on the workspace.

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

**Successful `data` includes (among other fields):**

- `care_plan` / `client` — context (as implemented by the controller)
- `period` — effective `starts_on` / `ends_on`
- `evidence` — read-only per-day target vs log for the range
- `suggested_metrics` — server suggestion for the worksheet
- `operational_log` — `null` or internal snapshot (`formatOperationalLog`: metrics, adherence, `client_report_id`, **no** feedback)
- `client_report` — `null` or client report snapshot (`formatReportRun`: status, `feedback`, `metrics` via linked op, `timestamps.submitted_for_review_at`, etc.)
- `report_run` — **alias** of `client_report` (same object), for older clients

**Rules:** care plan must be `active` or `completed`. There must be at least one `care_plan_day` in the period for the “new period” mode, or the API returns `422`.

---

## 8. Create / update operational log (metrics)

### Create

**`POST /care-plans/{care_plan}/operational-logs`**

**Route name:** `v1.web.admin.care-plans.operational-logs.store`

**Body:** `period_starts_on`, `period_ends_on`, `metrics` (required structure as before), optional `adherence_percentage`. **No** `feedback` key.

**Response:** `201` — `data` is the **operational log** shape (`formatOperationalLog`).

### Legacy (same handler)

**`POST /care-plans/{care_plan}/report-runs`**

**Route name:** `v1.web.admin.care-plans.report-runs.store`  
Same request body and response as `POST …/operational-logs` — prefer the operational-logs path for new UIs.

### Update

**`PUT /care-plans/{care_plan}/operational-logs/{operational_log}`**

**Route name:** `v1.web.admin.care-plans.operational-logs.update`

**Body:** optional `metrics`, optional `adherence_percentage`. Fails with `422` if the operational log is `locked`.

---

## 9. Create client report (submit for review)

**`POST /care-plans/{care_plan}/operational-logs/{operational_log}/submit-for-review`**

**Route name:** `v1.web.admin.care-plans.operational-logs.submit-for-review`  
**Body:** empty object is fine.

**Effect:** creates a `care_plan_report_runs` row in `in_review`, links it to the operational log, sets `submitted_for_review_at`. **Response:** `201` — `data` is the **client report** shape (`formatReportRun`).

**Errors:** `422` if a client report already exists for that operational log, or the operational log is `locked`.

---

## 10. Get / update client report (narrative)

### Show

**`GET /care-plans/{care_plan}/report-runs/{report_run}`**

**Route name:** `v1.web.admin.care-plans.report-runs.show`  
Returns full `formatReportRun` (metrics, feedback, etc.).

### Update (feedback only)

**`PUT /care-plans/{care_plan}/report-runs/{report_run}`**

**Route name:** `v1.web.admin.care-plans.report-runs.update`  
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

**Rules:** client report must be `in_review`. Non-empty **`feedback.summary`** is required. On success, client report becomes `published`, operational log becomes `locked`, timestamps set.

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
| Workspace | GET | `/care-plans/{care_plan}/report-workspace` | `care-plans.report-workspace` |
| List client reports (plan) | GET | `/care-plans/{care_plan}/report-runs` | `care-plans.report-runs.index` |
| Create operational log | POST | `/care-plans/{care_plan}/operational-logs` | `care-plans.operational-logs.store` |
| Update operational log | PUT | `/care-plans/{care_plan}/operational-logs/{operational_log}` | `care-plans.operational-logs.update` |
| Submit for review | POST | `/care-plans/{care_plan}/operational-logs/{operational_log}/submit-for-review` | `care-plans.operational-logs.submit-for-review` |
| Create op (legacy path) | POST | `/care-plans/{care_plan}/report-runs` | `care-plans.report-runs.store` |
| Show client report | GET | `/care-plans/{care_plan}/report-runs/{report_run}` | `care-plans.report-runs.show` |
| Update feedback | PUT | `/care-plans/{care_plan}/report-runs/{report_run}` | `care-plans.report-runs.update` |
| Publish | POST | `/care-plans/{care_plan}/report-runs/{report_run}/publish` | `care-plans.report-runs.publish` |

Full Laravel names are prefixed with `v1.web.admin.`.

---

## 15. Backend references (for engineers)

- Service: `App\Services\Web\Admin\CarePlan\CarePlanReportWorkspaceService`
- Routes: `routes/api/v1/web/admin.php` (group `care-plans.`)
- Resources: `CarePlanOperationalLogResource`, `ClientReportListResource`
- Migrations: `care_plan_operational_logs`, `care_plan_report_runs`, `care_plan_report_metrics`, `care_plan_report_feedback`, `care_plan_report_daily_points`

---

*Last aligned with the backend implementation in-repo; if a field is missing, confirm the deployed revision and the resource classes above.*
