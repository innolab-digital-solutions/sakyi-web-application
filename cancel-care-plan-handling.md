# Cancel Care Plan Handling (Admin + Frontend)

## Purpose

Use care plan cancellation when an existing plan should no longer be used for that enrollment.

Typical examples:

- admin created a wrong draft and wants to discard it,
- admin created a revision from an active plan and wants to replace the old active plan.

## API

## Cancel care plan

- Method: `POST`
- URL: `/api/v1/web/admin/care-plans/{care_plan}/cancel`
- Route name: `v1.web.admin.care-plans.cancel`
- Auth: admin/super-admin only

Request body:

```json
{
  "cancellation_note": "Reason for cancelling this plan"
}
```

Validation:

- `cancellation_note` is required
- must be a string
- maximum 2000 characters

Response:

- Returns the updated care plan resource with `status = "cancelled"`.
- Returns persisted `cancellation_note` for audit/history display.

## Status transition rules

Allowed cancellation targets:

- `draft` -> `cancelled`
- `active` -> `cancelled`

Not allowed:

- `completed` -> cannot cancel
- `cancelled` -> cannot cancel again

## Correct replacement flow (active -> revision -> replacement)

If you want to replace an active plan:

1. Create revision from current active plan.
2. Edit the revision draft (dates/days/items/notes).
3. Validate revision draft and ensure it is activation-ready.
4. Cancel old active plan.
5. Activate revision draft.

Important system rule:

- Only one active care plan is allowed per enrollment.
- Draft activation is blocked if another active care plan still exists in that enrollment.

## When frontend should show "Cancel"

Show cancel action when:

- plan status is `draft` or `active`,
- user has admin permission.

Hide/disable cancel action when:

- status is `completed` or `cancelled`.

## Frontend UX recommendations

- Show confirmation modal before cancel.
- Require cancellation note text input in the confirmation modal.
- Use strong warning text for active plans:
  - "This will deactivate the current active plan for this enrollment."
- After successful cancel:
  - refresh list/builder state,
  - update status badge to `cancelled`,
  - if user was in replacement flow, enable "Activate revision" action.

## Common error cases to handle

- Trying to activate revision while old active still exists:
  - field: `care_plan`
  - message: cancel active plan first.
- Trying to cancel already completed/cancelled plan:
  - field: `care_plan`
  - message: only draft/active can be cancelled.

