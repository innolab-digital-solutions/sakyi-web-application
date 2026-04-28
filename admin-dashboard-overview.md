# Admin Dashboard Overview API

This document defines the minimal admin overview dashboard contract for frontend integration.

## Endpoint

- Method: `GET`
- URL: `/api/v1/web/admin/dashboard/overview`
- Auth: `Bearer` token (`auth:sanctum`)
- Route name: `admin.dashboard.overview`

## Query Params

No query params are required or supported for overview rendering.

Use:

`GET /api/v1/web/admin/dashboard/overview`

## Response Envelope

Follows standard API response format:

- `status`
- `message`
- `data`
- `meta.version`

## `data` Shape

```json
{
  "kpis": {
    "pending_enrollment_requests": 0,
    "contracts_waiting_signature": 0,
    "active_enrollments": 0,
    "care_plans_needing_attention": 0,
    "reports_awaiting_publish": 0,
    "total_users": 0,
    "scheduled_enrollments_starting_soon": 0,
    "total_clients": 0
  },
  "charts": {
    "pipeline_funnel": {
      "stages": [
        { "key": "request_submitted", "label": "Request Submitted", "count": 0 },
        { "key": "intake_completed", "label": "Intake Completed", "count": 0 },
        { "key": "contract_signed", "label": "Contract Signed", "count": 0 },
        { "key": "enrollment_created", "label": "Enrollment Created", "count": 0 }
      ]
    },
    "request_enrollment_trend": {
      "points": [
        { "period": "2026-04", "requests": 0, "enrollments": 0 }
      ]
    },
    "active_workload_by_program": {
      "bars": [
        {
          "program_id": 1,
          "program_code": "PRG-0001",
          "program_title": "Weight Management",
          "active_enrollments": 0
        }
      ]
    }
  },
  "meta": {
    "generated_at": "2026-04-28T14:22:00+00:00"
  }
}
```

## Frontend Widget Mapping

Use these eight KPI cards (recommended for 4x2 grid):

1. `pending_enrollment_requests`
2. `contracts_waiting_signature`
3. `active_enrollments`
4. `care_plans_needing_attention`
5. `reports_awaiting_publish`
6. `total_users`
7. `scheduled_enrollments_starting_soon`
8. `total_clients`

Use these three charts:

1. Funnel chart
   - Source: `charts.pipeline_funnel.stages`
   - X-axis/order: keep returned order.
   - Y-axis: `count`.
2. Dual line chart
   - Source: `charts.request_enrollment_trend.points`
   - X-axis: `period` (`YYYY-MM`)
   - Series A: `requests`
   - Series B: `enrollments`
3. Horizontal bar chart
   - Source: `charts.active_workload_by_program.bars`
   - Label: `program_title`
   - Value: `active_enrollments`

## Recommended Frontend Behavior

- Refresh every 60-120 seconds (or on page focus).
- Use KPI skeleton loading states.
- If chart arrays are empty, show empty-state text:
  - Funnel: "No pipeline activity yet."
  - Trend: "No request/enrollment activity yet."
  - Program workload: "No active enrollments by program."
- Show `data.meta.generated_at` as the last refresh timestamp.

## Notes for Product/Design

- This endpoint is intentionally operational (quick status), not deep analytics.
- All metrics are computed from existing production entities:
  users, enrollment requests, onboarding intakes, contracts, enrollments, care plans, and reports.
