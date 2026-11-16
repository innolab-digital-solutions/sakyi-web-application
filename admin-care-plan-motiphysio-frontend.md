# Admin web — Motiphysio care-plan section

Audience: **admin dashboard** developers only.

This guide is enough to implement Motiphysio in the care-plan builder, operational logs, and period-report workspace without reading backend source.

---

## What changed in the backend

- New care-plan day section: `motiphysio` (sibling of `movement`, `nutrition`, `activity`, etc.).
- Motiphysio day tasks store nested **exercise prescriptions** the same way movement does.
- Exercise catalog is **not** new. Motiphysio reuses the existing `movement_exercises` library (categories, equipment, lookup APIs, admin CRUD).
- There is **no** Motiphysio-specific library endpoint, seeder, or catalog UI to build.
- Period report synthesis adds a **separate** burn metric: `estimated_motiphysio_energy_burn` (`section: motiphysio`). Movement burn remains `estimated_energy_burn`.

---

## Product / domain logic

Treat Motiphysio like Movement in the builder:

| Concern             | Behavior                                                                                                        |
| ------------------- | --------------------------------------------------------------------------------------------------------------- |
| Day item shape      | `title`, optional `guidance`, optional `meta`, nested `exercises[]`                                             |
| Exercise link       | `movement_exercise_id` → shared movement library                                                                |
| Prescription fields | `sets`, `reps`, `rest_seconds`, `duration_seconds`, `intensity`, `equipment_weight`, `equipment_weight_unit_id` |
| Order               | Array order is the coach sequence; backend stores contiguous `sort_order`                                       |
| Activation          | A day needs **at least one task in any section** (motiphysio counts)                                            |
| Measured targets    | Motiphysio has **no** `target_value` / `target_unit_id` (unlike hydration/activity)                             |
| Active-plan edits   | Same rules as movement: cannot strip exercises from a logged item while active without edit mode                |

How it differs from other sections:

- **Nutrition** — library food items + optional `eating_window`; not exercise prescriptions.
- **Hydration / sleep / recovery / walking / activity** — measured targets (`target_value` + unit).
- **Movement** — same UX as Motiphysio, but different section key and separate report burn metric.

---

## APIs to call

Base prefix: `/v1/web/admin` (auth + admin ability required).

### 1. Care plan builder show

`GET /v1/web/admin/care-plans/{care_plan}/builder`  
Named route: `v1.web.admin.care-plans.builder`

Response includes each day under `data.days[]`, with:

```json
"sections": {
  "nutrition": [],
  "movement": [],
  "motiphysio": [ /* new */ ],
  "activity": [],
  "hydration": [],
  "sleep": [],
  "recovery": [],
  "walking": []
}
```

Render a **Motiphysio** tab/section next to Movement. Do not fold Motiphysio into Movement.

### 2. Upsert Motiphysio day items

`PUT /v1/web/admin/care-plans/{care_plan}/days/{day}/sections/motiphysio/items`  
Named route: `v1.web.admin.care-plans.sections.items.upsert`  
Path param `section` = `motiphysio`.

Payload (same shape as movement):

```json
{
  "items": [
    {
      "id": 12,
      "title": "Mobility flow",
      "guidance": "Slow controlled reps",
      "meta": null,
      "exercises": [
        {
          "movement_exercise_id": 45,
          "sets": 3,
          "reps": 10,
          "rest_seconds": 60,
          "duration_seconds": null,
          "intensity": null,
          "equipment_weight": 8,
          "equipment_weight_unit_id": 3
        }
      ]
    }
  ]
}
```

Rules:

- `items` must be **present** (use `[]` to clear the section).
- Blank unsaved draft rows without `id`/title are dropped by the backend.
- Existing rows keep `id` on update; omit `id` to create.
- Omitting an exercise from `exercises[]` deletes that prescription (blocked on active plans that already have logs).
- Reordering = send the new array order; response `exercises` and DB `sort_order` follow payload order.

Success returns the full builder payload (including `sections.motiphysio`).

### 3. Exercise library pickers (reuse movement APIs)

Use the **existing** movement library surfaces. Do **not** invent Motiphysio catalog routes.

Admin CRUD (if the builder opens the full library manager):

| Resource   | Prefix                              |
| ---------- | ----------------------------------- |
| Categories | `/v1/web/admin/movement-categories` |
| Equipment  | `/v1/web/admin/movement-equipment`  |
| Exercises  | `/v1/web/admin/movement-exercises`  |

