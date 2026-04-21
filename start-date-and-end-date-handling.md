# Care Plan Date Handling (Admin + Frontend)

## Goal

This document defines the date guardrails for admin care-plan creation/editing and day generation so frontend and backend enforce the same behavior.

## Date Policy

- `starts_on` must be today or in the future.
- `starts_on` cannot be more than **180 days ahead** from today.
- `ends_on` must be greater than or equal to `starts_on`.
- Total plan duration (`starts_on`..`ends_on`, inclusive) cannot exceed **90 days**.

## Why This Policy

- Prevents accidental backdated plans that can conflict with real-time client logging.
- Keeps plans in a practical scheduling window for admin operations.
- Avoids very large generated day sets that increase UI and data complexity.

## What Is Allowed

- Future pre-creation (admin can plan ahead).
- Same-day plans (`starts_on == ends_on`, 1 day total).
- Draft regeneration with new date range via days generation endpoint when `replace_existing=true`.

## What Is Not Allowed

- Start date in the past.
- Start date too far in the future (>180 days).
- Date ranges longer than 90 days.
- Active plan date changes from generate endpoint (must create revision).

## Endpoint Rules

## `PATCH /api/v1/web/admin/care-plans/{care_plan}/basics`

Required input:

```json
{
  "starts_on": "YYYY-MM-DD",
  "ends_on": "YYYY-MM-DD"
}
```

Validation:

- `starts_on`: required, date, `>= today`, `<= today + 180 days`
- `ends_on`: required, date, `>= starts_on`
- duration: max 90 days (enforced in service)

## `POST /api/v1/web/admin/care-plans/{care_plan}/days/generate`

Allowed payload:

```json
{
  "replace_existing": true,
  "starts_on": "YYYY-MM-DD",
  "ends_on": "YYYY-MM-DD"
}
```

Notes:

- `starts_on` + `ends_on` are optional, but if one is sent the other must be sent.
- If dates are sent for a **draft**, backend updates the plan dates first, then regenerates days.
- If dates are sent for an **active** plan, backend rejects and requires revision flow.
- If days already exist, `replace_existing=true` is required.

## Frontend UX Recommendations

- Disable selecting past dates in date picker.
- Limit date picker max start date to today + 180 days.
- Show plan length preview (for example: "14 days") while selecting range.
- Block submit if length > 90 days before API call.
- If backend returns validation error, display field-level message exactly as returned.

## Common Error Cases (Expected)

- `starts_on` in the past -> validation error on `starts_on`.
- `ends_on` before `starts_on` -> validation error on `ends_on`.
- duration > 90 days -> validation error on `ends_on`.
- regenerate with existing days and `replace_existing=false` -> validation error on `replace_existing`.
- active plan date override in generate endpoint -> validation error on `care_plan`.
