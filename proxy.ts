import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { ROUTES } from '@/config/routes';

const ADMIN_LOGIN_PATH = ROUTES.ADMIN.AUTH.LOGIN;
const ADMIN_ROOT_PATH = ROUTES.ADMIN.MODULES.OVERVIEW;

/**
 * Middleware-like proxy that enforces admin authentication state for `/admin` routes.
 *
 * - If the environment variable `PROXY_ADMIN_SESSION_COOKIE_NAMES` is not set,
 *   all /admin route accesses (except /admin/login) redirect to the login page.
 * - If none of the cookies listed (comma-separated in the env var) are present in the request,
 *   and the request is not for the login page, redirects to login.
 * - If a session cookie exists and the request is for the login page, redirects to the admin root.
 * - Otherwise, allows the request through.
 *
 * This allows the frontend to optimistically block access to protected routes based on the *presence*
 * of certain session-related cookies (e.g., from a Laravel Sanctum or API-based backend).
 *
 * Note:
 * - Cookie names and their meaning must be managed externally (in backend config and .env).
 * - This logic does NOT validate or introspect tokens—it only checks for the presence of any listed cookie.
 * - Used as a Next.js middleware matcher (see `export const config`).
 *
 * @param {NextRequest} request - Incoming Next.js request object.
 * @returns {NextResponse} A redirect or "next" response depending on authentication state and route.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const raw = process.env.PROXY_ADMIN_SESSION_COOKIE_NAMES?.trim();

  if (!raw) {
    return NextResponse.redirect(new URL(ADMIN_LOGIN_PATH, request.url));
  }

  const cookieNames = raw
    ? raw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const hasSession = cookieNames.some((name) => request.cookies.has(name));

  // If not logged in and not already on the login page, redirect to login
  if (!hasSession && !pathname.startsWith(ADMIN_LOGIN_PATH)) {
    return NextResponse.redirect(new URL(ADMIN_LOGIN_PATH, request.url));
  }

  // If logged in but hitting the login page, redirect to admin root instead
  if (hasSession && pathname.startsWith(ADMIN_LOGIN_PATH)) {
    return NextResponse.redirect(new URL(ADMIN_ROOT_PATH, request.url));
  }

  // Otherwise, let the request through
  return NextResponse.next();
}

/**
 * Next.js route matcher configuration.
 * Applies the `proxy` middleware to all `/admin/*` routes.
 */
export const config = {
  matcher: ['/admin/:path*'],
};
