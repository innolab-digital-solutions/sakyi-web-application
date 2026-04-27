# Operational log & report workspace — frontend guide

This document describes **recommended UI/data flow** for the care plan **report workspace** and **operational log** APIs, and how the backend behaves so the frontend can bind the correct fields, persist edits, and handle edge cases.

**Global API path:** All routes below live under the versioned admin API, e.g. `{BASE}/v1/web/admin/...` where `{BASE}` is your deployment’s root for the v1 API (commonly with an `/api` prefix — confirm in your `APP_URL` / gateway).

**Auth:** `Authorization: Bearer {token}` (Laravel Sanctum). Every endpoint in this group uses `auth:sanctum`.

**Success JSON envelope (typical):**

```json
{
  "status": "success",
  "message": "…",
  "data": {},
  "meta": {
    "version": 1
  }
}
```

Errors use the same handler pattern (`status: "error"`, `message`, optional `errors` keyed by field).

---

## 1. Core idea: two different data sources in one response

`GET` **report-workspace** returns **both** of the following. They are **not** the same and must not be conflated in the UI.

| Field                                            | Source                                                                                                                                    | Updated when?                                                            | Editable in UI?                                                                                                                                                                                  |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **`suggested_metrics`**                          | **Computed on every request** from care plan days (nutritions, movements, activities, recoveries) + **client** `care_plan_day_item_logs`. | New logs or care plan data → new numbers.                                | **Treat as read-only** (a “suggested roll-up / seed”). Editing this in the browser **does not persist** unless you **save to the operational log** (see below).                                  |
| **`operational_log.metrics` (+ `daily_points`)** | **Stored in the database** for this care plan’s single operational log.                                                                   | Only when the admin **PUTs** the operational log with a `metrics` array. | **This is the persisted “working copy”** for the report period. Admin edits to targets/actuals for reporting belong **here** — they **do not** change user logs or the care plan builder tables. |
| **`evidence`**                                   | Raw, day-by-day items + attached logs.                                                                                                    | When clients log.                                                        | **Read-only** for the operational narrative (ground truth of what was logged).                                                                                                                   |

**Recommendation for the product:**

1. **Primary editor state** = `data.operational_log` (after it exists).
2. **Optional comparison / “Apply suggestion”** = copy from `data.suggested_metrics` into the form **once** (e.g. first open or explicit button), then **PUT** the full `metrics` payload to persist.
3. **Summary and daily rows** in an editable metric card (target / actual / on target) should **read and write** `operational_log.metrics[…]` and `daily_points`, not `suggested_metrics`. If the UI still shows `suggested_metrics` in the header and `operational_log` in the table (or local-only state), you will see mismatches (e.g. “TARGET: Not set, ACTUAL: 0” vs filled rows).

**Important:** A **PUT** that includes `metrics` **replaces all metrics** for that operational log (delete + recreate). The client must **send the complete list** of metrics you want to keep, not a patch.

---

## 2. Recommended user flow (high level)

1. Admin opens report workspace: **`GET` report-workspace** (requires an operational log — see preconditions).
2. If `operational_log.metrics` is **empty** and you want a starting point, **map `suggested_metrics` into the form** and let the user adjust, then **save**.
3. **Save** = **`PUT` …/operational-logs/{id}** with `adherence_percentage` (optional) and `metrics` (array with `daily_points` per metric).
4. When ready, **`POST` submit-for-review** (operational log must not be `draft` — see edge cases).
5. Later, narrative / feedback use **report run** endpoints (see report run section).

```text
[ suggested_metrics ] ----seed/copy----> [ form / local state ]
       |                                        |
       | (read-only, recomputed)                 | PUT metrics
       v                                        v
[ evidence / logs ]                    [ DB: operational_log.metrics + daily_points ]
```

---

## 3. API reference

Laravel **named route** keys are `v1.web.admin.care-plans.*` (use `route()` in the app, or your OpenAPI file if generated).

| Step                                 | Method | Path                                                                          | Route name (Laravel)                                         |
| ------------------------------------ | ------ | ----------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Create draft op log (empty metrics)  | `POST` | `care-plans/{care_plan}/operational-logs/draft`                               | `v1.web.admin.care-plans.operational-logs.draft`             |
| Create op log with at least 1 metric | `POST` | `care-plans/{care_plan}/operational-logs`                                     | `v1.web.admin.care-plans.operational-logs.store`             |
| Update op log (save metrics)         | `PUT`  | `care-plans/{care_plan}/operational-logs/{operational_log}`                   | `v1.web.admin.care-plans.operational-logs.update`            |
| Load workspace                       | `GET`  | `care-plans/{care_plan}/report-workspace`                                     | `v1.web.admin.care-plans.report-workspace`                   |
| Submit client report for review      | `POST` | `care-plans/{care_plan}/operational-logs/{operational_log}/submit-for-review` | `v1.web.admin.care-plans.operational-logs.submit-for-review` |

