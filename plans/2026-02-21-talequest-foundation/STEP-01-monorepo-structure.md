# Step 01 - Monorepo Structure

## Objective
Create clean project boundaries for deployable apps and shared packages.

## Scope
- Keep workspace patterns as `apps/*` and `packages/*`.
- Add `apps/web` for SvelteKit frontend.
- Add `apps/convex` for Convex backend service.
- Add `packages/ui` for reusable components and tokens.

## Why
- `apps/convex` keeps runtime, env, and deployment concerns isolated.
- `packages/ui` prevents duplicated component code across apps.

## Deliverables
- Folder structure exists and is wired in workspace.
- Root scripts/tasks resolve app/package boundaries correctly.

## Acceptance
- `pnpm -r list` sees all new workspaces.
- Turbo can target each app/package independently.
