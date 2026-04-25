# Care Plan Handling (Admin Frontend Contract)

This document explains the backend care-plan lifecycle after introducing **scheduled activation** to prevent early/unsafe activations.

## 1) Lifecycle and Meaning

- `draft`: editable working plan.
- `scheduled`: approved and locked for future start date.
- `active`: plan is live for client logging.
- `completed`: finished period.
- `cancelled`: closed/voided.

`cycle_number` still increments for each new care-plan record in the same enrollment (including revisions).

## 2) Safe Activation Rules

Activation endpoint remains:

- `POST /api/v1/web/admin/care-plans/{care_plan}/activate`

Behavior now depends on plan date range:

- If `starts_on > today` -> status becomes `scheduled`.
- If `starts_on <= today` -> status becomes `active`.

Validation/guardrails:

- Enrollment must be active.
- Plan must pass activation validation (dates, day coverage, day content).
- No overlap allowed with another `active` or `scheduled` plan in the same enrollment date range.

Timestamp behavior:

- `scheduled_at`: set when activation endpoint is used.
- `activated_at`: set only when final status is `active`.

## 3) Scheduled Auto-Activation

Backend adds a scheduler command:

- `care-plans:activate-due`

Scheduled in `routes/console.php`:

- runs daily at `00:12`.

What it does:

- Finds `scheduled` plans with `starts_on <= reference_date`.
- Calls the same activation logic.
- Converts due plans to `active` (if still valid and non-overlapping).

Manual run:

- `php artisan care-plans:activate-due`
- Optional date override: `php artisan care-plans:activate-due --date=2026-11-01`

## 4) Revision and Cancel Rules

- Revision can now be created from `active` **or** `scheduled` plans.
- Cancel now accepts `draft`, `scheduled`, or `active`.

## 5) API Response Implications for Frontend

Care-plan resources now include scheduling timestamps:

- `timestamps.scheduled_at`
- `timestamps.activated_at`

Builder resource also includes:

- `scheduled_at`
- `activated_at`

Activation response message:

- If future-dated: `"Care plan scheduled successfully."`
- If current/started: `"Care plan activated successfully."`

## 6) Frontend UX Recommendations

- Show a **status badge** (`draft` / `scheduled` / `active` / etc.).
- On activate action:
  - Do not assume success means `active`.
  - Use returned `data.status` to branch UI.
- For `scheduled` plans:
  - Show `starts_on` countdown and `scheduled_at`.
  - Allow cancel/revision actions.
  - Avoid showing as currently live plan in operational dashboards.
- In enrollment summary (`current_active_plan`):
  - Keep showing only truly `active` plan.
  - Optionally add a separate `next_scheduled_plan` widget in frontend by querying care plans list and filtering `scheduled`.

## 7) Problem Prevention Checklist

- Never treat all "activated" responses as immediately live.
- Never allow overlapping future plans in UI planner (backend blocks this, but pre-check in frontend improves UX).
- Always refresh plan detail after activation action and trust returned status.
- For future plans, communicate clearly: **scheduled now, auto-activates on start date**.

