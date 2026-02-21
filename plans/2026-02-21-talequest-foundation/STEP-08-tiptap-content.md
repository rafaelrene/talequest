# Step 08 - Tiptap Content Pipeline

## Objective
Use Tiptap-native content model for future flexibility.

## Scope
- Use `@tiptap/core` with standard supporting extensions.
- Store rich content as ProseMirror JSON.
- Render story/comment content from JSON in a safe, read-oriented pipeline.

## Why
- ProseMirror JSON is the most future-proof base for editor features.

## Deliverables
- Shared content schema for persisted editor state.
- Deterministic rendering path from stored JSON to UI.

## Acceptance
- Seeded stories and new comments render correctly from JSON.
- Content shape is validated before persistence/use.
