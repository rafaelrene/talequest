# Step 04 - Auth and Session Model

## Objective
Integrate Clerk and define public vs authenticated behavior.

## Scope
- Add Clerk SDK integration in `apps/web`.
- Enable Email + Google providers.
- Define route/action guards for interaction features.
- Map Clerk identity to Convex auth context.

## Why
- Reader experience stays open, while user-specific actions remain secure.

## Deliverables
- Sign-in/sign-up flow available.
- Public read routes work without login.
- Protected endpoints ready for save/like/progress interactions.

## Acceptance
- Unauthenticated users can browse/read.
- Authenticated session is available where protected actions require it.
