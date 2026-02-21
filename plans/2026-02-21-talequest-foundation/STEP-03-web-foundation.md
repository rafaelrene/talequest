# Step 03 - Web App Foundation (`apps/web`)

## Objective
Bootstrap the frontend runtime and styling baseline.

## Scope
- Initialize SvelteKit app configured for Vercel deployment.
- Add Tailwind + CVA setup aligned with shared `packages/ui` usage.
- Define base app layout, route groups, and environment contract.

## Why
- Provides the shell that all product features depend on.

## Deliverables
- `apps/web` bootstrapped and runnable in dev.
- Shared design tokens/components can be consumed from `packages/ui`.

## Acceptance
- App starts locally and renders base routes.
- Build path is compatible with Vercel target.
