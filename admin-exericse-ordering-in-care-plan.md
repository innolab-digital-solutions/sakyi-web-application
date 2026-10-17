# Admin — Movement exercise ordering in care plans

Frontend guide for how exercise order is saved and returned in the care-plan builder.

## What changed

Previously, after saving a movement’s exercises, the API response could return them in a random order (e.g. you sent 1 → 2 → 3, response came back 3 → 1 → 2).

The backend now **persists the array order** from your upsert payload and always returns exercises in that order.

| Detail             | Behavior                                                                    |
| ------------------ | --------------------------------------------------------------------------- |
| How order is set   | Index of each item in `items[].exercises[]` (0, 1, 2, …)                    |
| New request field? | **No** — do not send `sort_order`                                           |
| Response field?    | **No** — order is the array order itself                                    |
| Applies to         | Builder GET, section upsert response, enter/exit edit mode, revision copies |

---

## Endpoint

**PUT** `/api/v1/web/admin/care-plans/{care_plan}/days/{day}/sections/movement/items`

Same upsert as before. Order is implied by the `exercises` array.

### Request example

```json
{
    "items": [
        {
            "id": 12,
            "title": "Strength block",
            "guidance": "Complete each exercise in order.",
            "exercises": [
                {
                    "movement_exercise_id": 101,
                    "sets": 3,
                    "reps": 10,
                    "rest_seconds": 60
                },
                {
                    "movement_exercise_id": 102,
                    "sets": 3,
                    "reps": 12
                },
                {
                    "movement_exercise_id": 103,
                    "sets": 3,
                    "duration_seconds": 45,
                    "rest_seconds": 30
                }
            ]
        }
    ]
}
```

This saves order as:

1. exercise `101`
2. exercise `102`
3. exercise `103`

### Response shape (relevant part)

```json
{
    "data": {
        "days": [
            {
                "sections": {
                    "movement": [
                        {
                            "id": 12,
                            "title": "Strength block",
                            "exercises": [
                                {
                                    "id": 501,
                                    "movement_exercise_id": 101,
                                    "sets": 3,
                                    "reps": 10
                                },
                                {
                                    "id": 502,
                                    "movement_exercise_id": 102,
                                    "sets": 3,
                                    "reps": 12
                                },
                                {
                                    "id": 503,
                                    "movement_exercise_id": 103,
                                    "sets": 3,
                                    "duration_seconds": 45
                                }
                            ]
                        }
                    ]
                }
            }
        ]
    }
}
```

`exercises[0]`, `exercises[1]`, `exercises[2]` match the order you sent.

Also returned in the same ordered shape from:

- **GET** `/api/v1/web/admin/care-plans/{care_plan}/builder`
- Other builder mutations that return `CarePlanBuilderResource`

---

## Reordering in the UI

When the coach drag-and-drops or otherwise reorders exercises:

1. Update your local `exercises` array to the new order.
2. Call the same upsert with the full `exercises` list in that new order.
3. Trust the response `exercises` array order (or re-apply your local order after success).

Example: reorder to 103 → 101 → 102:

```json
{
    "items": [
        {
            "id": 12,
            "title": "Strength block",
            "exercises": [
                {
                    "movement_exercise_id": 103,
                    "sets": 3,
                    "duration_seconds": 45,
                    "rest_seconds": 30
                },
                {
                    "movement_exercise_id": 101,
                    "sets": 3,
                    "reps": 10,
                    "rest_seconds": 60
                },
                { "movement_exercise_id": 102, "sets": 3, "reps": 12 }
            ]
        }
    ]
}
```

---

## Replace semantics (unchanged)

Upsert still **fully replaces** the exercise list for that movement item:

- Exercises present in the payload → created/updated, with `sort_order` = array index
- Exercises omitted from the payload → deleted (subject to active-plan + logs rules)

So always send the complete ordered list you want to keep.

---

## Frontend checklist

1. Keep a local ordered list of exercises while editing (do not re-sort by name/id).
2. On save, send `exercises` in display order.
3. After save, render from response order — do not re-sort client-side by `id` or `movement_exercise_id`.
4. On builder load, render `sections.movement[].exercises` as received.
5. No need to read or write a `sort_order` field.

---

## Compatibility

- Existing care plans were backfilled with a stable order (by previous row id).
- Prescription fields (`sets`, `reps`, `duration_seconds`, etc.) are unchanged.
- Validation rules for movement prescriptions are unchanged.
