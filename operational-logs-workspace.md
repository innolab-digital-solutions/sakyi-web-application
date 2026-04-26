# Report workspace (admin) — simple flow

1. **Create an operational log** for the care plan: `POST …/operational-logs/draft` (empty worksheet) or `POST …/operational-logs` with at least one metric.
2. **Open the workspace:** `GET …/care-plans/{care_plan}/report-workspace` — **no query parameters**. The API uses that care plan’s **single** operational log and its period.
3. **Response:** `evidence` (what the client logged vs targets) and `suggested_metrics` on the left for context; `operational_log` (draft / in progress figures) on the right — update with `PUT …/operational-logs/{operational_log}`.
4. If there is **no** operational log yet, the workspace returns **422** with a message to create the draft first.

`client_report` / `report_run` appear when a client report already exists (e.g. after submit for review).
