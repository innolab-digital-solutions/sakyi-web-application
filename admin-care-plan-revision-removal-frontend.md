# Admin Care Plan — Revision Feature Removal (Frontend Guide)

This document is for the **admin dashboard** frontend team.

**Change summary:** Care plan **revision mode** has been removed from the backend API. Admins can no longer clone an active/scheduled/cancelled plan into a draft via a dedicated revision endpoint. Content edits on active plans still use **edit mode**. Replacing a plan uses **create a new draft → cancel overlapping live plan → activate**.

---

## 1. What was removed

### Removed endpoint

| Method | Path                                                | Former route name                  |
| ------ | --------------------------------------------------- | ---------------------------------- |
| `POST` | `/api/v1/web/admin/care-plans/{care_plan}/revision` | `v1.web.admin.care-plans.revision` |

### Frontend must delete / stop calling

- Any “Create revision” / “Revise plan” button, menu item, or flow
- API client methods that hit `.../revision`
- UI copy that tells admins to “create a revision”
- Logic that expected a `201` revision draft response from that endpoint

Calling the removed endpoint now returns **404** (route no longer exists).

There was never a separate revision model or `is_revision` flag. A revision was only a new `draft` care plan row. Removing the endpoint does **not** change care plan `status` values or list/show response shapes beyond the missing endpoint.

---

## 2. What stays the same

These admin care plan APIs are unchanged and remain the supported surface:

| Action                     | Method  | Path                                                                           |
| -------------------------- | ------- | ------------------------------------------------------------------------------ |
| List                       | `GET`   | `/api/v1/web/admin/care-plans`                                                 |
| Show                       | `GET`   | `/api/v1/web/admin/care-plans/{care_plan}`                                     |
| Create draft               | `POST`  | `/api/v1/web/admin/care-plans`                                                 |
| Builder payload            | `GET`   | `/api/v1/web/admin/care-plans/{care_plan}/builder`                             |
| Update dates (basics)      | `PATCH` | `/api/v1/web/admin/care-plans/{care_plan}/basics`                              |
| Generate / regenerate days | `POST`  | `/api/v1/web/admin/care-plans/{care_plan}/days/generate`                       |
| Upsert day section items   | `PUT`   | `/api/v1/web/admin/care-plans/{care_plan}/days/{day}/sections/{section}/items` |
| Update day notes           | `PATCH` | `/api/v1/web/admin/care-plans/{care_plan}/days/{day}/notes`                    |
| Update day motivation      | `PATCH` | `/api/v1/web/admin/care-plans/{care_plan}/days/{day}/motivation`               |
| Validate for activation    | `POST`  | `/api/v1/web/admin/care-plans/{care_plan}/validate`                            |
| Activate / schedule        | `POST`  | `/api/v1/web/admin/care-plans/{care_plan}/activate`                            |
| Cancel                     | `POST`  | `/api/v1/web/admin/care-plans/{care_plan}/cancel`                              |
| Enter edit mode            | `POST`  | `/api/v1/web/admin/care-plans/{care_plan}/enter-edit-mode`                     |
| Exit edit mode             | `POST`  | `/api/v1/web/admin/care-plans/{care_plan}/exit-edit-mode`                      |

Auth: Sanctum admin / super-admin token (same as before). Send `Accept: application/json`.

Standard success / error envelope is unchanged (see `docs/api-request-and-response-handling.md`).

---

## 3. Statuses (unchanged)

```text
draft | scheduled | active | completed | cancelled
```

| Status      | Meaning for UI                                                             |
| ----------- | -------------------------------------------------------------------------- |
| `draft`     | Editable builder (dates, days, items)                                      |
| `scheduled` | Future plan; edits demote it back to `draft`                               |
| `active`    | Live plan; content edits require **edit mode**; dates cannot be changed    |
| `completed` | Read-only                                                                  |
| `cancelled` | Read-only for that plan; create a **new draft** if a replacement is needed |

---

## 4. How admins should work now (replace revision UX)

### A) Edit content on an **active** plan (preferred for small/medium content changes)

1. Call **enter edit mode**
2. Edit day content / notes / motivation / section items while `client_logging_paused === true`
3. Call **exit edit mode** when done

**Important:** while edit mode is on, **client logging is paused** for that plan. Show a clear banner and require exit when finished.

