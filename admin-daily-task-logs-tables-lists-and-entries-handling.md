# Admin Daily Task Logs

This document explains how frontend should implement the **Admin Daily Task Logs** module:

- Care plan logs list page (overview table)
- Care plan logs detail page (entries table/timeline)
- Required API calls
- Request query parameters
- Response payloads
- Recommended UI/UX logic and behaviors

---

## 1) Purpose

The Daily Task Logs area gives admins/doctors a quick operational view of:

- Which active care plans are receiving logs
- How recently clients submitted logs
- How far each plan has progressed in its time window
- Detailed raw log entries per care plan (for analysis and report preparation)

This module is for **monitoring and review** (not report authoring itself).

---

## 2) Pages and flow

### A. Logs List Page (Overview)

Use this as the first screen in the Daily Task Logs menu.

Each row represents one **active care plan** with:

- Care plan identity (id, code, status, date range)
- Client and program context (via enrollment relation)
- Last logged timestamp
- Days count
- Completion signal (progress + recency)

### B. Logs Detail Page (Entries)

From a selected row, open detail for that care plan:

- Top summary card (basic care plan info + completion signal)
- Log entries table (or timeline) with filters
- Show target vs actual values, section, notes, and media

---

## 3) API endpoints

All endpoints are under admin auth and require Sanctum token.

## 3.1 List care plan logs (overview table)

`GET /api/v1/web/admin/care-plan-logs`

### Query params

- `search` (optional, string)
- `per_page` (optional, int, default backend behavior currently 10)
- `page` (optional, int)

### Recommended frontend usage

- Use on initial page load
- Use debounced search
- Persist pagination state in URL query

---

## 3.2 Show single care plan log summary

`GET /api/v1/web/admin/care-plan-logs/{carePlan}`

### Purpose

Use this for detail page header/summary info before (or alongside) entries fetch.

---

## 3.3 List care plan log entries (detail table/timeline)

`GET /api/v1/web/admin/care-plan-logs/{carePlan}/entries`

### Query params

- `section` (optional): one of  
  `nutrition | movement | activity | recovery`
- `is_completed` (optional, boolean)
- `date_from` (optional, date `YYYY-MM-DD`)
- `date_to` (optional, date `YYYY-MM-DD`, must be >= `date_from`)
- `search` (optional, string; matches notes/title)
- `per_page` (optional, int; min 1, max 100; default 20)
- `page` (optional, int)

### Recommended frontend usage

- Use for entries table and filter chips
- Reset `page=1` when filters change
- Keep filters in URL query for shareable views

---

## 4) Response envelope pattern

All success responses follow this shape:

```json
{
  "status": "success",
  "message": "....",
  "data": [],
  "meta": {
    "version": "v1",
    "pagination": {
      "current_page": 1,
      "per_page": 20,
      "total": 42,
      "last_page": 3,
      "from": 1,
      "to": 20,
      "has_more_pages": true,
      "path": "....",
      "next_page_url": "....",
      "prev_page_url": null
    }
  }
}
```

> Notes:
> - Non-paginated endpoints may not include `meta.pagination`.
> - Always read `status` + `message` + `data`.

---

## 5) Logs list data shape (`care-plan-logs.index`)

Each row in `data[]` (summary):

```json
{
  "id": 120,
  "code": "CP-2026-00012",
  "status": "active",
  "starts_on": "2026-10-10",
  "ends_on": "2026-10-17",
  "last_logged_at": "2026-10-12T08:20:00.000000Z",
  "days_count": 7,
  "completion_signal": {
    "window_days_total": 7,
    "window_elapsed_days": 3,
    "window_progress_percentage": 43,
    "is_logging_recent": true
  },
  "enrollment": {
    "id": 90,
    "status": "active",
    "client": {
      "id": 34,
      "name": "Client Name"
    },
    "program": {
      "id": 6,
      "name": "Fat Loss"
    }
  }
}
```

