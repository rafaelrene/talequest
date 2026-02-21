# Step 09 - Effect Error Handling and Validation

## Objective
Standardize runtime safety and error flow across boundaries.

## Scope
- Use Effect for typed error channels in domain/service layers.
- Use Effect schema validation for external inputs and stored payloads.
- Define shared schemas for story/comment/progress contracts.

## Why
- Reduces hidden failure modes and keeps error behavior explicit.

## Deliverables
- Reusable validation and error primitives.
- Consistent mapping from domain errors to UI-safe responses.

## Acceptance
- Invalid inputs fail with predictable, typed errors.
- Callers handle success/failure through Effect patterns consistently.
