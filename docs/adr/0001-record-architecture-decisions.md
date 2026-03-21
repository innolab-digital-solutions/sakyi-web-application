# ADR 0001: Record architecture decisions

## Status

Accepted

## Context

The codebase spans a public marketing site and an admin dashboard backed by a Laravel API. We need a lightweight way to capture **why** structural choices were made so future contributors do not reverse them by accident.

## Decision

1. Use **Architecture Decision Records** (ADRs) in `docs/adr/` as short Markdown files: `NNNN-title.md`.
2. Each ADR states **status**, **context**, **decision**, and optional **consequences**.
3. Prefer linking from [docs/architecture.md](../architecture.md) when an ADR affects day-to-day development.

## Consequences

- Onboarding improves: rationale survives team turnover.
- Reviewers can ask for a new ADR when a change alters a documented decision.
