# Notification types reference

This document describes every in-app notification the Sakyi backend persists for **mobile clients** and **admin users**, when each one is sent, how it is delivered, and how frontends should use `action_url` for deep linking.

Last updated from codebase audit: May 2026.

---

## 1. Overview

| Audience | Delivery | Push |
|----------|----------|------|
| **Mobile client** | `database` + `broadcast` (+ Expo push when tokens exist) | Yes, via `ClientExpoPushDispatcher` |
| **Admin** | `database` + `broadcast` | No (in-app / websocket only) |

All in-app rows are stored in Laravel’s `notifications` table (`DatabaseNotification` model). The API exposes them through shared controllers and `NotificationResource`.

**Not covered here (separate channels):**

- `QueueablePasswordReset` — email with reset link (`mail` channel)
- `QueueableVerifyEmail` — email verification (`mail` channel)

---

## 2. Architecture

### 2.1 Data shapes (database vs realtime event)

The **inner notification payload** is defined by each notification class `toArray()` method and is used in both places:

- persisted to the database `notifications.data` column
- included in realtime broadcast events as the event `data` field

Shared payload shape (`toArray()`):

| Field | Type | Description |
|-------|------|-------------|
| `type` | string | Stable machine identifier (e.g. `care_plan.activated`). Use for routing and analytics. |
| `title` | string | Short heading. Client templates often store a **lang key** (e.g. `notifications.care_plan_activated.title`); admin templates usually store **plain English**. |
| `message` | string | Body text or lang key (same rules as `title`). |
| `action_url` | string \| null | Deep link path for the target app (see §3). |
| `meta` | object | IDs and context for the UI (not sent on Expo push as nested JSON — see §2.3). |

Database inbox API shape (`NotificationResource`):

```json
{
  "id": "uuid",
  "type": "App\\Notifications\\CarePlanActivatedNotification",
  "read_at": null,
  "created_at": "2026-05-21T12:00:00.000000Z",
  "data": {
    "type": "care_plan.activated",
    "title": "notifications.care_plan_activated.title",
    "message": "notifications.care_plan_activated.message",
    "action_url": "/(app)/(tabs)/today",
    "meta": { "care_plan_id": 6 }
  }
}
```

Realtime event shape (`broadcast` channel):

```json
{
  "id": "notification-uuid",
  "type": "App\\Notifications\\CarePlanActivatedNotification",
  "data": {
    "type": "care_plan.activated",
    "title": "notifications.care_plan_activated.title",
    "message": "notifications.care_plan_activated.message",
    "action_url": "/(app)/(tabs)/today",
    "meta": { "care_plan_id": 6 }
  }
}
```

So yes, they are not the same **top-level** shape: inbox API wraps/normalizes fields via `NotificationResource`, while realtime delivers Laravel broadcast event metadata plus the payload in `data`.

### 2.2 Event-driven vs scheduled

| Mechanism | Examples |
|-----------|----------|
| **Domain events** (`EventServiceProvider`) | Enrollment activated, care plan published, contract signed, etc. |
| **Artisan schedules** (`routes/console.php`) | Daily log reminders (clients), care-plan action reminders (admins) |

Most client listeners implement `ShouldQueue` and run asynchronously. Admin enrollment listeners and contract-assignment / onboarding listeners run **synchronously** unless the notification class itself implements `ShouldQueue`.

### 2.3 Mobile Expo push

Flow (`ClientExpoPushDispatcher`):

1. Persist notification with `notifyNow()` (database row first).
2. If the client has active Expo tokens, queue `SendExpoPushNotificationJob`.
3. Push `data` is built by `ExpoPushNotificationDataBuilder`:
   - Includes `notification_id`, `id` (inbox UUID), `type`, allowlisted `action_url`, and `meta` as a **JSON string**.
   - `action_url` must start with `/(app)/` or `/(onboarding)/` or it is **stripped** from push data (security).
4. Push title/body come from `toPushPayload()` (translated via `TranslatesPushForUser` + `lang/en/notifications.php`).

