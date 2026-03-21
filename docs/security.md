# Security model (frontend)

This Next.js app is a **browser client** to a **Laravel API**. Treat the API as the only authoritative layer for authentication, authorization, and validation.

## Authentication

- Sessions are **cookie-based** (e.g. Sanctum). The shared HTTP client uses `credentials: 'include'` and CSRF for unsafe methods (`lib/api/client`).
- **Admin UI** (`RouteGuard`, `AuthProvider`) improves UX; it is **not** a security boundary. Users must not be able to perform admin actions if the API returns 401/403.
- HTTP **401** responses dispatch `API_UNAUTHORIZED_EVENT` so the admin shell can redirect to login (`lib/api/client/handlers.ts`, `context/AuthContext.tsx`).

## Next.js 16 Proxy

- `proxy.ts` at the project root replaces deprecated `middleware` for path-matched logic. See [Proxy (Next.js)](https://nextjs.org/docs/app/api-reference/file-conventions/proxy).
- The matcher is limited to `/admin/:path*`. **Do not** rely on Proxy for authorization; keep checks in Laravel.

## Environment variables

- **`NEXT_PUBLIC_*`** values are exposed to the browser. Never put secrets there.
- Production deployments should set API URL env vars explicitly. CI validates required keys via `npm run verify:env` (see `scripts/verify-env.mjs`).

## HTTP headers

- Baseline headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`) are set in `next.config.ts`. Tighten further (e.g. CSP) per environment.

## Rich text and user content

- Admin editors (e.g. TipTap) must **sanitize HTML** on display if the API stores raw HTML; follow backend rules and avoid `dangerouslySetInnerHTML` without sanitization.
