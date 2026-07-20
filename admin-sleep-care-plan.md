# Care Plan — Sleep Section (Admin Dashboard)

Frontend guide for the new **sleep** section in the care plan builder. Sleep works exactly like **hydration** and **activity** — same fields, same upsert flow, same response shape.

Base API prefix: `/v1`. All admin endpoints require the admin bearer token.

---

## What changed (summary)

| Before | After |
|--------|-------|
| 5 sections: `nutrition`, `movement`, `activity`, `hydration`, `recovery` | **6 sections:** `nutrition`, `movement`, `activity`, `hydration`, **`sleep`**, `recovery` |
| — | New `sections.sleep` array on every care plan builder response |
| — | New upsert route segment: `section=sleep` |

**No breaking changes** to existing sections. All prior section payloads are unchanged.

---

## Section order in API responses

```json
"sections": {
  "nutrition": [],
  "movement": [],
  "activity": [],
  "hydration": [],
  "sleep": [],
  "recovery": []
}
```

Always render all six keys. Empty arrays mean no tasks configured for that section on that day.

---

## 1. Save sleep tasks (upsert)

Uses the **same endpoint** as other sections — only the `{section}` path segment changes.

**Request**

```
PUT /v1/web/admin/care-plans/{care_plan}/days/{day}/sections/sleep/items
Accept: application/json
Content-Type: application/json
```

**Body** (identical structure to activity/hydration)

```json
{
  "items": [
    {
      "id": 14,
      "title": "Night sleep",
      "guidance": "Aim for consistent bedtime",
      "target_value": 8,
      "target_unit_id": 30,
      "meta": null
    }
  ]
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | integer | No | Include when updating an existing row; omit for new items |
| `title` | string | Yes | Max 150 characters |
| `guidance` | string | No | Free-text coach notes |
| `target_value` | number | No | Decimal allowed (e.g. `7.5`) |
| `target_unit_id` | integer | No | Must exist in `units` table (e.g. hours) |
| `meta` | object | No | Optional JSON metadata |

**Sync semantics** (same as activity/hydration):
- The `items` array is the **full desired set** for that day's sleep section.
- Items in the payload but not in DB → **created**.
- Items in DB but missing from payload → **deleted**.
- Existing items with matching `id` → **updated**.

---

## 2. Response shape

Every care plan builder response now includes `sleep`:

```json
{
  "status": "success",
  "message": "Care plan day section updated successfully.",
  "data": {
    "days": [
      {
        "sections": {
          "nutrition": [],
          "movement": [],
          "activity": [],
          "hydration": [],
          "sleep": [
            {
              "id": 14,
              "title": "Night sleep",
              "guidance": "Aim for consistent bedtime",
              "target_value": 8,
              "target_unit_id": 30,
              "meta": null
            }
          ],
          "recovery": []
        }
      }
    ]
  }
}
```

Each sleep item has the **same columns as activity/hydration**:

| Field | Description |
|-------|-------------|
| `id` | Row id — use as `item_id` reference in logs/report workspace |
| `title` | Task title shown to client |
| `guidance` | Optional coach guidance |
| `target_value` | Numeric goal (integer when whole, decimal when fractional) |
| `target_unit_id` | FK to units — resolve name/abbreviation via units lookup |
| `meta` | Optional JSON blob |

---

## 3. Endpoints that return sleep

| Method | Endpoint |
|--------|----------|
| `GET` | `/v1/web/admin/care-plans/{care_plan}/builder` |
| `PUT` | `/v1/web/admin/care-plans/{care_plan}/days/{day}/sections/sleep/items` |
| `PATCH` | `/v1/web/admin/care-plans/{care_plan}/days/{day}/notes` |
| `POST` | `/v1/web/admin/care-plans/{care_plan}/days/generate` |

---

## 4. Report workspace & logs

**Report workspace evidence** — sleep tasks appear in the merged `items` array with:

```json
{
  "section": "sleep",
  "morph": "sleep",
  "item_id": 14,
  "title": "Night sleep",
  "guidance": "Aim for consistent bedtime",
  "target": { "value": 8, "unit": "h", "unit_id": 30 },
  "log": { /* client log if exists */ }
}
```

**Suggested metrics** — sleep tasks with the same title across days are rolled up (like activity/hydration), with metric keys like `sleep_night_sleep`.

**Care plan log entries** — client logs for sleep tasks return `"section": "sleep"`.

---

## 5. Activation validation

A care plan day still needs **at least one item** in any section before activation. Sleep counts toward that requirement:

> "Day N needs at least one item (nutrition, movement, activity, hydration, sleep, or recovery) before you can activate the plan."

---

## 6. UI checklist (admin)

- [ ] Add **Sleep** tab/section in the day builder (mirror Activity/Hydration UI)
- [ ] Use `PUT …/sections/sleep/items` for save
- [ ] Parse `sections.sleep[]` from builder/upsert responses
- [ ] Reuse the same form fields as Activity: title, guidance, target value, unit picker
- [ ] Use `GET /v1/lookup/units` for the unit dropdown (time units like hours)
- [ ] Handle empty `sleep: []` — show empty state, not hidden section

---

## 7. Comparison: sleep vs hydration

| | Hydration | Sleep |
|---|-----------|-------|
| Upsert section | `hydration` | `sleep` |
| Response key | `sections.hydration` | `sections.sleep` |
| Fields | title, guidance, target_value, target_unit_id, meta | **Same** |
| Library linking | None | None |
| Client logging section | `"hydration"` | `"sleep"` |

The only difference is the section name — implementation is identical.
