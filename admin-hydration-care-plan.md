# Care Plan — Hydration Section (Admin Dashboard)

Frontend guide for the new **hydration** section in the care plan builder. Hydration works exactly like **activity** — same fields, same upsert flow, same response shape.

Base API prefix: `/v1`. All admin endpoints require the admin bearer token.

---

## What changed (summary)

| Before                                                      | After                                                                            |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------- |
| 4 sections: `nutrition`, `movement`, `activity`, `recovery` | **5 sections:** `nutrition`, `movement`, `activity`, **`hydration`**, `recovery` |
| —                                                           | New `sections.hydration` array on every care plan builder response               |
| —                                                           | New upsert route segment: `section=hydration`                                    |

**No breaking changes** to existing sections. Activity, recovery, nutrition, and movement payloads are unchanged.

---

## Section order in API responses

```json
"sections": {
  "nutrition": [],
  "movement": [],
  "activity": [],
  "hydration": [],
  "recovery": []
}
```

Always render all five keys. Empty arrays mean no tasks configured for that section on that day.

---

## 1. Save hydration tasks (upsert)

Uses the **same endpoint** as other sections — only the `{section}` path segment changes.

**Request**

```
PUT /v1/web/admin/care-plans/{care_plan}/days/{day}/sections/hydration/items
Accept: application/json
Content-Type: application/json
```

**Body** (identical structure to activity)

```json
{
  "items": [
    {
      "id": 12,
      "title": "Water intake",
      "guidance": "Spread evenly through the day",
      "target_value": 2.5,
      "target_unit_id": 27,
      "meta": null
    }
  ]
}
```

| Field            | Type    | Required | Notes                                                     |
| ---------------- | ------- | -------- | --------------------------------------------------------- |
| `id`             | integer | No       | Include when updating an existing row; omit for new items |
| `title`          | string  | Yes      | Max 150 characters                                        |
| `guidance`       | string  | No       | Free-text coach notes                                     |
| `target_value`   | number  | No       | Decimal allowed (e.g. `2.5`)                              |
| `target_unit_id` | integer | No       | Must exist in `units` table (e.g. liters, ml)             |
| `meta`           | object  | No       | Optional JSON metadata                                    |

**Sync semantics** (same as activity):

- The `items` array is the **full desired set** for that day’s hydration section.
- Items in the payload but not in DB → **created**.
- Items in DB but missing from payload → **deleted**.
- Existing items with matching `id` → **updated**.

---

## 2. Response shape

Every care plan builder response now includes `hydration`:

```json
{
  "status": "success",
  "message": "Care plan day section updated successfully.",
  "data": {
    "id": 19,
    "status": "draft",
    "days": [
      {
        "id": 51,
        "day_number": 1,
        "target_date": "2026-07-12",
        "general_notes": null,
        "sections": {
          "nutrition": [
            /* unchanged */
          ],
          "movement": [
            /* unchanged */
          ],
          "activity": [
            {
              "id": 8,
              "title": "Walking",
              "guidance": null,
              "target_value": 8000,
              "target_unit_id": 15,
              "meta": null
            }
          ],
          "hydration": [
            {
              "id": 12,
              "title": "Water intake",
              "guidance": "Spread evenly through the day",
              "target_value": 2.5,
              "target_unit_id": 27,
              "meta": null
            }
          ],
          "recovery": [
            /* unchanged */
          ]
        }
      }
    ]
  },
  "meta": { "version": "v1" }
}
```

Each hydration item has the **same columns as activity**:

| Field            | Description                                                  |
| ---------------- | ------------------------------------------------------------ |
| `id`             | Row id — use as `item_id` reference in logs/report workspace |
| `title`          | Task title shown to client                                   |
| `guidance`       | Optional coach guidance                                      |
| `target_value`   | Numeric goal (integer when whole, decimal when fractional)   |
| `target_unit_id` | FK to units — resolve name/abbreviation via units lookup     |
| `meta`           | Optional JSON blob                                           |

---

## 3. Endpoints that return hydration

All existing care plan builder endpoints now include `sections.hydration`:

| Method  | Endpoint                                                                   |
| ------- | -------------------------------------------------------------------------- |
| `GET`   | `/v1/web/admin/care-plans/{care_plan}/builder`                             |
| `PUT`   | `/v1/web/admin/care-plans/{care_plan}/days/{day}/sections/hydration/items` |
| `PATCH` | `/v1/web/admin/care-plans/{care_plan}/days/{day}/notes`                    |
| `POST`  | `/v1/web/admin/care-plans/{care_plan}/days/generate`                       |

---

## 4. Report workspace & logs

**Report workspace evidence** — hydration tasks appear in the merged `items` array with:

```json
{
  "section": "hydration",
  "morph": "hydration",
  "item_id": 12,
  "title": "Water intake",
  "guidance": "Spread evenly through the day",
  "target": { "value": 2.5, "unit": "L", "unit_id": 27 },
  "log": {
    /* client log if exists */
  }
}
```

**Suggested metrics** — hydration tasks with the same title across days are rolled up (like activity), with metric keys like `hydration_water_intake`.

**Care plan log entries** — client logs for hydration tasks return `"section": "hydration"`.

---

## 5. Activation validation

A care plan day still needs **at least one item** in any section before activation. Hydration counts toward that requirement:

> "Day N needs at least one item (nutrition, movement, activity, hydration, or recovery) before you can activate the plan."

---

## 6. UI checklist (admin)

- [ ] Add **Hydration** tab/section in the day builder (mirror Activity UI)
- [ ] Use `PUT …/sections/hydration/items` for save
- [ ] Parse `sections.hydration[]` from builder/upsert responses
- [ ] Reuse the same form fields as Activity: title, guidance, target value, unit picker
- [ ] Use `GET /v1/lookup/units` for the unit dropdown (volume units like L, ml)
- [ ] Handle empty `hydration: []` — show empty state, not hidden section

---

## 7. Comparison: hydration vs activity

|                        | Activity                                            | Hydration            |
| ---------------------- | --------------------------------------------------- | -------------------- |
| Upsert section         | `activity`                                          | `hydration`          |
| Response key           | `sections.activity`                                 | `sections.hydration` |
| Fields                 | title, guidance, target_value, target_unit_id, meta | **Same**             |
| Library linking        | None                                                | None                 |
| Client logging section | `"activity"`                                        | `"hydration"`        |

The only difference is the section name — implementation is identical.
