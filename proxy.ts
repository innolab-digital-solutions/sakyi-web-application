/**
 * Next.js 16+ Proxy (replaces deprecated `middleware`).
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/proxy
 *
 * Scope is intentionally narrow: run only on `/admin` paths. Authorization must
 * remain enforced by the Laravel API; this file is for headers / future
 * optimistic routing—not a security boundary.
 */
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function proxy(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
