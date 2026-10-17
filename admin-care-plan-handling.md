# Admin care plan — Walking section & average steps

Frontend guide for the new **walking** care-plan section (same shape as hydration / sleep) and auto-calculated **average steps** in period reports.

## What changed

| Area                | Change                                                                                                 |
| ------------------- | ------------------------------------------------------------------------------------------------------ |
| Section enum        | New value: `walking` (alongside `nutrition`, `movement`, `activity`, `hydration`, `sleep`, `recovery`) |
| Day builder payload | `days[].sections.walking` array on builder / upsert responses                                          |
| Upsert route        | `PUT …/days/{day}/sections/walking/items`                                                              |
| Report workspace    | Suggested metric `walking_steps_total` + default `avg_steps` = period walking actual ÷ `days_total`    |
| Log entries list    | Walking logs appear with `section: "walking"`                                                          |

No existing sections were renamed or removed. Walking is additive.

---

## 1. Builder: read walking items

**GET** `/api/v1/web/admin/care-plans/{care_plan}/builder`

Each day now includes:

```json
{
    "days": [
        {
            "id": 12,
            "target_date": "2026-05-01",
            "sections": {
                "nutrition": [],
                "movement": [],
                "activity": [],
                "hydration": [],
                "sleep": [],
                "recovery": [],
                "walking": [
                    {
                        "id": 3,
                        "title": "Daily steps",
                        "guidance": "Aim for consistent walking",
                        "target_value": 8000,
                        "target_unit_id": 42,
                        "meta": null
                    }
                ]
            }
        }
    ]
}
```

**UI notes**

- Treat `walking` like hydration/sleep: title + optional guidance + optional `target_value` + optional `target_unit_id`.
- Prefer unit type `count` with abbreviation `steps` (seeded as “Steps”).
- Empty array `[]` means no walking tasks for that day (valid).

The same `sections.walking` shape is returned after day notes / motivation / generate-days / enter-edit-mode / exit-edit-mode / section upsert.

---

## 2. Builder: upsert walking items

**PUT** `/api/v1/web/admin/care-plans/{care_plan}/days/{day}/sections/{section}/items`

Use `section = walking`.

### Request body

```json
{
    "items": [
        {
            "id": 3,
            "title": "Daily steps",
            "guidance": "Aim for consistent walking",
            "target_value": 8000,
            "target_unit_id": 42,
            "meta": null
        }
    ]
}
```

| Field                     | Rules                                                     |
| ------------------------- | --------------------------------------------------------- |
| `items`                   | Required array (full replace for that section on the day) |
| `items.*.id`              | Optional; omit to create; include to update               |
| `items.*.title`           | Required string, max 150                                  |
| `items.*.guidance`        | Optional string                                           |
| `items.*.target_value`    | Optional number ≥ 0 (step target)                         |
| `items.*.target_unit_id`  | Optional; must exist in `units`                           |
| `items.*.meta`            | Optional object                                           |
| `items.*.eating_window`   | **Not allowed** (nutrition only)                          |
| `items.*.exercises`       | **Not used** (movement only)                              |
| `items.*.nutrition_items` | **Not used** (nutrition only)                             |

**Replace semantics (same as other sections):** any existing walking row whose `id` is omitted from `items` is deleted.

### Success response

Standard builder resource (`data.days[].sections.walking` updated). HTTP 200.

### Validation errors (422)

- Missing `items` / `items.*.title`
- Invalid `target_unit_id`
- `eating_window` set on a non-nutrition section

---

## 3. Period report: average steps (auto)

Walking logs feed the same report workspace used for avg intake / avg burn.

### Flow (unchanged admin UX)

1. Create operational log draft
2. **GET** report workspace
3. Save metrics on operational log
4. Submit for review (optional `average_inputs`)

### New suggested metric

When the period has at least one walking row:

```json
{
    "metric_key": "walking_steps_total",
    "section": "walking",
    "label": "All Walking Steps",
    "unit": "Steps",
    "target_value": 16000,
    "actual_value": 16000,
    "days_on_target": 2,
    "days_total": 2,
    "daily_points": [
        /* per day in period */
    ]
}
```

Synthesis: **sum of walking row targets/actuals per day**, then period totals.

Per-title walking metrics may also appear (e.g. `walking_daily_steps`) — same pattern as hydration/sleep title rollups.

### Default average inputs

Workspace response:

```json
{
    "report_generation_defaults": {
        "average_inputs": {
            "avg_intake": { "value": 1800, "unit": "Kilocalorie" },
            "avg_burn": { "value": 400, "unit": "Kilocalorie" },
            "avg_steps": { "value": 8000, "unit": "Steps" },
            "avg_training_time": { "value": 0, "unit": "minute" }
        }
    }
}
```

**Formula (same as intake/burn):**

`avg_steps = walking_steps_total.actual_value ÷ walking_steps_total.days_total`

- If there are **no** walking items in the period → `avg_steps.value` is `0` and submit-for-review default highlight may still mark steps as needing manual entry when no metric exists.
- Admin may still **override** via `average_inputs.avg_steps` or `manual_highlights` on submit-for-review (manual override still supported).

### Submit for review example

```json
{
    "average_inputs": {
        "avg_intake": 1800,
        "avg_burn": 400,
        "avg_steps": 8000,
        "avg_training_time": 45
    },
    "included_metric_keys": ["meals_total_kcal", "walking_steps_total"]
}
```

If `walking_steps_total` is included in `included_metric_keys`, its highlight **value** is the period **average** (same special-casing as meals / burn), not the raw period sum.

### Evidence payload

Each evidence day can include walking items:

```json
{
    "section": "walking",
    "morph": "walking",
    "item_id": 3,
    "title": "Daily steps",
    "target": { "value": 8000, "unit": "steps", "unit_id": 42 },
    "log": {
        "id": 99,
        "is_completed": true,
        "actual_value": 7200,
        "unit": "steps",
        "notes": "Evening walk",
        "media": []
    },
    "client_note": null
}
```

---

## 4. Client log entries (admin list)

Walking logs are included in the care-plan log entries list with:

- `section`: `"walking"`
- `item_title`, `target_value`, `target_unit`, day number / target date — same fields as hydration/sleep

No new endpoint; existing list endpoint now returns walking morphs.

---

## 5. Frontend checklist

1. Add **Walking** tab/section in care-plan day editor (mirror hydration/sleep form fields).
2. Upsert with `section: "walking"`; handle full-replace delete semantics.
3. Show `sections.walking` from builder GET and after every mutation that returns the builder resource.
4. In report generate modal, prefill **Average steps** from `report_generation_defaults.average_inputs.avg_steps` (no longer always blank / manual-only when walking data exists).
5. Optionally surface `walking_steps_total` in metrics picker (`included_metric_keys`).
6. Keep allowing manual override of `avg_steps` when the coach wants a different number.

---

## 6. Compatibility

- Old care plans without walking rows continue to work.
- Existing avg intake / burn logic is unchanged.
- `avg_training_time` remains manual.
- Mobile clients that ignore unknown section keys keep working; admin UI should render the new key.