> Per-path parameter names: `care_plan` and `operational_log` (IDs).

---

## 3.1 `POST` operational-logs/draft

**Body (all optional):**

- `period_starts_on` / `period_ends_on` (date, inclusive) — if used, both required; `period_ends_on` must be on or after `period_starts_on`. If omitted, defaults to the care plan’s `starts_on` / `ends_on`.

**Result:** `201` — `data` = formatted operational log with **`metrics: []`**.

**Error cases:** 422 if a care plan **already has** an operational log, or business rules fail (e.g. period not inside plan) — use API error `errors` object.

---

## 3.2 `POST` operational-logs (not draft)

**Body:** same metric shape as **`PUT`** (see 3.4), plus optional period fields. **`metrics` is required** with **at least one** metric. Each metric’s `daily_points` may be an empty array (`present` rules).

**Result:** `201` — `data` = operational log including metrics + daily points.

---

## 3.3 `GET` report-workspace

**Query params:** **None** (workspace is defined entirely by the care plan’s **single** operational log’s period).

**Result:** `200` — `data` shape (conceptual; exact keys on nested objects are listed below).

```json
{
  "care_plan": { "id", "code", "status", "starts_on", "ends_on" },
  "client": { "id", "name", "client_code", "email", "picture_url" },
  "period": { "starts_on", "ends_on" },
  "evidence": { },
  "suggested_metrics": [ ],
  "operational_log": { },
  "client_report": null,
  "report_run": null
}
```

- **`client_report` / `report_run`:** the same run object or `null` if no report run yet.

**Typical failure:** `422` with message about creating an operational log first, missing days in the period, invalid period, etc. — not `404` for “no log” in some cases; read `message` / `errors`.

---

## 3.4 `PUT` operational-logs/{operational_log}

**Body (partial allowed at top level, but `metrics` is all-or-nothing when present):**

- `adherence_percentage` (optional, 0–100). If omitted, server can **recompute** from the saved metrics.
- `metrics` (optional) — if present, **replaces** all stored metrics. Each element:

| Key                            | Rule                                                                                                      |
| ------------------------------ | --------------------------------------------------------------------------------------------------------- |
| `section`                      | required; enum: `nutrition`, `movement`, `activity`, `recovery`                                           |
| `metric_key`                   | required string (≤100), e.g. `estimated_energy_burn`, or `activity:walking` style keys for titled rollups |
| `label`                        | required string (≤150)                                                                                    |
| `target_value`, `actual_value` | nullable numbers (period-level summary)                                                                   |
| `unit`                         | nullable string (≤30) — display label                                                                     |
| `days_on_target`, `days_total` | nullable 0–255                                                                                            |
| `display_order`                | optional int                                                                                              |
| `meta`                         | optional object                                                                                           |
| `daily_points`                 | **required** array (may be empty)                                                                         |

**Each `daily_points[]` item:**

| Key                            | Rule                                                                                                                    |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `day_number`                   | required, 1..120 (1 = first day of the operational period)                                                              |
| `target_value`, `actual_value` | nullable numbers                                                                                                        |
| `on_target`                    | **required** boolean                                                                                                    |
| `meta`                         | optional object (e.g. `reason: "no_movement_burn_log"` in suggested metrics — you may copy or simplify for stored rows) |

**Result:** `200` — `data` = `formatOperationalLog` only (not the full workspace). The frontend should **merge** into local state or **re-fetch** `GET` report-workspace to refresh `suggested_metrics` + `evidence`.

**Error:** 422 if locked, or validation failed.

---

## 3.5 `POST` …/submit-for-review

**Body:** usually empty.

**Result:** `201` — `data` = **client report run** (`formatReportRun`), including the operational log + metrics for that run’s snapshot context.

**Typical 422 messages:**

- A client report run **already exists** for this operational log.
- Operational log is still **`draft`** — _“Save operational metrics first…”_ (must have saved at least one non-empty metrics payload so status moves off draft — see service behavior).
- Operational log is **`locked`**.

---

## 4. Response shapes the frontend should use

### 4.1 `suggested_metrics[]` (computed)

Each item is a **suggested** metric row (order may be re-indexed on the server). Typical fields:

- `metric_key`, `section`, `label`, `unit`, `target_value`, `actual_value`, `days_on_target`, `days_total`, `display_order`, `meta`
- `daily_points[]` with: `day_number`, `target_value`, `actual_value`, `on_target`, `meta` (may include `reason` when a day has no data)

**Synthesis content depends on type:**

