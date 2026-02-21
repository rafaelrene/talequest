# TaleQuest

TaleQuest is a Turborepo monorepo with a SvelteKit web app and Convex backend.

## Workspace

- `apps/web`: reader-facing SvelteKit app
- `apps/convex`: Convex schema and functions
- `packages/ui`: shared UI components
- `packages/content`: shared rich-text helpers

## Local Runbook

Install dependencies:

```sh
pnpm install
```

Run core tasks:

```sh
pnpm dev
pnpm build
pnpm lint
pnpm format
pnpm check-types
pnpm test
pnpm test:e2e
```

Run full local verification:

```sh
pnpm verify
```

## Notes

- `pnpm test` runs Vitest suites across workspaces.
- `pnpm test:e2e` runs Cypress flows for `apps/web`.
- `pnpm format:check` verifies workspace formatting without writing changes.
- `pnpm test:e2e` auto-starts the web dev server and shuts it down after Cypress completes.
- `pnpm verify` now runs lint, format checks, type checks, unit tests, and e2e tests in one command.
