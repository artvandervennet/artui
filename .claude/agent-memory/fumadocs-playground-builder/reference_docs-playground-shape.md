---
name: docs-playground-shape
description: How artui docs playgrounds are actually built (no Fumadocs <Playground> primitive; hand-rolled pattern)
metadata:
  type: reference
---

artui docs do NOT use a Fumadocs `<Playground>` / `<TypeTable>` `create` primitive. Playgrounds are hand-rolled client components in `apps/docs/components/*-playground.tsx`.

Established pattern (see `toast-playground.tsx`):
- `'use client'` at top; import the registry component from the package alias `@artui/registry` (not a relative registry path).
- An in-file generic `Toggle<T extends string>` segmented-button component is the standard control widget (styled with Fumadocs `fd-*` Tailwind tokens: `fd-border`, `fd-card`, `fd-primary`, `fd-muted-foreground`, `fd-accent`).
- Controls are plain `useState` + `Toggle` rows, each row: `<span className="w-36 shrink-0 font-mono text-xs ...">field</span>` + `<Toggle .../>`. No control-descriptor array/schema.
- A live code snippet is rendered in a `<pre>` (read-only, not editable) built by a pure `buildSnippet(...)` function from the current control state.
- Outer wrapper: `not-prose rounded-xl border border-fd-border`. Preview area: `bg-fd-card p-8 min-h-[220px]`. Controls area: `border-t bg-fd-muted/50 divide-y divide-fd-border`.
- Components needing a provider (e.g. Toast's `useToast`) wrap an inner `PlaygroundInner` in the provider; provider stays as the persistent outer wrapper.

**Why:** Confirmed by reading existing code 2026-05-26; assuming a Fumadocs `<Playground>` API would be wrong here.
**How to apply:** Match this hand-rolled structure for new artui playgrounds rather than introducing the Fumadocs playground primitive or an editable code tab.
