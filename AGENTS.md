# AGENTS.md - TaleQuest Repository Guidelines

## Project Overview

Turborepo monorepo with SvelteKit and Convex for a story reading/writing platform.

**Structure:** `apps/` (web, docs, convex, etc) + `packages/` (ui, typescript-config, etc)

## Build/Lint/Test Commands

### Root Commands (via Turbo)

```bash
pnpm dev           # Start all apps in dev mode
pnpm build         # Build all apps
pnpm lint          # Lint all packages
pnpm check-types   # type-check all packages
pnpm format        # Format all files
```

## Workflow

- Don't commit changes. User will do it by themselves.