### Completion signal logic (frontend interpretation)

- `window_days_total`: total plan days
- `window_elapsed_days`: elapsed days from plan start until today (bounded by plan end)
- `window_progress_percentage`: elapsed/total progress indicator
- `is_logging_recent`: true when `last_logged_at` is within recent threshold (current backend: last 24h)

### Recommended badges/indicators

- Green: `is_logging_recent = true`
- Amber: no recent log but plan still active window
- Red: stale/no logs with significant elapsed progress

---

## 6) Entries data shape (`care-plan-logs.entries`)

Each row in `data[]`:

```json
{
  "id": 8841,
  "logged_at": "2026-10-12T08:20:00.000000Z",
  "is_completed": true,
  "section": "nutrition",
  "item_title": "Drink water",
  "day_number": 1,
  "target_date": "2026-10-10",
  "target": {
    "value": 8,
    "unit": "glass"
  },
  "actual": {
    "value": 7,
    "unit": "glass"
  },
  "notes": "almost done",
  "meta": null,
  "media_count": 1,
  "media": [
    {
      "id": 123,
      "url": "https://....",
      "original_name": "water.jpg"
    }
  ]
}
```

### Section-specific behavior

- `movement` may have `target.value` null (depends on item design)
- `nutrition`, `activity`, `recovery` commonly include target values/units
- Always safely handle nulls for `target` and `actual` fields

---

## 7) Frontend implementation guide

## 7.1 Overview table columns (recommended)

- Client
- Program
- Care Plan Code
- Plan Window (`starts_on - ends_on`)
- Last Logged At
- Progress (`completion_signal.window_progress_percentage`)
- Recency status (`completion_signal.is_logging_recent`)
- Action: View Logs

---

## 7.2 Detail entries table columns (recommended)

- Logged At
- Day / Date (`day_number`, `target_date`)
- Section
- Item Title
- Target (value + unit)
- Actual (value + unit)
- Completed (yes/no)
- Notes (truncated with expand)
- Media count
- Action: View media drawer/lightbox

---

## 7.3 Filters (recommended order)

1. Section tabs/chips (`all`, nutrition, movement, activity, recovery)
2. Date range (`date_from`, `date_to`)
3. Completion filter (`all/completed/incomplete`)
4. Search (`title/notes`)

---

## 7.4 Pagination strategy

- Server-side pagination only
- Use backend pagination fields from `meta.pagination`
- Keep `page` and `per_page` in URL

---

## 7.5 Empty states

- List empty: “No active care plans found”
- Entries empty: “No logs match current filters”
- Add “Clear filters” CTA for entries empty state

---

## 7.6 Error handling

- `404` on detail/entries: care plan not active or not found
- `403`: user role lacks permission
- `422`: invalid filter params (date range, invalid section, etc.)

Show backend `message` directly where appropriate.

---

## 8) Suggested integration sequence

1. Build list page with `GET care-plan-logs`
2. Add row click routing to detail page by `carePlan` id
3. Build detail header using `GET care-plan-logs/{carePlan}`
4. Build entries table using `GET care-plan-logs/{carePlan}/entries`
5. Add filters and URL-synced query state
6. Add media preview interaction

---

## 9) Practical notes for frontend devs

- Keep date display localized in UI, but send query dates as `YYYY-MM-DD`.
- Keep raw API values in state; derive display values in view layer.
- Do not assume every entry has media/target/actual.
- For `is_completed`, treat missing value as false-safe behavior.
- Always use `id` keys from backend for table rows.

---

## 10) Summary

For Daily Task Logs:

- Use `care-plan-logs` endpoints for **overview**
- Use `/entries` endpoint for **raw daily log details**
- Use `completion_signal` to provide fast operational insight
- Keep filtering/pagination server-driven and URL-synced

This gives admins a clean monitoring workflow and prepares data context for operational logs and report generation.
