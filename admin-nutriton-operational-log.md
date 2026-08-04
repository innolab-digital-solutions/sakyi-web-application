# Admin Report Workspace — Per-Task Nutrition Actual Calories

Guide for the admin dashboard (Next.js): admins can enter **actual calories on each nutrition task** (meal). Those values **auto-sum into All Nutrition Meals** for that day.

Base API prefix: `/v1/web/admin`. Requires admin bearer token (same as the rest of the admin SPA).

---

## What changed

| Area                                     | Change                                                                     |
| ---------------------------------------- | -------------------------------------------------------------------------- |
| New API                                  | Upsert actual calories on a single nutrition task                          |
| Evidence nutrition items                 | Still use `log.actual_value` — after this API, that field updates          |
| All Nutrition Meals (`meals_total_kcal`) | Day actual is **recalculated from task sums** when you use the new API     |
| Existing operational-log PUT             | Still works for full metric saves / other sections                         |
| Nutrition task completion                | **Unchanged** — still image-based; calories alone do not complete the task |
| Mobile client                            | **No change**                                                              |

### Mental model

```text
Breakfast actual  ──┐
Lunch actual      ──┼──► Day total ──► All Nutrition Meals (meals_total_kcal)
Dinner actual     ──┘
```

Previously admins mainly edited the **day total** on All Nutrition Meals.  
Now they can also edit **each meal**, and the day total updates automatically.

---

## Endpoints at a glance

| Method | Path                                                                                     | Purpose                                        |
| ------ | ---------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `GET`  | `/v1/web/admin/care-plans/{care_plan}/report-workspace`                                  | Load evidence + metrics (unchanged contract)   |
| `PUT`  | `/v1/web/admin/care-plans/{care_plan}/days/{day}/nutritions/{nutrition}/actual-calories` | **New** — set/clear one meal’s actual calories |
| `PUT`  | `/v1/web/admin/care-plans/{care_plan}/operational-logs/{operational_log}`                | Existing — full metrics save (still available) |

---

## New API — set actual calories per nutrition task

```http
PUT /v1/web/admin/care-plans/{care_plan}/days/{day}/nutritions/{nutrition}/actual-calories
Content-Type: application/json
Authorization: Bearer {token}
```

### Path params

| Param       | Type | Source                                                                               |
| ----------- | ---- | ------------------------------------------------------------------------------------ |
| `care_plan` | int  | Care plan id                                                                         |
| `day`       | int  | **Care plan day primary key** (`care_plan_days.id`) — not `day_number` / `day_index` |
| `nutrition` | int  | Nutrition task id = evidence item `item_id` when `section === "nutrition"`           |

### How to resolve `day` and `nutrition` from report workspace

From `GET …/report-workspace`:

```json
{
  "evidence": [
    {
      "day_index": 1,
      "day_number": 1,
      "target_date": "2026-11-01",
      "items": [
        {
          "section": "nutrition",
          "morph": "nutrition",
          "item_id": 65,
          "title": "Breakfast",
          "target": { "value": 400, "unit": "kcal", "unit_id": 10 },
          "log": {
            "id": 12,
            "actual_value": null,
            "unit": null,
            "is_completed": false,
            "notes": null,
            "meta": null,
            "media": []
          }
        }
      ]
    }
  ]
}
```

| Need        | Use                                                                                                                                                                                                                                 |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `nutrition` | `evidence[].items[].item_id` (nutrition rows only)                                                                                                                                                                                  |
| `day`       | Care plan day **id**. Evidence currently exposes `day_number` + `target_date`, not `id`. Resolve by matching `target_date` (preferred) or `day_number` to builder `days[].id`, or any cached day map you already keep for the plan. |

Only show the calorie input for items where:

- `section === "nutrition"`
- preferably `target.unit === "kcal"` (non-kcal nutrition rows do **not** contribute to All Nutrition Meals)

### Request body

```json
{ "actual_value": 450 }
```

| Field          | Rules                                                                                         |
| -------------- | --------------------------------------------------------------------------------------------- |
| `actual_value` | **Required key** (`present`). `null` clears the value. Must be `numeric` and `>= 0` when set. |

Clear example:

```json
{ "actual_value": null }
```

### Success response (`200`)

```json
{
  "message": "Nutrition actual calories updated successfully.",
  "data": {
    "log": {
      "id": 12,
      "actual_value": 450,
      "unit": "kcal",
      "is_completed": false,
      "meta": { "actual_source": "admin" }
    },
    "day_rollup": {
      "day_number": 1,
      "target_value": 1000,
      "actual_value": 450,
      "on_target": false
    },
    "meals_total_kcal": {
      "metric_key": "meals_total_kcal",
      "label": "All Nutrition Meals",
      "target_value": 1000,
      "actual_value": 450,
      "days_on_target": 0,
      "days_total": 1,
      "daily_point": {
        "day_number": 1,
        "target_value": 1000,
        "actual_value": 450,
        "on_target": false
      }
    }
  }
}
```

