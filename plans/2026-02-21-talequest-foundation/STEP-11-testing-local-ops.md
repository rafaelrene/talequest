# Step 11 - Testing and Local Operations

## Objective
Guarantee local quality signals without introducing CI yet.

## Scope
- Vitest for unit/integration coverage.
- Cypress for critical e2e flows:
  - auth,
  - reader journey,
  - comment submission,
  - dark mode persistence.
- Root runbook scripts for dev/build/lint/format/check-types/test/e2e.

## Why
- Keeps delivery velocity high while preserving confidence.

## Deliverables
- Repeatable local verification command set.
- Test suites covering highest-risk flows first.

## Acceptance
- A developer can run the full local verification sequence.
- Critical paths pass in local environment.