#### Enter edit mode

```http
POST /api/v1/web/admin/care-plans/{id}/enter-edit-mode
```

- Body: none required
- Success: `200`
- `data`: full **builder** payload (`CarePlanBuilderResource`)
- Message example: `Edit mode enabled. Client logging is paused until you exit edit mode.`

Key fields to read from `data`:

```json
{
    "status": "active",
    "client_logging_paused": true,
    "client_logging_paused_at": "2026-05-01T10:00:00.000000Z",
    "days": [
        /* full day/section tree */
    ]
}
```

Allowed only when `status === "active"`. Otherwise validation error on `care_plan`.

#### Exit edit mode

```http
POST /api/v1/web/admin/care-plans/{id}/exit-edit-mode
```

- Success: `200`
- Message example: `Edit mode ended. Client logging is resumed.`
- `data.client_logging_paused` becomes `false`

### B) Replace a plan (former “revision” intent: new dates / new day structure / full replacement)

There is **no clone API**. Frontend should guide admins through:

1. **Create a new draft** for the same enrollment  
   `POST /api/v1/web/admin/care-plans`  
   Body: `{ "enrollment_id": <id> }` → `201`, `data.status = "draft"`
2. Configure the new draft (basics → generate days → section items → validate)
3. If an overlapping `active` or `scheduled` plan exists for that enrollment/date range:
    - **Cancel** the live plan first (required note)
    - Then **activate** the new draft
4. Activate fails with overlap validation until the overlapping live plan is cancelled/adjusted

#### Create draft

```http
POST /api/v1/web/admin/care-plans
Content-Type: application/json

{ "enrollment_id": 123 }
```

Success `201`:

```json
{
    "status": "success",
    "message": "Care plan draft created successfully.",
    "data": {
        "id": 456,
        "status": "draft",
        "cycle_number": 2,
        "client_logging_paused": false
    }
}
```

`cycle_number` still increments per enrollment for every new care plan (including replacements). Do not treat it as “revision number” UI unless product still wants that label for “Nth plan under enrollment”.

#### Cancel live plan

```http
POST /api/v1/web/admin/care-plans/{id}/cancel
Content-Type: application/json

{ "cancellation_note": "Replacing with a new care plan." }
```

- `cancellation_note`: **required**, string, max `2000`
- Allowed statuses: `draft`, `scheduled`, `active`
- Success `200`, `data.status = "cancelled"`

#### Activate replacement draft

```http
POST /api/v1/web/admin/care-plans/{id}/activate
```

- Allowed statuses: `draft`, `scheduled`
- If start date is today → becomes `active`
- If start date is in the future → becomes `scheduled`
- Overlap with another `active`/`scheduled` plan on the same enrollment → `422` on `care_plan`

---

## 5. Capabilities matrix (what UI should enable)

| Capability                          | `draft` | `scheduled` | `active`                      | `active` + edit mode    | `cancelled` / `completed` |
| ----------------------------------- | ------- | ----------- | ----------------------------- | ----------------------- | ------------------------- |
| Update basics (dates)               | Yes     | Yes         | **No**                        | **No**                  | No                        |
| Generate / regenerate days          | Yes     | Yes         | **No**                        | **No**                  | No                        |
| Edit day items / notes / motivation | Yes     | Yes         | **No** (must enter edit mode) | Yes (with limits below) | No                        |
| Enter / exit edit mode              | No      | No          | Yes                           | Yes                     | No                        |
| Activate                            | Yes     | Yes         | No                            | No                      | No                        |
| Cancel                              | Yes     | Yes         | Yes                           | Yes                     | No                        |
| Create revision (clone)             | —       | —           | **Removed**                   | **Removed**             | **Removed**               |

### Active edit-mode limits (still enforced)

Even in edit mode:

- Items that already have **client logs** **cannot be deleted**
- Without edit mode, changing logged targets / linked nutrition items / movement exercises is blocked; with edit mode, content updates are allowed for non-delete cases, but logged-item **deletion** stays blocked

Surface these as form/toast errors from `errors.items` or `errors.care_plan`.

---

## 6. Important response fields for UI state

From list/show (`CarePlanResource`) and builder / edit-mode responses (`CarePlanBuilderResource`):

