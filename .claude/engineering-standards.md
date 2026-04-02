---
description: >
  Enforces Clean Architecture discipline, strict boundary protection, and
  production-grade engineering standards across all projects. The agent must
  prioritize architectural integrity, separation of concerns, maintainability,
  and long-term scalability over speed or convenience. These rules are
  framework-agnostic and language-agnostic.
alwaysApply: true
---

# ENGINEERING CONSTITUTION — CLEAN ARCHITECTURE DISCIPLINE

## 1. PRIORITY ORDER

When conflicts occur, follow this order:

1. Production safety and data integrity
2. Architectural boundary protection
3. Existing project conventions
4. Maintainability and clarity
5. Performance
6. Development speed

A higher priority must never be sacrificed for a lower one.

---

## 2. CLEAN ARCHITECTURE CORE RULES

The system must respect separation of concerns at all times.

### 2.1 Layer Responsibilities

The codebase must logically separate:

- Domain (business rules and core logic)
- Application (use cases, orchestration)
- Infrastructure (external systems, persistence, frameworks)
- Interface / Presentation (UI, controllers, delivery mechanisms)

### 2.2 Dependency Direction

Dependencies must only point inward.

- Domain must not depend on Application, Infrastructure, or Presentation.
- Application must not depend on Presentation or Infrastructure implementations.
- Infrastructure may depend on Domain and Application.
- Presentation may depend on Application.
- No circular dependencies.

If a dependency violates this rule, stop and refactor.

---

## 3. EXECUTION PROTOCOL

All tasks must follow this sequence.

### Phase 1 — Context Inspection

Before writing code:

- Inspect related files
- Identify existing architectural layers
- Identify dependency direction
- Detect side effects
- Detect duplication

Do not implement during this phase.

---

### Phase 2 — Risk Evaluation

Evaluate:

- Does this violate layer boundaries?
- Does this introduce tight coupling?
- Does this duplicate existing logic?
- Does this introduce hidden side effects?
- Does this mix responsibilities?

If risk is detected:

- Explain the issue
- Propose alternatives
- Request confirmation before proceeding

---

### Phase 3 — Design Declaration

Before implementing:

- State which layer the change belongs to
- Justify placement
- Confirm boundary compliance
- Evaluate testing impact:
  - Determine whether unit, integration, or E2E tests are required
  - Justify the appropriate test level based on risk and architectural impact

---

### Phase 4 — Implementation

During implementation:

- Follow existing conventions strictly
- Do not introduce new architectural patterns without justification
- Keep responsibilities focused and minimal
- Avoid speculative abstraction

---

### Phase 5 — Self-Review

After implementation:

- Verify dependency direction
- Verify no layer leakage occurred
- Verify no duplicated logic exists
- Verify clarity and simplicity
- Verify documentation is present where complexity requires it
- Remove unnecessary complexity

---

## 4. STRICT PROHIBITIONS

The following are forbidden unless explicitly approved:

- Mixing business logic with presentation logic
- Mixing orchestration logic with infrastructure logic
- Accessing infrastructure directly from presentation
- Introducing global mutable state
- Creating circular dependencies
- Combining refactor and feature changes in one operation
- Silent breaking changes to public interfaces
- Introducing new dependencies without approval
- Creating abstractions without demonstrated repetition (minimum twice)

---

## 5. ABSTRACTION DISCIPLINE

- Abstract only when duplication appears at least twice
- Prefer simple concrete implementations first
- Extract before generalizing
- Avoid utility dumping grounds
- Every abstraction must have a single clear responsibility

---

## 6. FUNCTION & MODULE RESPONSIBILITY

- Each module must have a single, well-defined responsibility
- Files must not exceed reasonable complexity
- Avoid large monolithic classes or functions
- Avoid hidden side effects
- Explicitly pass dependencies instead of importing deep internals

---

## 7. AMBIGUITY PROTOCOL

A task is considered ambiguous if:

- Input/output contracts are undefined
- Layer placement is unclear
- Multiple architectural approaches exist
- Cross-module impact is unknown
- Performance or data implications are uncertain

When ambiguity exists:

- Stop implementation
- Clearly explain the ambiguity
- Present 1–2 viable architectural options
- Request decision before proceeding

---

## 8. DEPENDENCY AWARENESS

- All external libraries are considered infrastructure
- Business logic must not depend on third-party implementations
- Prefer dependency inversion when integrating infrastructure
- Identify when patterns originate from external frameworks

Do not blindly copy framework patterns into domain logic.

---

## 9. REFACTORING STANDARDS

- Refactoring is continuous and intentional
- Improve clarity without altering behavior
- Decompose complex logic into smaller units
- Remove dead or unused code immediately
- Avoid premature optimization

---

## 10. TESTABILITY PRINCIPLE

- Core business logic must be testable in isolation
- Domain logic must not require infrastructure to execute
- Avoid tightly coupling logic to external systems
- Favor deterministic, predictable behavior

---

## 11. AI-SPECIFIC ENFORCEMENT

When operating:

- Do not guess missing context
- Do not invent APIs or dependencies
- Do not assume frameworks or tooling unless provided
- If context is insufficient, ask
- If architectural integrity is at risk, pause and explain
- Do not prioritize speed over structure

---

## 12. PRODUCTION MINDSET

Assume all code is production code unless explicitly stated otherwise.

Favor:

- Stability
- Predictability
- Observability
- Maintainability

Avoid experimental, trendy, or fragile solutions unless explicitly justified.

---

## 13. CODE WRITING & DOCUMENTATION STANDARDS

Code must communicate intent clearly without relying on external explanation.

### 13.1 Naming Clarity

- Use intention-revealing names
- Function names must describe behavior (verb-based)
- Variables must reflect meaning, not implementation detail
- Avoid vague names such as:
  - helper
  - utils
  - data
  - temp
  - value

Names must explain purpose, not mechanics.

### 13.2 Structured Documentation Comments

All public, reusable, cross-layer, or complex methods must include structured documentation using the language’s standard documentation format.

Documentation must include:

- What the function does
- Why it exists
- Input parameters and expectations
- Return value description
- Important constraints or side effects
- Architectural considerations when relevant

Documentation must not:

- Restate obvious code
- Duplicate type information unnecessarily
- Include vague or redundant text
- Explain trivial behavior

### 13.3 Inline Comments

Inline comments are allowed only when:

- Explaining complex business logic
- Explaining non-obvious decisions
- Clarifying architectural trade-offs
- Documenting edge cases

Inline comments must:

- Be concise
- Explain why, not what
- Be removed if the code becomes self-explanatory

Do not comment obvious operations.

### 13.4 Complexity Control

When a function requires excessive inline comments:

- Decompose the function into smaller, well-named units
- Reduce branching complexity
- Improve structure instead of adding explanation

Clarity must come from structure first, comments second.

### 13.5 File Hygiene

- Do not leave commented-out code
- Do not leave TODOs without context
- Do not leave debugging artifacts
- Remove unused imports immediately

### 13.6 Readability Standards

- Prefer explicitness over clever shortcuts
- Avoid deeply nested conditionals
- Avoid chained logic that reduces clarity
- Keep logical blocks visually separated
- Maintain consistent formatting

Readable code is mandatory.

---

## ENFORCEMENT

These rules are mandatory.

Architectural integrity, separation of concerns, and long-term maintainability override convenience, speed, and speculative design.

If a requested action violates these standards, pause and explain before proceeding.
