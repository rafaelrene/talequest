# Plan Status

Status: completed
Last Updated: 2026-02-21
Current Phase: plan-complete
Execution Started: yes

## Progress

- Completed: plan definition; step 01 monorepo structure; step 02 tooling and quality gates; step 03 web foundation; step 04 auth session; step 05 convex foundation; step 06 reader MVP flows; step 07 anonymous comments; step 08 tiptap editor/rendering setup; step 09 effect-based validation and error channels; step 10 dark mode implementation without flash; step 11 testing and local runbook; step 11 quality gate hardening (`format:check` + `verify` integration); step 05 auth hardening (Clerk JWT template forwarding into Convex viewer-bound progress/comment operations); step 11 e2e ergonomics hardening (auto-managed web server lifecycle during Cypress runs); step 09/11 validation consistency and API route test coverage hardening for comment writes; step 11 progress API route test coverage hardening for viewer-bound read/write and validation paths; step 06 reader journey hardening (library cards now surface signed-in viewer progress); step 11 reader library load test coverage hardening (signed-out fallback and signed-in viewer progress mapping); step 11 full verification hardening (`pnpm verify` now includes Cypress e2e coverage); step 11 convex boundary contract test coverage hardening (validation/auth mapping tests + convex package `test` script); step 09 boundary error channel hardening (Convex `runBoundary` now unwraps Effect causes and consistently emits typed `ConvexError` payloads); step 05/06 progress lookup efficiency hardening (Convex progress reads/writes now use the full `by_user_story` index key instead of user-wide scans); step 09/11 progress payload guard hardening (web Effect contracts now reject out-of-range percent before Convex calls, with dedicated unit/route coverage); step 04/05 server auth isolation hardening (web Convex HTTP calls now create request-scoped clients so per-user Clerk JWTs cannot leak across concurrent requests); step 11 build verification hardening (`pnpm verify` now includes workspace build)
- In Progress: none
- Pending: none

## Next Action

- None.

## Notes