Lookup (read-only pickers / prescription metadata):

| Endpoint                                           | Named route                                         |
| -------------------------------------------------- | --------------------------------------------------- |
| `GET /v1/lookup/movement-categories`               | `v1.lookup.movement-categories.index`               |
| `GET /v1/lookup/movement-equipment`                | `v1.lookup.movement-equipment.index`                |
| `GET /v1/lookup/movement-exercises`                | `v1.lookup.movement-exercises.index`                |
| `GET /v1/lookup/movement-prescription-profiles`    | `v1.lookup.movement-prescription-profiles.index`    |
| `GET /v1/lookup/movement-prescription-intensities` | `v1.lookup.movement-prescription-intensities.index` |

When attaching an exercise to a Motiphysio task, send that exercise’s `id` as `movement_exercise_id`.

### 4. Operational log entries

`GET /v1/web/admin/care-plan-logs/{carePlan}/entries`  
Named route: `v1.web.admin.care-plan-logs.entries`

Motiphysio client logs appear with:

- `section`: `"motiphysio"`
- Morph type conceptually `motiphysio` (same pattern as movement rows)

UI should label the section **Motiphysio**, not Movement.

### 5. Period report / report workspace

When the workspace synthesizes suggested metrics and the plan has Motiphysio tasks:

| Metric key                         | Section      | Label                            |
| ---------------------------------- | ------------ | -------------------------------- |
| `estimated_motiphysio_energy_burn` | `motiphysio` | Estimated Motiphysio Energy Burn |
| `estimated_energy_burn`            | `movement`   | Estimated Movement Energy Burn   |

Notes:

- Values come from parent Motiphysio **item logs** `actual_value` (kcal-style burn), summed across the report period.
- Movement and Motiphysio burns are **never merged**.
- Default highlights may include `avg_motiphysio_burn` derived from `estimated_motiphysio_energy_burn` (parallel to `avg_burn` for movement).
- Including Motiphysio burn in the client report uses the same `included_metric_keys` / highlight flow as other metrics.

Evidence days also include Motiphysio items (`section: "motiphysio"`, `morph: "motiphysio"`).

---

## Resources / JSON shapes

### Builder / upsert item

```json
{
  "id": 12,
  "title": "Mobility flow",
  "guidance": "Slow controlled reps",
  "meta": null,
  "exercises": [
    {
      "id": 88,
      "movement_exercise_id": 45,
      "sort_order": 0,
      "sets": 3,
      "reps": 10,
      "rest_seconds": 60,
      "duration_seconds": null,
      "duration_preview": null,
      "rest_preview": { "minutes": 1, "seconds": 0, "label": "1 min" },
      "intensity": null,
      "equipment_weight": 8,
      "equipment_weight_unit_id": 3,
      "equipment_weight_unit": {
        "id": 3,
        "name": "Kilogram",
        "abbreviation": "kg"
      },
      "summary": "3 × 10 reps, 8 kg, 1 min rest"
    }
  ]
}
```

Fields the UI must render/edit:

- Task: title (required), guidance, meta (optional)
- Each exercise: library picker (`movement_exercise_id`), prescription fields driven by the library exercise’s `prescription_profile`, drag/reorder, remove

There is no target value column on Motiphysio rows.

---

## Admin UI checklist

- [ ] Builder section tab / column labeled **Motiphysio** (separate from Movement)
- [ ] Upsert uses `sections/motiphysio/items` with the movement-style payload
- [ ] Reorder exercises and persist via full `exercises[]` replace
- [ ] Empty day: allow saving `items: []`
- [ ] Exercise picker wired to **existing** movement lookup/CRUD
- [ ] Operational log entry list shows Motiphysio section label
- [ ] Report workspace metric card for `estimated_motiphysio_energy_burn`
- [ ] Do not combine Motiphysio burn into movement’s `estimated_energy_burn` card

---

## What not to do

- Do **not** invent Motiphysio library endpoints (`motiphysio-exercises`, categories, etc.).
- Do **not** treat Motiphysio as a measured target section like hydration (no `target_value` UX).
- Do **not** reuse Movement section upsert (`…/sections/movement/items`) for Motiphysio rows.
- Do **not** migrate historical movement rows into Motiphysio automatically.
- Do **not** hide Motiphysio inside the Movement tab.