Copy for mobile lives in `lang/en/notifications.php` (and future locale files). The database row may still contain lang keys in `title` / `message`; the mobile app should resolve keys using the user’s locale when displaying the inbox.

### 2.4 Admin deep links

Admin `action_url` values are **admin SPA routes** (not API paths), for example:

- `/admin/enrollment-requests/4`
- `/admin/period-reports/3`
- `/admin/care-plan-logs/6`

They are stored as-is on the notification (no Expo allowlist). The admin web app is responsible for parsing the path and opening the correct screen.

### 2.5 Deduplication

| Notification | Dedup rule |
|--------------|------------|
| `CarePlanDailyLogReminderNotification` | At most **one per client per care plan per calendar day** (`data.meta.care_plan_id` + `created_at` date). |
| `AdminCarePlanActionReminderNotification` | At most **one per admin per calendar day** per `data.type` + `data.meta.entity_key` (see `AdminReminderNotifier`). |

Other types are sent on every qualifying event (no automatic dedup).

### 2.6 Retention (pruning)

Scheduled: `notifications:prune-database` daily at **01:45** (app timezone).

Config: `config/notifications.php` (env overrides):

| Setting | Default | Meaning |
|---------|---------|---------|
| `NOTIFICATIONS_PRUNE_READ_AFTER_DAYS` | 15 | Delete read notifications older than N days |
| `NOTIFICATIONS_PRUNE_UNREAD_AFTER_DAYS` | 30 | Delete unread notifications older than N days |

---

## 3. HTTP API (inbox)

| App | List | Mark read | Mark all read | Delete |
|-----|------|-----------|---------------|--------|
| Mobile | `GET /api/v1/mobile/notifications` | `PATCH .../notifications/{id}/read` | `PATCH .../notifications/read-all` | — |
| Admin | `GET /api/v1/web/admin/notifications` | `PATCH .../notifications/{id}/read` | `PATCH .../notifications/read-all` | `DELETE` one / selected |

Authenticated user receives only their own `notifications` rows.

---

## 4. Mobile (client) notifications

Recipients: **enrollment client** (`User` on the enrollment / care plan).

Channels: `database`, `broadcast`, optional **Expo push**.

### 4.1 Summary table

| `data.type` | Class | When sent | Trigger | `action_url` |
|-------------|-------|-----------|---------|--------------|
| `user.onboarding.completed` | `UserOnboardingCompletedNotification` | Client finishes profile wizard (pending → active) | `UserOnboardingCompletedEvent` ← `ProfileSetupService` after step 3 | `/(app)/(tabs)/home` |
| `enrollment.request.cancelled` | `EnrollmentRequestCancelledNotification` | Admin cancels enrollment request | `EnrollmentRequestCancelledEvent` ← `CancelEnrollmentRequestController` | `/(app)/(tabs)/home` |
| `enrollment.contract.assigned` | `EnrollmentContractAssignedNotification` | Admin assigns contract to client | `EnrollmentContractAssignedEvent` ← `AssignEnrollmentContractController` | `/(app)/enrollment-contract?id={contractId}` |
| `enrollment.scheduled` | `EnrollmentScheduledNotification` | Admin creates enrollment with **scheduled** status | `EnrollmentScheduledEvent` ← `StoreEnrollmentService` | `null` (no deep link in push) |
| `enrollment.activated` | `EnrollmentActivatedNotification` | Enrollment becomes **active** (create or schedule update) | `EnrollmentActivatedEvent` ← `StoreEnrollmentService`, `UpdateEnrollmentScheduleService`, `ActivateEnrollmentService`, `EnrollmentLifecycleService` | `/(app)/(tabs)/today` |
| `enrollment.cancelled` | `EnrollmentCancelledNotification` | Admin cancels enrollment | `EnrollmentCancelledEvent` ← `CancelEnrollmentService` | `/(app)/(tabs)/home` |
| `enrollment.completed` | `EnrollmentCompletedNotification` | Enrollment lifecycle marks completed | `EnrollmentCompletedEvent` ← `CompleteEnrollmentService`, `EnrollmentLifecycleService` | `/(app)/(tabs)/home` |
| `enrollment.schedule_updated` | `EnrollmentScheduleUpdatedNotification` | Enrollment schedule changes without triggering first activation | `EnrollmentScheduleUpdatedEvent` ← `UpdateEnrollmentScheduleService` | `null` |
| `care_plan.activated` | `CarePlanActivatedNotification` | Care plan activated (manual or `care-plans:activate-due`) | `CarePlanActivatedEvent` ← `CarePlanBuilderService::activate` | `/(app)/(tabs)/today` |
| `care_plan.cancelled` | `CarePlanCancelledNotification` | Active care plan cancelled | `CarePlanCancelledEvent` ← `CarePlanBuilderService::cancel` | `/(app)/(tabs)/home` |
| `care_plan.report.published` | `CarePlanReportPublishedNotification` | Admin publishes client period report | `CarePlanReportPublishedEvent` ← `CarePlanReportWorkspaceService::publish` | `/(app)/report/{reportRunId}` |
| `care_plan.daily_log_reminder` | `CarePlanDailyLogReminderNotification` | Scheduled job: unlogged tasks today | `care-plans:send-daily-log-reminders` (daily **19:30**) | `/(app)/(tabs)/today` |