| Field                                          | Meaning                                                                                                                                |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `data.log`                                     | Updated task log — patch into evidence item `log`                                                                                      |
| `data.log.meta.actual_source`                  | `"admin"` when set via this API                                                                                                        |
| `data.log.is_completed`                        | Still driven by meal **images**, not calories                                                                                          |
| `data.day_rollup`                              | Sum of kcal nutrition tasks on that care-plan day                                                                                      |
| `data.day_rollup.day_number`                   | Care plan `day_number` (plan day label)                                                                                                |
| `data.meals_total_kcal`                        | Refreshed All Nutrition Meals summary, or `null` (see below)                                                                           |
| `data.meals_total_kcal.daily_point.day_number` | **Period index** (1-based within the operational log period) — same numbering as `operational_log.metrics[].daily_points[].day_number` |

### When `meals_total_kcal` is `null`

Returned `null` when:

- No operational log exists yet, **or**
- Operational log exists but metrics are still empty (draft never saved with metrics)

In those cases the task log is still saved. On the next workspace load, suggested metrics / merge will pick up the logged actuals.

When the op log already has metrics, this API **writes the day point** on `meals_total_kcal` so the UI does not need a full reload.

---

## Recommended UI flow

1. Open report workspace as today.
2. In **evidence**, for each nutrition (kcal) task, show an editable **Actual (kcal)** field bound to `log.actual_value`.
3. On blur / save:
   - `PUT …/days/{dayId}/nutritions/{item_id}/actual-calories` with `{ actual_value }`
4. Optimistically / from response:
   - Update that item’s `log` from `data.log`
   - Update All Nutrition Meals day point from `data.meals_total_kcal.daily_point` (match by `daily_point.day_number` === evidence `day_index`)
   - Update metric totals from `data.meals_total_kcal.actual_value` / `days_on_target`
5. Optional: still allow editing All Nutrition Meals via the existing operational-log PUT.  
   **If the admin later edits a task via this new API, that day’s total is overwritten by the task sum.**

### Disable editing when locked

If `operational_log.status === "locked"`, disable calorie inputs. The API returns `422` with `status`.

---

## Errors

| Status | When                                                                                                        |
| ------ | ----------------------------------------------------------------------------------------------------------- |
| `401`  | Guest / missing auth                                                                                        |
| `403`  | Non-admin / cannot view care plan                                                                           |
| `404`  | Day not on care plan, or nutrition not on that day                                                          |
| `422`  | Validation (`actual_value` negative / missing key), care plan not reportable, **or operational log locked** |

Locked example:

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "status": ["This operational log is locked and can no longer be edited."]
  }
}
```

---

## Interaction with existing metrics PUT

Existing:

```http
PUT /v1/web/admin/care-plans/{care_plan}/operational-logs/{operational_log}
```

Still used to save the full metrics worksheet (All Nutrition Meals, activity, hydration, etc.).

| Action                                             | Effect on day’s All Nutrition Meals actual                                 |
| -------------------------------------------------- | -------------------------------------------------------------------------- |
| Edit All Nutrition Meals day point via metrics PUT | Manual override saved                                                      |
| Then edit a meal via new actual-calories API       | **Recalculates that day from task sums** (overwrites the manual day value) |
| Edit meals only via new API                        | Day total always = sum of kcal task actuals                                |

Frontend tip: after per-task saves, prefer trusting `data.meals_total_kcal` from the new API (or refetch workspace) rather than keeping a stale manual day total in local state.

---

## What does **not** change

- Mobile daily log API
- Nutrition completion rules (images)
- Activity / hydration / sleep / recovery metric APIs
- Period report PDF builder
- Care plan builder payload

---

## UI checklist (admin)

- [ ] On report workspace evidence, add Actual kcal input for nutrition items (kcal preferred)
- [ ] Call new PUT with care plan id + **day id** + `item_id`
- [ ] Patch evidence `log` from `data.log` without full page reload
- [ ] Patch All Nutrition Meals day point / totals from `data.meals_total_kcal` when not `null`
- [ ] Allow clearing with `{ "actual_value": null }`
- [ ] Disable inputs when operational log is `locked`
- [ ] Do not treat calorie entry as task completion
- [ ] Remember: `day_rollup.day_number` ≠ always equal to metrics `daily_points.day_number` (plan day vs period index) — for metrics UI use `meals_total_kcal.daily_point.day_number` / evidence `day_index`
