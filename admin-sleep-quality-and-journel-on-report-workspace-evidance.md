# Admin: Sleep Quality + Journal on Report Workspace Evidence

This guide explains how **sleep quality** and **day-level Journal** appear in the admin care-plan **report workspace evidence** payload, and what the admin frontend should render.

---

## Summary

| Data                                | Where in evidence                     | UI placement                                              |
| ----------------------------------- | ------------------------------------- | --------------------------------------------------------- |
| Sleep hours (`log.actual_value`)    | Sleep item under `evidence[].items[]` | Existing sleep task evidence                              |
| Sleep quality (`log.sleep_quality`) | Same sleep item `log`                 | On the sleep task evidence row/card                       |
| Journal                             | `evidence[].journal` (day-level)      | Own day section, **like photos** — **not** under Recovery |

Endpoint (unchanged):

`GET /api/v1/web/admin/care-plans/{care_plan}/report-workspace`

Named route: `v1.web.admin.care-plans.report-workspace`

Requires an operational log for the period (same as today).

---

## Evidence day shape (new / changed fields)

Each entry in `data.evidence[]`:

```json
{
  "day_index": 1,
  "day_number": 1,
  "target_date": "2026-05-01",
  "photos": [
    {
      "id": 1,
      "url": "...",
      "mime_type": "image/jpeg",
      "original_name": "result.jpg",
      "created_at": "..."
    }
  ],
  "journal": {
    "id": 10,
    "body": "Grateful for supportive coaching.",
    "updated_at": "..."
  },
  "items": [
    {
      "section": "sleep",
      "morph": "sleep",
      "item_id": 5,
      "title": "Night sleep",
      "guidance": null,
      "target": { "value": 8, "unit": "h", "unit_id": 3 },
      "log": {
        "id": 99,
        "is_completed": true,
        "actual_value": 7.5,
        "unit": "h",
        "notes": null,
        "meta": { "sleep_quality": "good" },
        "sleep_quality": "good",
        "media": []
      },
      "client_note": null
    }
  ]
}
```

### `journal`

- Object or `null`.
- Day-level gratitude text for the enrolled client (one per day).
- Prompt used on mobile: **“What's your biggest gratitude today?”** / MY: **“ဒီနေ့ သင့်အတွက် ကျေးဇူးတင်ရဆုံး အကြောင်းအရာ တစ်ခု”**
- Render as its own evidence block next to **photos** (e.g. heading “Journal”), not nested under Recovery or Sleep items.

### `log.sleep_quality` (sleep items)

- String enum or `null`:
  - `very_good`
  - `good`
  - `poor`
  - `very_poor`
- Prefer `log.sleep_quality` over digging into `log.meta`.
- Display alongside sleep hours / completion. Quality is optional and does **not** redefine completion (`is_completed` still reflects hours evidence).

### Display labels (admin-owned copy)

| Value       | EN                                                                                | MY                                                                                               |
| ----------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `very_good` | Very good — Slept well through the night and woke up feeling refreshed            | အလွန်ကောင်း — ကောင်းကောင်းအိပ်ပျော်ခဲ့ပြီး မနက်နိုးလာချိန်မှာ လန်းဆန်းတယ်                        |
| `good`      | Good — Slept fairly well, with only minor sleep problems, and felt mostly rested  | ကောင်း — အနည်းငယ် အိပ်ရေးပျက်တာရှိပေမယ့် အတော်အသင့် ကောင်းကောင်းအိပ်ပျော်ပြီး အနားရတယ်။          |
| `poor`      | Poor — Had trouble sleeping or woke up several times and did not feel well-rested | မကောင်း — အိပ်ပျော်ဖို့ခက်တာ၊ ညဘက် မကြာခဏနိုးတာတွေရှိပြီး အိပ်ရေးမဝဘူး။                          |
| `very_poor` | Very poor — Had major difficulty sleeping and woke up feeling very tired.         | အလွန်မကောင်း — အိပ်ပျော်ဖို့ အရမ်းခက်ခဲခဲ့ပြီး အိပ်ရေးမဝသလို မနက်နိုးလာချိန်မှာ အရမ်းပင်ပန်းတယ်။ |

Backend does not return localized labels or emoji. Admin UI should map the enum value to label/description (and optional icon).

---

## Frontend checklist

1. On report workspace evidence days, read `journal` next to `photos`.
2. If `journal` is non-null, show body text under a **Journal** heading (day-level).
3. For items where `section === "sleep"` / `morph === "sleep"`, show `log.sleep_quality` when present (with hours).
4. Treat missing quality as “not logged” — do not invent a default.
5. Do not place Journal under Recovery task evidence.
6. No new admin write APIs for these fields in this release (client-entered via mobile only).

---

## What did not change

- Operational log draft / publish flow
- Suggested metrics synthesis (journal and sleep quality are evidence-only)
- Care plan builder sections
- Auth / gate on report workspace
