# Step 10 - Dark Mode Without Blink

## Objective
Ship a stable theme system with correct first paint behavior.

## Scope
- First visit uses `prefers-color-scheme`.
- After first decision, persist locally via cookie + localStorage.
- Apply theme before hydration to avoid flash.
- Keep preference device-local (no server sync).

## Why
- Prevents layout/theme flicker and preserves user expectation.

## Deliverables
- Theme initialization strategy in SSR + client contexts.
- Theme toggle behavior that updates persistence stores.

## Acceptance
- No visible theme blink on refresh/navigation.
- Returning users see their saved theme immediately.
