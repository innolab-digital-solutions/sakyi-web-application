# Admin Next.js Notification Setup (Laravel + Reverb + Echo)

This guide explains how the Next.js admin app should consume notifications from Laravel in realtime and via inbox APIs.

## 1) Backend Contract

Laravel already exposes:

- Realtime private channel: `App.Models.User.{id}`
- Notification APIs:
  - `GET /v1/web/admin/notifications`
  - `PATCH /v1/web/admin/notifications/{notificationId}/read`
  - `PATCH /v1/web/admin/notifications/read-all`

Payload format:

```json
{
  "id": "notification-uuid",
  "type": "App\\Notifications\\EnrollmentRequestSubmittedNotification",
  "read_at": null,
  "created_at": "2026-04-13T13:00:00.000000Z",
  "data": {
    "type": "enrollment.request.submitted",
    "title": "New Enrollment Request",
    "message": "A client has submitted a new program enrollment request.",
    "action_url": "/admin/enrollment-requests/123",
    "meta": {
      "enrollment_request_id": 123,
      "client_id": 1,
      "program_id": 9
    }
  }
}
```

## 2) Required Next.js Packages

Install:

```bash
npm install laravel-echo pusher-js axios
```

> Reverb uses Pusher protocol, so `pusher-js` is the expected client transport.

## 3) Environment Variables (Next.js)

```dotenv
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_REVERB_HOST=localhost
NEXT_PUBLIC_REVERB_PORT=8080
NEXT_PUBLIC_REVERB_SCHEME=http
NEXT_PUBLIC_REVERB_APP_KEY=local-app-key
```

## 4) Create Echo Client

Example `src/lib/echo.ts`:

```ts
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
  interface Window {
    Pusher: typeof Pusher;
  }
}

if (typeof window !== 'undefined') {
  window.Pusher = Pusher;
}

export function createEcho(getToken: () => string | null) {
  return new Echo({
    broadcaster: 'reverb',
    key: process.env.NEXT_PUBLIC_REVERB_APP_KEY!,
    wsHost: process.env.NEXT_PUBLIC_REVERB_HOST!,
    wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? 8080),
    wssPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? 8080),
    forceTLS: process.env.NEXT_PUBLIC_REVERB_SCHEME === 'https',
    enabledTransports: ['ws', 'wss'],
    authEndpoint: `${process.env.NEXT_PUBLIC_API_BASE_URL}/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${getToken() ?? ''}`,
        Accept: 'application/json',
      },
    },
  });
}
```

## 5) Subscribe To Notifications

```ts
const echo = createEcho(() => accessToken);

const channel = echo.private(`App.Models.User.${userId}`);

channel.notification((notification) => {
  // optimistic add to UI
  // then optional re-fetch /notifications for consistency
  console.log('notification', notification);
});

// cleanup
echo.leave(`private-App.Models.User.${userId}`);
```

## 6) Admin Inbox API Usage

### Load notifications

```ts
await axios.get('/v1/web/admin/notifications', {
  headers: { Authorization: `Bearer ${token}` },
  params: { per_page: 20 },
});
```

### Mark one as read

```ts
await axios.patch(`/v1/web/admin/notifications/${notificationId}/read`, {}, {
  headers: { Authorization: `Bearer ${token}` },
});
```

### Mark all as read

```ts
await axios.patch('/v1/web/admin/notifications/read-all', {}, {
  headers: { Authorization: `Bearer ${token}` },
});
```

## 7) Recommended UI Behavior

- On initial page load: fetch paginated notifications.
- On realtime event: prepend into local list and increment unread count.
- On tab focus / reconnect: refresh first page to avoid missing events.
- Use `data.type` for event routing:
  - `enrollment.request.submitted` -> navigate to enrollment request page.

## 8) Local Dev Runbook

From Laravel backend:

```bash
php artisan migrate
php artisan queue:work
php artisan reverb:start
php artisan serve
```

From Next.js app:

```bash
npm run dev
```

## 9) Troubleshooting

- 403 on `/broadcasting/auth`:
  - verify bearer token is sent.
  - verify authenticated user id matches channel `App.Models.User.{id}`.
- Realtime not received:
  - check Reverb running and correct host/port/app key.
  - ensure queue worker is running because notifications are queued.
- Notifications in DB but no websocket event:
  - confirm `BROADCAST_CONNECTION=reverb`.
  - confirm reverb env keys match client key.
