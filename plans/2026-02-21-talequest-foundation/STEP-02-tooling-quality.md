# Step 02 - Tooling and Quality Gates

## Objective
Establish fast, consistent quality tooling across the monorepo.

## Scope
- Configure TypeScript-Go (`tsgo`) as the type checking/compiler path.
- Configure `oxlint` for JS/TS linting.
- Configure `oxfmt` for formatting.
- Add `svelte-check` for Svelte diagnostics not covered by oxlint.

## Why
- Keeps tooling fast while preserving Svelte-specific correctness checks.

## Deliverables
- Root scripts for `lint`, `format`, and `check-types` call the new toolchain.
- Per-package scripts inherit the same conventions.

## Acceptance
- Lint, format, and type-check run locally from repo root.
- `.svelte` diagnostics are reported by `svelte-check`.