### 4.2 Scenarios (detail)

#### `user.onboarding.completed`

- **When:** User status moves from `pending` to `active` after profile setup step 3 completes (`profile_completed_at` set).
- **Listener:** `SendUserOnboardingCompletedNotification` (sync).
- **Meta:** `user_id`, `email`.

#### `enrollment.request.cancelled`

- **When:** Admin cancels a pending enrollment request.
- **Meta:** `enrollment_request_id`, `enrollment_request_code`, `program_id`, `cancelled_at`.

#### `enrollment.contract.assigned`

- **When:** Admin assigns an enrollment contract to the client for signing.
- **Meta:** `enrollment_contract_id`, `enrollment_request_id`, `status`.

#### `enrollment.scheduled` / `enrollment.activated`

- **When:** Admin converts an enrollment request into an enrollment via `StoreEnrollmentService`:
  - **Scheduled** → `enrollment.scheduled` (includes `starts_at`, `ends_at` in meta).
  - **Active** → `enrollment.activated`.
- **Activation also fires when:** schedule update moves scheduled → active, manual activate, or `enrollments:sync-lifecycle` promotes due enrollments.

#### `enrollment.cancelled` / `enrollment.completed`

- **Cancelled:** `CancelEnrollmentService` after admin cancellation.
- **Completed:** `CompleteEnrollmentService` or lifecycle sync when enrollment end date has passed.

#### `enrollment.schedule_updated`

- **When:** Admin changes enrollment schedule fields **without** triggering first activation:
  - **Scheduled enrollment:** `starts_at`, `ends_at`, or both may change, as long as the patch does not promote the enrollment to `active`.
  - **Active enrollment:** `ends_at` may change or be cleared.
- **Copy variants:** The persisted notification type stays `enrollment.schedule_updated`, but user-facing title / message copy now depends on what changed:
  - **Start date changed only** → start-date update copy.
  - **End date changed only** → end-date update copy.
  - **End date removed** → end-date removed copy.
  - **Start + end changed together** → combined schedule update copy.
- **Note:** `action_url` is intentionally `null`; push still includes `type` and `meta` for context.

#### `care_plan.activated`

- **When:** Care plan status becomes `active` (immediate activation or due scheduled plan).
- **Meta:** `care_plan_id`, `care_plan_code`, `enrollment_id`, `enrollment_code`, `program_id`, `starts_on`, `ends_on`, `activated_at`.

#### `care_plan.cancelled`

- **When:** An **active** care plan is cancelled (archives non-archived report runs).
- **Meta:** includes `cancelled_at` (care plan `updated_at`).

#### `care_plan.report.published`

- **When:** Admin publishes a client report run (`IN_REVIEW` → `PUBLISHED`).
- **Meta:** `care_plan_id`, `report_run_id`, `report_code`, enrollment/program ids, `published_at`.