- Nutrition kcal, movement burn (`estimated_energy_burn` when movement rows exist), per-title activity and recovery — see `CarePlanReportWorkspaceService::synthesizeMetrics()`.
- **Movement without plan DB columns** for targets: `target_value` at metric level is often `null`; burn comes from **movement logs** with `actual_value`. If no burn logs, **actual** may still be `0` with explanatory `meta` when movement is **planned** for the period.

These rows **are not** where admin edits are stored. **Do not** expect them to change after a successful **PUT** unless the underlying care plan or **client logs** change.

### 4.2 `operational_log` (stored)

```json
{
  "id": 0,
  "code": "…",
  "status": "draft" | "in_progress" | "locked",
  "adherence_percentage": 0,
  "period": { "starts_on", "ends_on" },
  "client_report_id": null,
  "timestamps": { "locked_at": null },
  "metrics": [
    {
      "id": 0,
      "section": "movement",
      "metric_key": "estimated_energy_burn",
      "label": "Estimated energy burn",
      "target_value": null,
      "actual_value": 0,
      "unit": "Kilocalorie",
      "days_on_target": 0,
      "days_total": 7,
      "display_order": 0,
      "meta": null,
      "daily_points": [
        {
          "id": 0,
          "day_number": 1,
          "target_value": 450,
          "actual_value": 100,
          "on_target": true,
          "meta": null
        }
      ]
    }
  ]
}
```

Use **`id`** on metrics and `daily_points` to key React lists; after a full replace, **IDs change**.

### 4.3 `evidence` (read-only)

Structured by period days and item sections, with per-item `target` (when defined on the plan) and `log` (if the client logged that day). Use for drill-down, not for the same numeric grid as the operational metric table unless you intentionally compare “plan + logs” vs “admin narrative”.

---

## 5. Edge cases & how to handle them in the UI

| Situation                                 | Behavior / frontend handling                                                                                                                                                                                                       |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **No operational log yet**                | `GET` report-workspace **422**. Show CTA: call **`POST` draft** (or `POST` store with metrics), then reload workspace.                                                                                                             |
| **One care plan = one operational log**   | `POST` draft / store when a log **already exists** → 422. Don’t show “Create” twice.                                                                                                                                               |
| **Draft vs in_progress**                  | First **`PUT` with non-empty `metrics`** moves status from `draft` → **`in_progress`** (when the saved metrics set is not empty).                                                                                                  |
| **Submit for review from draft**          | 422. Disable “Submit” until at least one successful **save of metrics** that transitions off `draft` (or show server message).                                                                                                     |
| **Full replace on PUT**                   | If the user only edits one card but you **omit** other metrics, those rows are **deleted**. Always **PUT the full** `metrics` array you need.                                                                                      |
| **Daily point count**                     | `day_number` is **1-based** in the **operational period** (not calendar day-of-month). The count should match `period` length; align with `suggested_metrics[0].daily_points` length or `data.period` day span when building rows. |
| **Header vs table mismatch**              | If header binds to **`suggested_metrics`** and table to **local state**, they will diverge. **Bind the editor to `operational_log`**, optionally show “suggested” as a secondary column or tooltip.                                |
| **Admin edits do not change client logs** | Expected. `PUT` metrics does **not** update `care_plan_day_item_logs`. `suggested_metrics` + `evidence` still reflect logs and plan.                                                                                               |
| **Lock after publish**                    | `operational_log.status` becomes **`locked`**. `PUT` returns 422. Make fields read-only.                                                                                                                                           |
| **Adherence**                             | Can be user-supplied on PUT or **recomputed** server-side from metrics when not sent — understand your product rule and display the same number the server returns after save.                                                     |
| **Empty `metrics` on update**             | Sending `metrics: []` **removes** all metrics; status may not revert to `draft`. Avoid sending an empty `metrics` unless you really mean to clear.                                                                                 |

---

## 6. Checklist for frontend developers

1. **Distinguish** `suggested_metrics` (recomputed) vs `operational_log.metrics` (saved).
2. On save, call **`PUT` operational-logs** with the **entire** `metrics` array and valid **`daily_points` per metric** (`on_target` required on each day row).
3. After save, **re-fetch** workspace or at least **replace** operational log from the PUT response; **do not** expect `suggested_metrics` to mirror saved edits.
4. Build the daily table from **operational** `daily_points` + `period` length, not from calendar dates unless you map them explicitly.
5. Show **evidence** or a link to “source logs” when explaining differences between suggested and admin numbers.

For backend implementation details, see `App\Services\Web\Admin\CarePlan\CarePlanReportWorkspaceService` and the Form Requests for validation rules: `UpdateCarePlanOperationalLogRequest`, `StoreCarePlanOperationalLogRequest`, `StoreCarePlanOperationalLogDraftRequest`.
