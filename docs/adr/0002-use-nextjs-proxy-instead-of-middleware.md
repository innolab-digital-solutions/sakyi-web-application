# ADR 0002: Use Next.js 16 `proxy.ts` instead of `middleware.ts`

## Status

Accepted

## Context

Next.js 16 deprecates the `middleware` file convention in favor of **`proxy.ts`** to reduce confusion with Express-style middleware and to clarify the network-boundary role.

## Decision

- Add **`proxy.ts`** at the project root (alongside `app/`) with a **`matcher`** limited to `/admin/:path*`.
- Do **not** add a root `middleware.ts` file.
- Rely on Laravel for authorization; Proxy is reserved for optional rewrites, headers, or redirects later.

## Consequences

- Contributors follow [Proxy documentation](https://nextjs.org/docs/app/api-reference/file-conventions/proxy) instead of legacy middleware naming.
- CI/build output lists **Proxy** in the route table (expected).