| Field                                                              | Use in dashboard                                   |
| ------------------------------------------------------------------ | -------------------------------------------------- |
| `status`                                                           | Gate buttons and builder editability               |
| `client_logging_paused`                                            | Show “Edit mode ON / client logging paused” banner |
| `client_logging_paused_at` / `timestamps.client_logging_paused_at` | Optional “paused since” display                    |
| `starts_on` / `ends_on`                                            | Date range display; basics form                    |
| `cancellation_note`                                                | Show on cancelled plans                            |
| `cycle_number`                                                     | Optional “Plan #N” under enrollment                |
| `counts.days`                                                      | List summary (when counted)                        |

Builder + enter/exit edit mode return the **full day tree** in `data.days`. Prefer refreshing builder state from these responses after enter/exit.

---

## 7. Error messages frontend should handle (updated copy)

Validation errors use the standard API error envelope with field keys (commonly `care_plan` or `items`).

### After revision removal (copy changed)

| Situation                               | Field       | Message                                                                                   |
| --------------------------------------- | ----------- | ----------------------------------------------------------------------------------------- |
| Edit active content without edit mode   | `care_plan` | `Enter edit mode first to pause client logging, then edit this active care plan.`         |
| Edit non-editable status                | `care_plan` | `This care plan can no longer be edited directly.`                                        |
| Delete logged item on active plan       | `items`     | `Cannot delete an active care plan item that already has user logs.`                      |
| Change logged targets without edit mode | `items`     | `Cannot change logged targets in an active care plan. Enter edit mode for major changes.` |

### Still relevant (unchanged)

| Situation                                             | Field               | Message                                                                                                  |
| ----------------------------------------------------- | ------------------- | -------------------------------------------------------------------------------------------------------- |
| Basics on active plan                                 | `care_plan`         | `Only draft or scheduled plans can be edited directly.`                                                  |
| Activate with overlapping live plan                   | `care_plan`         | `Another active or scheduled care plan overlaps this date range. Cancel or adjust it before activation.` |
| Cancel without note                                   | `cancellation_note` | validation required                                                                                      |
| Date range changed after days exist (draft/scheduled) | `care_plan`         | `Plan dates changed. Regenerate days with replace_existing=true before continuing.`                      |

**Do not** keep frontend strings that say “Create a revision…” — backend no longer returns that guidance.

Example `422` shape:

```json
{
    "status": "error",
    "message": "The given data was invalid.",
    "errors": {
        "care_plan": [
            "Another active or scheduled care plan overlaps this date range. Cancel or adjust it before activation."
        ]
    }
}
```

---

## 8. Recommended admin dashboard UX checklist

- [ ] Remove all revision UI and API calls
- [ ] Keep **Enter edit mode** / **Exit edit mode** for active plans
- [ ] Show a persistent banner when `client_logging_paused === true`
- [ ] Disable date / day-regeneration controls for `active` (and completed/cancelled)
- [ ] For “new plan / replace plan”:
    - [ ] Create draft under same `enrollment_id`
    - [ ] Build and validate the draft
    - [ ] If activate returns overlap error → prompt cancel of the current live plan with required note → retry activate
- [ ] Update empty states / help text that mentioned revision mode
- [ ] Treat `404` on `/revision` as “feature removed” during migration (then delete the call entirely)

---

## 9. Suggested replacement flows (product language)

| Old UX                               | New UX                                                                                          |
| ------------------------------------ | ----------------------------------------------------------------------------------------------- |
| “Create revision” from active plan   | “Create new care plan” for enrollment, or “Edit plan” (edit mode) for content-only changes      |
| Clone days/items automatically       | Manual rebuild in the new draft (no backend clone)                                              |
| Revision draft alongside active plan | New draft can exist alongside active plan, but **activation** requires no overlapping live plan |

If product later needs one-click clone again, that would be a **new** backend feature — it is not available now.

---

## 10. Quick reference — edit mode vs replace

```text
Need to tweak titles, guidance, items, notes, motivation on ACTIVE plan?
  → Enter edit mode → edit → Exit edit mode

Need new dates, new day structure, or a full replacement plan?
  → Create new draft → configure → Cancel overlapping active/scheduled plan → Activate draft
```

---

## 11. Related docs

- `docs/api-request-and-response-handling.md` — shared success/error JSON contract
