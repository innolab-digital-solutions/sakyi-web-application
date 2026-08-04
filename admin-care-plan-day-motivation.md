# Admin Care Plan — Daily Motivation (Tips)

Guide for the admin dashboard: set a **daily motivation / tip** on each care plan day. Clients see this on the mobile **home overview** screen.

This API mirrors **day notes** (`PATCH …/days/{day}/notes`), but stores a separate client-facing field.

Base API prefix: `/v1/web/admin`. Requires admin bearer token.

---

## What changed

| Area | Change |
|------|--------|
| New field on care plan days | `daily_motivation` (nullable text) |
| New admin endpoint | `PATCH …/days/{day}/motivation` |
| Care plan builder payload | Each day includes `daily_motivation` |
| Day notes (`general_notes`) | **Unchanged** — still internal/admin day summary |
| Active care plans | Same rule as notes: edit only via **revision** draft |

---

## Mental model

| Field | Audience | Purpose |
|-------|----------|---------|
| `general_notes` | Admin / planning | Day notes in the builder (already used as mobile `enrollment_card.summary`) |
| `daily_motivation` | Mobile client | Tip / motivation shown on home screen for that day |

Do **not** reuse the notes API for motivation. Use the dedicated motivation endpoint.

---

## Admin flow

```text
1. Open care plan builder (draft or scheduled)
2. Select a day
3. Enter Daily motivation text
4. PATCH …/days/{day}/motivation
5. Builder response returns updated days[].daily_motivation
6. When plan is activated, client sees today’s text on home overview
```

For an **active** plan: create a revision → edit motivation on the draft → activate revision (same as notes / section edits).

---

## Endpoint

```http
PATCH /v1/web/admin/care-plans/{care_plan}/days/{day}/motivation
Content-Type: application/json
Authorization: Bearer {token}
```

### Path params

| Param | Description |
|-------|-------------|
| `care_plan` | Care plan id |
| `day` | Care plan day id (`days[].id` from builder) |

### Request body

```json
{ "daily_motivation": "Small steps today build lasting strength." }
```

| Field | Rules |
|-------|--------|
| `daily_motivation` | `nullable` string, max `5000` chars |

Clear:

```json
{ "daily_motivation": null }
```

### Success (`200`)

Returns the full care plan **builder** resource (same shape as notes update), including:

```json
{
  "data": {
    "days": [
      {
        "id": 41,
        "day_number": 1,
        "target_date": "2026-05-01",
        "general_notes": "Optional admin note",
        "daily_motivation": "Small steps today build lasting strength.",
        "sections": { "...": "..." }
      }
    ]
  }
}
```

Message: `Care plan day motivation updated successfully.`

---

## Builder / list day shape

`GET /v1/web/admin/care-plans/{care_plan}/builder` (and any response that returns the builder resource) now includes:

```json
{
  "id": 41,
  "day_number": 1,
  "target_date": "2026-05-01",
  "general_notes": null,
  "daily_motivation": "Stay consistent and hydrate well today.",
  "sections": {}
}
```

Show a **Daily motivation** textarea next to (but separate from) **Day notes**.

---

## Comparison with day notes

| | Day notes | Daily motivation |
|--|-----------|------------------|
| Endpoint | `PATCH …/days/{day}/notes` | `PATCH …/days/{day}/motivation` |
| Body key | `general_notes` | `daily_motivation` |
| Editable when | Draft / scheduled | Draft / scheduled |
| Max length | 5000 | 5000 |
| Copied on revision | Yes | Yes |
| Mobile home | `enrollment_card.summary` | `today.daily_motivation` |

---

## Errors

| Status | When |
|--------|------|
| `401` | Guest / missing auth |
| `403` | Support / no permission |
| `404` | Unknown care plan or day |
| `422` | Day not on plan, plan not editable (e.g. active), or validation (`max:5000`) |

Active-plan example: same style of message as notes — plan must be draft/scheduled, or create a revision first.

---

## UI checklist (admin)

- [ ] On each builder day, add **Daily motivation** input (separate from Day notes)
- [ ] Save via `PATCH …/motivation` (debounce/blur or explicit Save)
- [ ] Allow clear (`null`)
- [ ] Disable edit on active/completed plans; route edits through revision
- [ ] Prefill from `days[].daily_motivation` when loading builder
- [ ] Do not overwrite `general_notes` when saving motivation

---

## Related mobile doc

See `mobile-home-overview-care-plan-day-motivation.md` for how the client app reads this field.
