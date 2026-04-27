# Client-Facing Report Generation (No Separate Builder Endpoint)

This document describes the implemented flow where admin generates the client report directly from the operational log workspace/modal.

## 1) Product flow

- Admin edits internal operational metrics in the operational log builder.
- Admin clicks **Generate Report** (modal opens in frontend).
- In modal, admin provides:
  - narrative (`summary`, `focus_next_period`, internal `notes`)
  - which operational metrics to include (nutrition, estimated burn, optional activity/recovery)
  - **4 average inputs**: `avg_intake`, `avg_steps`, `avg_training_time`, `avg_burn`
- Frontend sends this payload to **submit-for-review**.
- Backend creates the report run and stores curated highlights.
- Frontend can later update content via existing `report-runs/{id}` endpoint.

No separate `/builder` endpoint is required.

## 2) API endpoints to use

- `GET /care-plans/{care_plan}/report-workspace`
- `PUT /care-plans/{care_plan}/operational-logs/{operational_log}`
- `POST /care-plans/{care_plan}/operational-logs/{operational_log}/submit-for-review`
- `GET /care-plans/{care_plan}/report-runs/{report_run}`
- `PUT /care-plans/{care_plan}/report-runs/{report_run}`
- `POST /care-plans/{care_plan}/report-runs/{report_run}/publish`

## 3) Submit-for-review payload (modal payload)

`POST /care-plans/{care_plan}/operational-logs/{operational_log}/submit-for-review`

```json
{
  "feedback": {
    "summary": "Great consistency this week.",
    "focus_next_period": "Maintain hydration before noon.",
    "notes": "Internal notes for care team."
  },
  "average_inputs": {
    "avg_intake": 1600,
    "avg_steps": 6500,
    "avg_training_time": 45,
    "avg_burn": 300
  },
  "included_metric_keys": [
    "meals_total_kcal",
    "estimated_energy_burn",
    "activity_training"
  ],
  "manual_highlights": [
    {
      "metric_key": "avg_steps",
      "label": "Average steps",
      "value": 6500,
      "unit": "steps",
      "is_visible_to_client": true
    },
    {
      "metric_key": "avg_training_time",
      "label": "Average training time",
      "value": 40,
      "unit": "minute",
      "is_visible_to_client": true
    }
  ]
}
```

### Backend behavior

- `average_inputs` are supported directly and produce the 4 highlights:
  - `avg_intake`, `avg_steps`, `avg_training_time`, `avg_burn`
- `avg_intake` and `avg_burn` are backend-prefill capable but still admin-editable overrides.
- `included_metric_keys` maps to operational log metrics (`metric_key`) and stores them as visible calculated highlights.
- For included keys:
  - `meals_total_kcal` is converted to avg/day value.
  - `estimated_energy_burn` is converted to avg/day value.
  - other included metrics use their metric `actual_value`.
- `manual_highlights` are stored as manual highlights.
- If admin sends no selection payload, backend seeds defaults:
  - avg intake, avg burn, avg steps (manual placeholder), avg training time (manual placeholder).

### Getting prefilled values for the 4 input boxes

`GET /care-plans/{care_plan}/report-workspace` now includes:

```json
{
  "data": {
    "report_generation_defaults": {
      "average_inputs": {
        "avg_intake": { "value": 1700, "unit": "Kilocalorie" },
        "avg_burn": { "value": 280, "unit": "Kilocalorie" },
        "avg_steps": { "value": null, "unit": "steps" },
        "avg_training_time": { "value": null, "unit": "minute" }
      }
    }
  }
}
```

Use these as default values in the modal, and let admin edit all four.

## 4) Report run update payload

`PUT /care-plans/{care_plan}/report-runs/{report_run}`

Supports updating both feedback and highlights (same highlight structure already returned by API):

```json
{
  "feedback": {
    "summary": "Updated summary",
    "focus_next_period": "Keep meal timing consistent",
    "notes": "Internal notes"
  },
  "highlights": [
    {
      "metric_key": "meals_total_kcal",
      "label": "All Nutrition Meals",
      "value": 1800,
      "unit": "Kilocalorie",
      "source": "calculated",
      "is_visible_to_client": true,
      "display_order": 0,
      "meta": { "from_metric_key": "meals_total_kcal" }
    },
    {
      "metric_key": "avg_steps",
      "label": "Average steps",
      "value": 6500,
      "unit": "steps",
      "source": "manual",
      "is_visible_to_client": true,
      "display_order": 1,
      "meta": { "needs_manual_entry": true }
    }
  ]
}
```

## 5) Response fields frontend should use

`submit-for-review`, `show report run`, and `update report run` responses include:

- `data.status`
- `data.period`
- `data.feedback`
- `data.highlights` (client-facing cards)
- `data.metrics` (internal op-log metrics context)

Use `data.highlights` as the primary source for client report cards.

## 6) Publish rules

Publish (`POST /report-runs/{id}/publish`) requires:

- report run status is `in_review`
- `feedback.summary` is non-empty
- at least one highlight where `is_visible_to_client = true`

On publish:

- report run becomes `published`
- operational log becomes `locked`

## 7) Frontend UX notes

- Keep modal simple:
  - checkbox list from `operational_log.metrics` keys (include/exclude)
  - manual fields for avg steps / avg training time
  - summary / focus next period / internal notes
- Do not expose internal notes on client-facing screens.
- Do not rely on query params (`?report_run_id=...`) for source of truth. Use explicit run ID path endpoints (`/report-runs/{report_run}`).
