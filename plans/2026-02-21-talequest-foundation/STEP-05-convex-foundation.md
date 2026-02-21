# Step 05 - Convex Foundation (`apps/convex`)

## Objective
Set up backend schema, queries, and mutations for Reader MVP.

## Scope
- Initialize Convex project structure and environment wiring.
- Define base schema for stories, comments, and read progress.
- Implement mixed access pattern:
  - server paths for sensitive actions,
  - client/realtime paths where UX benefits.

## Why
- Keeps security-sensitive logic controlled without losing realtime flexibility.

## Deliverables
- Convex functions for core read/comment/progress operations.
- Auth-aware context available in backend functions.

## Acceptance
- Web app can query story data and submit comments through defined interfaces.
- Auth and anonymous contexts resolve correctly.