- Workspace boundaries established: `apps/web`, `apps/convex`, and `packages/ui`.
- Added `apps/web` scripts for `lint`, `format`, and `check-types` using `oxlint`, `oxfmt`, `tsgo`, and `svelte-check`.
- Switched `apps/web` to Vercel adapter, Tailwind v4 baseline, and route groups with app shell.
- Added `@talequest/ui` CVA button recipe and consumed it from `apps/web`.
- Defined public env contract in `apps/web/src/lib/env.ts` with `.env.example`.
- Integrated Clerk via `svelte-clerk` (`hooks.server.ts`, root layout provider, SSR auth load) with sign-in/sign-up routes.
- Added auth guard utility and protected interaction endpoint at `apps/web/src/routes/api/interactions/progress/+server.ts`.
- Added `apps/convex` workspace with schema and auth config, plus story/comment/progress functions and seed fixtures.
- Wired web-side API interfaces for stories/comments/progress to call Convex (`/api/stories`, `/api/stories/[slug]`, `/api/stories/[slug]/comments`, `/api/interactions/progress`).
- Implemented reader MVP routes: server-loaded `/library` story list and `/library/[slug]` detail reading page from seeded Convex stories.
- Added authenticated progress restore/save flow in reader detail with viewer-bound progress query/mutation wiring.
- Added story detail comment composer/rendering with anonymous guest name requirement and signed-in fallback identity label.
- Tightened comment API payload handling (invalid JSON rejection, signed-out guest name guard) and enforced viewer-derived identities for authenticated Convex comment writes.
- Added `@talequest/content` shared workspace package with ProseMirror JSON schema guards, plain-text conversion helpers, and Tiptap-backed deterministic text rendering helpers.
- Switched story and comment content flow to persisted ProseMirror JSON end-to-end (API, Convex mutation/query normalization, and reader page rendering).
- Added shape validation before comment persistence and safe content normalization before story/comment use paths.
- Replaced ad-hoc web API validation branches for progress and comment create flows with shared Effect `Schema` decoders and typed `RequestValidationError` channels (`apps/web/src/lib/server/contracts.ts`).
- Added consistent API validation error payloads for progress endpoints with explicit `validation_error` code.
- Added shared Convex boundary contracts with Effect `Schema` decoding and typed error codes (`validation_error`, `not_found`, `auth_required`) in `apps/convex/convex/contracts.ts`.
- Wrapped story/comment/progress Convex handlers in Effect boundary runners so domain validation failures surface as consistent `ConvexError` payloads.
- Replaced progress percent clamping with strict 0-100 validation at Convex mutation boundaries.
- Updated web Convex client wrappers to map typed Convex boundary error codes into stable HTTP statuses/messages for API consumers.
- Added no-flash theme bootstrap in `app.html` with first-visit system preference and persistence to both cookie and `localStorage`.
- Added server/client theme hydration and header toggle in `+layout.server.ts` and `+layout.svelte`.
- Added dark theme tokens in `app.css` via `:root[data-theme="dark"]` overrides.
- Added workspace test pipeline: root `test`, `test:e2e`, and `verify` scripts plus Turbo `test`/`test:e2e` tasks.
- Added Vitest unit coverage for rich-text helpers (`packages/content/src/index.test.ts`) and web request validation contracts (`apps/web/src/lib/server/contracts.test.ts`).
- Added Cypress baseline config and critical-path specs for auth entry points, library journey, comment submission, and dark-mode persistence (`apps/web/cypress/e2e/foundation.cy.ts`).
- Replaced starter root README with TaleQuest local runbook documenting dev/build/lint/format/check-types/test/e2e/verify command sequence.
- Local quality checks passed: `pnpm format`, `pnpm lint`, `pnpm check-types`, `pnpm test`.
- Final e2e verification passed against live `apps/web` dev server via `pnpm test:e2e` (Cypress: 4 passing, 0 failing).
- Added workspace `format:check` scripts and root Turbo task, then wired `pnpm verify` to enforce formatting checks alongside lint/type/test.
- Post-hardening local verification passed with updated `pnpm verify` (lint, format check, type-check, and unit tests).
- Tightened Convex auth boundaries by forwarding Clerk `convex` JWTs from SvelteKit server handlers and switching progress/comment writes to viewer-bound Convex operations.
- Removed Convex comment `userId` passthrough arg and deprecated direct user-scoped progress calls from web routes to prevent user ID spoofing at the backend boundary.
- Post-auth-hardening local checks passed: `pnpm format`, `pnpm lint`, `pnpm check-types`.
- Updated `apps/web` e2e script to auto-start/stop a strict-port local SvelteKit dev server via `start-server-and-test`, preventing false-green runs against an unrelated server process.
- Post-e2e-ergonomics verification passed: `pnpm test:e2e` (Cypress: 4 passing, 0 failing).
- Hardened request validation error handling to unwrap Effect fiber-wrapped failures and return stable `validation_error` JSON payloads on progress/comment API routes.
- Added web route unit coverage for comment submission validation and signed-in viewer-bound Convex mutation wiring (`apps/web/src/routes/api/stories/[slug]/comments/route.test.ts`) plus contract tests for wrapped validation error detection.
- Extended Effect-backed slug validation to story detail/comments API routes and added unit coverage for empty-slug rejection paths (`apps/web/src/routes/api/stories/[slug]/+server.ts`, `apps/web/src/routes/api/stories/[slug]/comments/+server.ts`, `apps/web/src/routes/api/stories/[slug]/route.test.ts`).
- Added progress API route unit coverage for empty-slug GET validation, invalid POST payload rejection, and signed-in viewer-bound Convex query/mutation wiring (`apps/web/src/routes/api/interactions/progress/route.test.ts`).
- Added viewer-scoped progress listing query in Convex and wired `/library` server load/UI to display per-story signed-in progress bars (`apps/convex/convex/progress.ts`, `apps/web/src/routes/(marketing)/library/+page.server.ts`, `apps/web/src/routes/(marketing)/library/+page.svelte`).
- Added unit coverage for `/library` server load to assert signed-out behavior skips viewer progress lookup and signed-in behavior forwards viewer-bound auth context while mapping progress to stories (`apps/web/src/routes/(marketing)/library/page.server.test.ts`).
- Updated root `verify` script to run `pnpm test:e2e` after lint/format/type/unit checks so one command validates all critical local flows.
- Post-verify-hardening local verification passed with updated `pnpm verify` (lint, format check, type-check, unit tests, and Cypress e2e: 4 passing, 0 failing).
- Added Convex-side boundary contract tests for slug/percent/guest/content decoding and boundary error mapping/passthrough behavior, and added an `apps/convex` `test` script so Turbo `test` includes backend boundary checks (`apps/convex/convex/contracts.test.ts`, `apps/convex/package.json`).
- Updated Convex `runBoundary` to evaluate Effect exits directly and unwrap typed failures from `Cause` instead of relying on `instanceof` checks against fiber-wrapped thrown values, restoring stable typed `ConvexError` mapping for validation/auth/not-found failures (`apps/convex/convex/contracts.ts`).
- Replaced user-scoped progress scan/filter lookups with direct `by_user_story` index lookups for both read and upsert paths, reducing per-request DB work for reader progress operations (`apps/convex/convex/progress.ts`).
- Added web-side progress percent range validation (`0..100`) in Effect request contracts and covered the boundary path in both contract and route tests to keep validation/error behavior stable before Convex execution (`apps/web/src/lib/server/contracts.ts`, `apps/web/src/lib/server/contracts.test.ts`, `apps/web/src/routes/api/interactions/progress/route.test.ts`).
- Switched web Convex server integration to instantiate a fresh `ConvexHttpClient` per call and added unit coverage proving auth token isolation across requests (`apps/web/src/lib/server/convex.ts`, `apps/web/src/lib/server/convex.test.ts`).
- Updated root `verify` script to run `pnpm build` after lint/format/type/test checks so one command also validates production build integrity before Cypress e2e.