#### `care_plan.daily_log_reminder`

- **When:** Daily scheduler finds an **active** care plan covering today, with at least one scheduled task on today’s plan day, and at least one task still **without** a log for that client.
- **Skips:** No plan day, zero tasks, all tasks logged, or reminder already sent today for that plan.
- **Meta:** `care_plan_id`, `remaining_tasks_count`, `total_tasks_count`, `reminder_date` (Y-m-d).
- **Message params:** `:remaining_count` in `lang/en/notifications.php`.

---

## 5. Admin notifications

Recipients: users with role **`admin`** or **`super_admin`** (`AdminReminderRecipientResolver` / `NotifyAdminsOfEnrollmentRequest`).

Channels: `database`, `broadcast` only (no Expo).

### 5.1 Event-driven admin notifications

| `data.type` | Class | When sent | Trigger | `action_url` |
|-------------|-------|-----------|---------|--------------|
| `enrollment.request.submitted` | `EnrollmentRequestSubmittedNotification` | Client submits program enrollment request | `EnrollmentRequestSubmittedEvent` ← `StoreEnrollmentRequestController` | `/admin/enrollment-requests/{enrollmentRequestId}` |
| `enrollment.contract.signed` | `EnrollmentContractSignedNotification` | Client signs assigned contract | `EnrollmentContractSignedEvent` ← `SignEnrollmentContractController` | `/admin/enrollment-contracts/{contractId}` |

**Recipients:** All admin + super_admin users (not the client).

**`enrollment.request.submitted` meta:** `enrollment_request_id`, `client_id`, `client_name`, `program_id`, `status`, `picture_url`.

**`enrollment.contract.signed` meta:** `enrollment_contract_id`, `enrollment_contract_code`, `enrollment_request_id`, `client_id`, `client_name`, `program_id`, `status`, `picture_url`.

Listeners run **synchronously** (not `ShouldQueue`).

### 5.2 Scheduled admin care-plan reminders

Command: `admin:send-care-plan-action-reminders` — daily at **09:00**.

All use `AdminCarePlanActionReminderNotification` (queued). Copy is **English inline** in rule classes (not `lang/en/notifications.php`).

| `data.type` | Title | When sent (rule) | `action_url` |
|-------------|-------|------------------|--------------|
| `admin.care_plan.operational_log.missing` | Operational Log Missing | Active/completed care plan ended (≤ reference date), **no** operational log | `/admin/care-plan-logs/{carePlanId}` |
| `admin.care_plan.report.publish_overdue` | Report Publish Overdue | Plan ended (≤ yesterday), has operational log, but report not published (missing or still `in_review`) | `/admin/period-reports/{reportRunId}` if in-review run exists; else `/admin/care-plan-logs/{carePlanId}` |
| `admin.care_plan.report.in_review_stale` | Report Review Pending Too Long | Report `in_review` with `submitted_for_review_at` ≤ 2 days ago | `/admin/period-reports/{reportRunId}` |
| `admin.care_plan.client_logging_streak` | Client Logging Risk Detected | Active plan; client missed logging on **≥ 2 consecutive recent days** (within last 3 calendar days of plan days) | `/admin/care-plan-logs/{carePlanId}` |

**Dedup:** One notification per admin per day per `data.type` + `meta.entity_key` (`care_plan:{id}` or `report_run:{id}`).

**Rule source files:**

- `MissingOperationalLogReminderRule`
- `OverduePublishReminderRule`
- `StaleInReviewReminderRule`
- `MissingLoggingStreakReminderRule`

Orchestration: `SendAdminCarePlanActionRemindersService` → `AdminReminderNotifier`.

---

## 6. Schedules (cron)

| Command | Schedule | Purpose |
|---------|----------|---------|
| `care-plans:send-daily-log-reminders` | Daily 19:30 | Client daily log reminders |
| `admin:send-care-plan-action-reminders` | Daily 09:00 | Admin care-plan action reminders |
| `notifications:prune-database` | Daily 01:45 | Prune old inbox rows |

