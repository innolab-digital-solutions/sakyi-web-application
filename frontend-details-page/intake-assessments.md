# Admin onboarding intake details page

This guide describes what the frontend should show for the onboarding intake details page based on `OnboardingIntakeResource` (`app/Http/Resources/V1/Web/Admin/OnboardingIntakeResource.php`).

The detail endpoint is:

- `GET /api/v1/web/admin/onboarding/intakes/{intake}`

Related actions from this page:

- `PUT /api/v1/web/admin/onboarding/intakes/{intake}/sections/{section}` (save section answers)
- `POST /api/v1/web/admin/onboarding/intakes/{intake}/complete` (complete intake)
- `POST /api/v1/web/admin/onboarding/intakes/{intake}/cancel` (cancel intake)

---

## Page goal

The intake details page should answer:

1. Who is this intake for?
2. What program/request does it belong to?
3. What is the current intake status and progress?
4. What questions/answers are filled and what is missing?
5. What can the admin do next (continue, complete, cancel, jump to contract/enrollment flow)?

---

## Response shape (what frontend gets)

Top-level fields in `data`:

- `id`, `code`
- `enrollment_request` (`id`, `code`) or `null`
- `status`
- `notes`
- `cancellation_note`
- `client` (`id`, `client_code`, `name`, `email`, `picture_url`) or `null`
- `handler` (`id`, `name`, `email`, `picture_url`, `role`) or `null`
- `program` (`id`, `code`, `thumbnail_url`, optional `title`, `slug`) or `null`
- `enrollment_contract` (`id`, `code`, `sent_at`, `signed_at`) or `null`
- `template`:
  - `id`, `title`, `version`
  - `sections[]`:
    - `id`, `title`, `description`, `sort_order`
    - `questions[]`:
      - `id`, `question`, `key`, `type`, `required`, `options`, `answer`
- `timestamps`: `completed_at`, `cancelled_at`, `created_at`, `updated_at`

Additionally, `meta.progress` is included in the show response from controller meta.

---

## Recommended UI structure

## 1) Header / context strip

Show at top:

- Intake code: `code`
- Status badge: `status`
- Created/updated dates: `timestamps.created_at`, `timestamps.updated_at`
- Progress indicator from `meta.progress` (if present)

Primary actions (status-driven):

- Save current section answers
- Complete intake
- Cancel intake

If `status` is completed/cancelled, disable editing and keep read-only summary.

## 2) Relationship cards (quick context)

### Client card

- Avatar: `client.picture_url`
- Name/email/client code: `client.name`, `client.email`, `client.client_code`
- Link to client profile page using `client.id`

### Program card

- Thumbnail/code/title: `program.thumbnail_url`, `program.code`, `program.title`
- Optional subtitle: `program.slug`

### Enrollment request card

- Request code: `enrollment_request.code`
- Link to enrollment request details page via `enrollment_request.id`

### Handler card

- Staff identity and role: `handler.name`, `handler.email`, `handler.role`

## 3) Intake form content (main area)

Render `template.sections` in `sort_order`.

For each section:

- Show `title`, `description`
- Show completion ratio for this section
- Render questions from `questions[]`

For each question:

- Label from `question`
- Control type from `type`
- Required flag from `required`
- Options from `options` (for select/radio/checkbox style)
- Current value from `answer`

UX recommendations:

- Keep autosave/save-per-section behavior tied to `PUT .../sections/{section}`.
- Show unsaved changes indicator.
- Validate required questions client-side before calling complete.

## 4) Operational notes panel

- Editable notes: `notes`
- If cancelled, show `cancellation_note` prominently.
- Timeline summary from `timestamps.completed_at` and `timestamps.cancelled_at`.

## 5) Downstream status card

Use `enrollment_contract` to show next-stage readiness:

- If null: show empty state “Contract not assigned yet”.
- If present: show contract code and sent/signed timestamps.
- Provide deep link to contract details using `enrollment_contract.id`.

---

## State handling rules

- **Draft/in-progress intake**: editable answers and actions enabled.
- **Completed intake**: read-only answers; show completed timestamp.
- **Cancelled intake**: read-only answers; show cancellation note + cancelled timestamp.
- **Missing optional relations** (`client`, `program`, `handler`, `enrollment_request`, `enrollment_contract`) should render graceful empty states, not crash.

---

## Empty and error UX

- If `template.sections` is empty, show “No assessment template content available”.
- If question `options` is null/empty for a type that expects options, render safe fallback text.
- If `answer` is null, show placeholder “Not answered yet”.

---

## Minimal layout suggestion

- Left column (or top on mobile): context cards (client/program/request/handler/status).
- Right column (main): template sections and question/answer editor.
- Bottom sticky action bar: Save section, Complete intake, Cancel intake (state-aware enable/disable).

---

## Integration checklist for frontend

- Use `meta.progress` for progress UI when available.
- Sort sections by `sort_order` (resource already loads ordered, but keep stable behavior).
- Render fields defensively for null relations.
- Keep status-driven action gating consistent with backend.
- Prefer deep links:
  - Enrollment request details from `enrollment_request.id`
  - Enrollment contract details from `enrollment_contract.id`
