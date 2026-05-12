# Admin period reports — overview list & detail API (frontend)

This document describes the **v1 web admin** endpoints for the **Period reports** screen: the paginated overview list and the **single-report detail** payload (including **metrics** and **daily_points**).

---

## Authentication

Same as other admin routes: **Sanctum** Bearer token. Only users who may **`viewAny`** care plans (typically **admin** / **super admin**) can access these endpoints; **support** receives **403**.

---

## 1. List — paginated overview

|                |                                     |
| -------------- | ----------------------------------- |
| **Method**     | `GET`                               |
| **Path**       | `/v1/web/admin/period-reports`      |
| **Route name** | `v1.web.admin.period-reports.index` |

### Query parameters (optional)

| Parameter      | Type    | Notes                                                                                                                                                                 |
| -------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `status`       | string  | One of: `in_review`, `published`, `archived`. If omitted, default list behavior on the model excludes **only** archived rows (see `CarePlanReportRun::applyFilters`). |
| `search`       | string  | Max 100 chars; matches report code, care plan code, client name/email/client_code.                                                                                    |
| `care_plan_id` | integer | Filter to reports for a single care plan (`exists:care_plans,id`).                                                                                                    |
| `per_page`     | integer | 1–100, default **15**.                                                                                                                                                |

### Success response

Standard **paginated** envelope: `status`, `message`, `data` (array of list rows), `meta` including **`pagination`** and **`version`**.

Each **`data[]`** item is a **`ClientReportListResource`** shape (summary only — **no** `metrics`):

- `id`, `code`, `status`, `is_editable` (true when `in_review`)
- `adherence_percentage`, `period` (`starts_on`, `ends_on`)
- `operational_log` (`id`, `code`) or `null`
- `care_plan` (`id`, `code`, `status`, `starts_on`, `ends_on`) or `null`
- `client` (`id`, `name`, `client_code`, `email`, `picture_url`) or `null`
- `generated_by` (`id`, `name`) or `null`
- `timestamps`: `submitted_for_review_at`, `published_at`, `locked_at`, `created_at`, `updated_at` (ISO 8601 where applicable)

Use the list row’s **`id`** as **`report_run`** for the show endpoint below.

---

## 2. Show — detail with metrics

|                    |                                                                                              |
| ------------------ | -------------------------------------------------------------------------------------------- |
| **Method**         | `GET`                                                                                        |
| **Path**           | `/v1/web/admin/period-reports/{report_run}`                                                  |
| **Route name**     | `v1.web.admin.period-reports.show`                                                           |
| **Path parameter** | `{report_run}` — numeric **`care_plan_report_runs.id`** (same as `data[].id` from the list). |

No query parameters.

### Success response (`200`)

Standard **success** envelope (not paginated): `status`, `message`, `data`, `meta.version`.

The **`data`** object includes:

- **Report core** (aligned with workspace `formatReportRun`):  
  `id`, `code`, `status`, `operational_log_id`, `adherence_percentage`, `period` (`starts_on`, `ends_on`), `metrics`, `highlights`, `feedback`, `timestamps` (`submitted_for_review_at`, `published_at`, `locked_at`, plus **`created_at`**, **`updated_at`** on show).
- **Overview context** (aligned with list row):  
  `is_editable`, `operational_log` (`id`, `code`), `care_plan`, `client`, `generated_by` — same nested shapes as the list resource where applicable.

### `data.metrics[]` (operational / period metrics)

Each metric is ordered by **`display_order`**. Fields:

| Field            | Type           | Notes                                                                |
| ---------------- | -------------- | -------------------------------------------------------------------- |
| `id`             | number         | Metric row id                                                        |
| `section`        | string         | e.g. `nutrition`, `movement`, `activity`, `recovery`                 |
| `metric_key`     | string         | Stable key (e.g. `estimated_energy_burn`, `activity_walking`)        |
| `label`          | string         | Display label                                                        |
| `target_value`   | number \| null | Normalized (int when whole)                                          |
| `actual_value`   | number \| null | Normalized                                                           |
| `unit`           | string \| null | Display unit name stored on the metric (e.g. `Kilocalorie`, `Steps`) |
| `days_on_target` | number \| null |                                                                      |
| `days_total`     | number \| null |                                                                      |
| `display_order`  | number         |                                                                      |
| `meta`           | object \| null | e.g. `synthesis` notes from authoring                                |
| `daily_points`   | array          | Sorted by **`day_number`**                                           |

### `data.metrics[].daily_points[]`

| Field          | Type           | Notes                                      |
| -------------- | -------------- | ------------------------------------------ |
| `id`           | number         |                                            |
| `day_number`   | number         | 1-based day index within the metric series |
| `target_value` | number \| null |                                            |
| `actual_value` | number \| null |                                            |
| `on_target`    | boolean        |                                            |
| `meta`         | object \| null | e.g. `reason` when not on target           |

### `data.highlights[]`

Curated cards for the client report (metric key, label, value, unit, visibility, order, etc.). See backend `CarePlanReportWorkspaceService::formatHighlight`.

### `data.feedback`

Object or `null`: `summary`, `focus_next_period`, `notes`.

### Errors

| HTTP    | When                              |
| ------- | --------------------------------- |
| **403** | User cannot `viewAny` care plans. |
| **404** | No report row for the given id.   |

---

## Related endpoints

- **Edit / publish** flows remain under **`/v1/web/admin/care-plans/{care_plan}/…`** (report workspace, operational log, report run update, publish). The period-report **show** is read-only overview/detail for any status (`in_review`, `published`, `archived`) that appears in the list.

---

## Frontend checklist

- [ ] List screen: `GET …/period-reports` with filters + pagination.
- [ ] Detail / overview: `GET …/period-reports/{id}` for full **`metrics`** + **`daily_points`**.
- [ ] Do not expect **`metrics`** on the **index** response; use **show** for charts/tables.