Related lifecycle commands (may **emit client notifications** indirectly):

| Command | Schedule | May trigger |
|---------|----------|-------------|
| `enrollments:sync-lifecycle` | Daily 00:10 | `enrollment.activated`, `enrollment.completed` |
| `care-plans:activate-due` | Daily 00:14 | `care_plan.activated` |
| `care-plans:complete-due` | Daily 00:12 | (status only; no dedicated notification) |

---

## 7. Adding or changing a notification

1. Create `app/Notifications/{Name}Notification.php` with `via()`, `toArray()`, and optionally `toPushPayload()` for clients.
2. For clients, wire a listener on a domain event (register in `EventServiceProvider`) and call `ClientExpoPushDispatcher::dispatchAfterInbox()` when push is required.
3. For admins, either notify in a listener or add a row to a reminder rule + `AdminReminderNotifier`.
4. Add translated copy to `lang/en/notifications.php` for client-facing strings.
5. Use a stable dotted `data.type` string; never rename without a mobile/admin migration plan.
6. Set `action_url` to the **frontend route** the app already implements.
7. Add/extend feature tests (notification payload or listener assertions).

---

## 8. Source file index

| Area | Path |
|------|------|
| Notification classes | `app/Notifications/*.php` |
| Push translation trait | `app/Notifications/Concerns/TranslatesPushForUser.php` |
| Client push dispatcher | `app/Services/Mobile/ClientExpoPushDispatcher.php` |
| Expo data builder | `app/Support/Mobile/ExpoPushNotificationDataBuilder.php` |
| Client copy | `lang/en/notifications.php` |
| Event map | `app/Providers/EventServiceProvider.php` |
| Listeners | `app/Listeners/Notify*.php`, `SendUserOnboardingCompletedNotification.php` |
| Admin reminders | `app/Services/Web/Admin/CarePlan/Reminder/` |
| API resource | `app/Http/Resources/V1/Shared/NotificationResource.php` |
| Pruning | `app/Services/Notifications/DatabaseNotificationPruner.php` |
| Tests (action URLs) | `tests/Feature/V1/Web/Admin/AdminReminderActionUrlTest.php` |

---

## 9. Quick reference — `action_url` only

### Mobile (Expo allowlisted)

| `data.type` | `action_url` |
|-------------|--------------|
| `user.onboarding.completed` | `/(app)/(tabs)/home` |
| `enrollment.request.cancelled` | `/(app)/(tabs)/home` |
| `enrollment.contract.assigned` | `/(app)/enrollment-contract?id={id}` |
| `enrollment.scheduled` | *(omitted)* |
| `enrollment.activated` | `/(app)/(tabs)/today` |
| `enrollment.cancelled` | `/(app)/(tabs)/home` |
| `enrollment.completed` | `/(app)/(tabs)/home` |
| `enrollment.schedule_updated` | *(omitted)* |
| `care_plan.activated` | `/(app)/(tabs)/today` |
| `care_plan.cancelled` | `/(app)/(tabs)/home` |
| `care_plan.report.published` | `/(app)/report/{reportRunId}` |
| `care_plan.daily_log_reminder` | `/(app)/(tabs)/today` |

### Admin (SPA routes)

| `data.type` | `action_url` |
|-------------|--------------|
| `enrollment.request.submitted` | `/admin/enrollment-requests/{enrollmentRequestId}` |
| `enrollment.contract.signed` | `/admin/enrollment-contracts/{contractId}` |
| `admin.care_plan.operational_log.missing` | `/admin/care-plan-logs/{carePlanId}` |
| `admin.care_plan.report.publish_overdue` | `/admin/period-reports/{reportRunId}` or `/admin/care-plan-logs/{carePlanId}` |
| `admin.care_plan.report.in_review_stale` | `/admin/period-reports/{reportRunId}` |
| `admin.care_plan.client_logging_streak` | `/admin/care-plan-logs/{carePlanId}` |

Replace `{id}` placeholders with integer IDs from `data.meta` or the URL segment shown in each notification class/rule.
