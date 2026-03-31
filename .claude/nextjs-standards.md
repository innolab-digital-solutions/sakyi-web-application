---
description: >
  Next.js 16+ App Router standards and mandatory use of the Next.js DevTools MCP
  for docs, runtime discovery, and correctness. Enforces RSC-first design, async
  APIs, caching, and proactive use of nextjs_docs, nextjs_index, and nextjs_call.
alwaysApply: true
---

# NEXT.JS FRAMEWORK — APP ROUTER & MCP-FIRST DISCIPLINE

## 1. MANDATORY USE OF NEXT.JS MCP

This project uses the Next.js DevTools MCP (next-devtools). Use it for all Next.js work so development is documentation-accurate and runtime-aware. Do not rely on memory or guess APIs.

### 1.1 When starting Next.js work

- Call the `init` tool at the start of a Next.js development session or when the conversation turns to Next.js.
- This establishes a docs-first baseline and lists available MCP tools.

### 1.2 For API, syntax, and version correctness

- Do not guess Next.js APIs, options, or file conventions.
- Read the `nextjs-docs://llms-index` resource to get the correct documentation path.
- Call `nextjs_docs` with that path for App Router, Server Actions, caching, Route Handlers, configuration, and other framework behavior.
- Use fetched documentation as the single source of truth for signatures, behavior, and version-specific details.

### 1.3 When implementing, fixing, or debugging

- Call `nextjs_index` to discover running Next.js 16+ dev servers and available MCP tools.
- If no server is found, request the dev server port and call `nextjs_index` again with the port parameter.
- Call `nextjs_call` with the correct port, toolName, and args to retrieve errors, routes, build status, or runtime details.
- Prefer MCP runtime tools over guessing from static code or requesting manual error copy-paste.

### 1.4 For upgrades and cache components

- Use `upgrade_nextjs_16` when upgrading to Next.js 16 (requires clean git).
- Use `enable_cache_components` when migrating to cache components mode.

### 1.5 Summary

- init → session start
- nextjs-docs://llms-index + nextjs_docs → documentation and API correctness
- nextjs_index + nextjs_call → runtime inspection and debugging
- upgrade_nextjs_16 / enable_cache_components → framework migration tasks

---

## 2. FRAMEWORK SCOPE

- Next.js 16+, App Router only
- React 19+, TypeScript 5+
- React Server Components, Server Actions, Route Handlers, Edge/Node runtimes

Do not assume Pages Router or legacy patterns. Confirm current behavior via MCP documentation when unsure.

### 2.1 Next.js 16 specifics

In App Router, `params`, `searchParams`, `cookies()`, and `headers()` are async in Next.js 15+. Await them in Server Components and Route Handlers. Use MCP documentation for exact signatures and migration guidance.

---

## 3. ARCHITECTURE MODEL

- Default to React Server Components.
- Use Client Components only when interactivity is required (event handlers, browser APIs, client-side state).
- Avoid unnecessary `"use client"`.
- Keep server-only logic on the server.
- Never expose secrets or sensitive logic to the client bundle.
- Prefer server-first design over client-heavy approaches.

---

## 4. DATA FETCHING & MUTATIONS

- Prefer async Server Components for data fetching.
- Use MCP documentation for `fetch` caching options (`no-store`, `force-cache`, `revalidate`), Request Memoization, and Data Cache behavior.
- Use Server Actions only when backend logic lives inside Next.js.
- For an external backend (e.g., Laravel API), use an API client integration pattern.
- Do not introduce Next.js Route Handlers for backend logic unless explicitly requested.
- Avoid unnecessary client-side fetching.
- Prevent duplicate fetches and request waterfalls.
- Use streaming and Suspense when beneficial.
- When debugging data flows, use `nextjs_index` and `nextjs_call` if the dev server is running.

---

## 5. ROUTING & FILE STRUCTURE

- Follow App Router conventions strictly.
- Do not invent custom routing.
- Keep route handlers and Server Actions minimal and focused.
- Validate route segment structure before adding new layers.
- If routing structure is unclear, pause, propose a cleaner structure, and request confirmation.

---

## 6. STATE MANAGEMENT

- Prefer server-driven state.
- Use client state only for UI interaction (forms, modals, toggles).
- Do not introduce global state libraries without approval.
- Keep state predictable, minimal, and isolated.

---

## 7. PERFORMANCE & OPTIMIZATION

- Minimize client-side JavaScript and unnecessary hydration.
- Use dynamic imports when beneficial.
- Use Next.js image optimization appropriately.
- Avoid large client bundles.
- Prevent hydration mismatches.
- Treat performance as a core requirement.
- Use MCP documentation for current caching and optimization APIs.

---

## 8. API & BACKEND INTEGRATION

- The backend is an external Laravel API.
- Do not introduce Next.js Route Handlers or API routes for backend logic unless explicitly requested.
- Use a shared API client or similar integration to call Laravel from the app.
- Keep API logic separate from UI logic.
- Validate all input server-side.
- Never trust client-submitted data.
- Avoid duplicating validation across layers.

---

## 9. ENVIRONMENT & CONFIGURATION

- Use environment variables correctly.
- Never expose private environment variables in client components.
- Understand build-time versus runtime behavior.
- Account for development versus production differences.
- If changes are not visible, confirm whether the dev server or build process needs to run.

---

## 10. DEPENDENCY AWARENESS

- Prefer built-in Next.js capabilities before adding third-party packages.
- Do not add dependencies without justification and approval.
- Consider bundle size impact before introducing new packages.

---

## 11. TESTING & MAINTAINABILITY

- Design components and logic to be testable.
- Separate pure logic from framework-specific layers.
- Favor predictable, debuggable patterns.

---

## ENFORCEMENT

These rules apply to all Next.js-related work and complement the global engineering standards rule.

MCP usage is mandatory:

- init when starting Next.js work
- nextjs_docs with llms-index for API correctness
- nextjs_index and nextjs_call when the app is running

When in conflict, prioritize:

- Production safety
- Architectural clarity
- Maintainability
- Performance
