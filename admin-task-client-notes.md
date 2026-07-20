# Admin Care Plan — Sticky Task Notes in Report Workspace

Guide for the admin dashboard: clients can leave a **sticky note per task** (separate from daily logs). Admins see these notes **only in report workspace evidence**.

Base API prefix: `/v1/web/admin`. Requires admin bearer token.

---

## What changed

| Area | Change |
|------|--------|
| Report workspace evidence items | New optional `client_note` object on each evidence item |
| Care plan builder / log entries list | **No change** (out of scope) |
| Progress / logged-task counts | **No change** — notes never count as logs |

---

## Report workspace evidence shape

`GET /v1/web/admin/care-plans/{care_plan}/report-workspace`

Each day in `data.evidence[]` has `items[]`. Each item now includes:

```json
{
  "section": "nutrition",
  "morph": "nutrition",
  "item_id": 65,
  "title": "Breakfast",
  "guidance": null,
  "target": { "value": 500, "unit": "kcal", "unit_id": 10 },
  "log": null,
  "client_note": {
    "id": 1,
    "body": "Skipped breakfast due to travel",
    "updated_at": "2026-07-20T10:00:00.000000Z"
  }
}
```

| Field | Description |
|-------|-------------|
| `client_note` | Sticky note from the enrolled client for this task, or `null` |
| `client_note.id` | Note row id |
| `client_note.body` | Message text |
| `client_note.updated_at` | ISO timestamp of last upsert |
| `log` | Unchanged — daily progress log (may still be `null` when only a note exists) |

A task can have:

- only `client_note` (skipped / explained, no log)
- only `log` (completed without a sticky note)
- both
- neither

---

## UI checklist (admin)

- [ ] In report workspace evidence, show `client_note.body` when present (e.g. “Client note”)
- [ ] Do not treat `client_note` as task completion / adherence
- [ ] Keep display separate from `log.notes` (log notes are part of a progress log entry)

---

## Not available on

- Care plan builder payload
- Care plan log entries list (`care-plan-logs.entries`)
- Care plan logs dashboard

Those surfaces remain unchanged by design.
