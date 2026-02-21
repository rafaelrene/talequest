# TaleQuest Foundation Plan

## Goal

Stand up a production-ready monorepo baseline for TaleQuest with SvelteKit web app, Convex backend, shared UI package, auth, theme system, and tests, without implementing writer features yet. Ensure @plans/2026-02-21-talequest-foundation/STATUS.md is kept up to date.

## Locked Decisions

- Monorepo: Turborepo + pnpm workspace.
- App locations: `apps/web` and `apps/convex`.
- Shared components: `packages/ui` using shadcn-svelte patterns where possible.
- Type checking/compiler path: TypeScript-Go (`tsgo`).
- Lint/format: `oxlint` + `oxfmt`.
- Svelte diagnostics: `svelte-check`.
- Auth: Clerk with Email + Google.
- Dates: Luxon.
- Error handling + validation: Effect.
- Theme behavior: no blink, first visit follows system preference, then device-local persistence.
- Tests: Vitest + Cypress.
- CI: none for now (local-first verification).
- Reader scope: anonymous users can read and comment; interaction features require auth.
- Content model: Tiptap ProseMirror JSON.
- Initial stories: seeded fixtures, all public.

## Step Map

1. Monorepo structure and package boundaries.
2. Tooling and quality gates (`tsgo`, `oxlint`, `oxfmt`, `svelte-check`).
3. `apps/web` SvelteKit foundation for Vercel.
4. Clerk auth integration and access model.
5. `apps/convex` schema/runtime/auth wiring.
6. Reader MVP flows (list/detail/progress).
7. Anonymous comments with required guest name.
8. Tiptap editor/rendering setup with ProseMirror JSON.
9. Effect-based validation and error channels.
10. Dark mode implementation without flash.
11. Testing and local runbook (no CI yet).

## Success Criteria

- Developers can clone, install, run, lint, type-check, and test locally.
- Reader users can browse and read seeded stories.
- Anonymous users can submit comments with guest names.
- Signed-in users are ready for interaction features in next phases.
- Theme is stable on first paint and persists per device.
