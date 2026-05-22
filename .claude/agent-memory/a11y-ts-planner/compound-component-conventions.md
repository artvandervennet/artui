---
name: compound-component-conventions
description: How registry compound components (Dialog, DropdownMenu, etc.) are structured — context, child registration, namespace export.
metadata:
  type: reference
---

Compound components in the artui registry follow a consistent shape, demonstrated by `registry/components/dropdown-menu/dropdown-menu.tsx` and `registry/components/dialog/dialog.tsx`:

- **Single file per component.** All subcomponents, contexts, types, and helpers live in one `.tsx`. CSS sits next to it.
- **Root context.** Created with `createContext<Ctx | null>(null)`. A `useRoot(name)` helper throws a clear error when a subcomponent renders outside the root.
- **Child registration via refs + counters.** Subcomponents register themselves in a `useEffect` that increments a counter in context and decrements on cleanup. This supports React Strict Mode's double-invoke (cleanup balances the extra invoke). See `dropdown-menu.tsx:215-218` for the canonical pattern.
- **Cross-sibling guards via refs.** When subcomponent A needs to know if subcomponent B exists, B writes `hasBRef.current = true` in its effect, and A reads it in a `useEffect` deferred by `setTimeout(..., 0)` so all sibling effects have committed first. See `dropdown-menu.tsx:630-642`.
- **Stable ids.** `useId()` at the root, then suffixed (`${uid}-trigger`, `${uid}-menu`).
- **Namespace export.** `export const X = Object.assign(XRoot, { Sub1, Sub2, ... })`. The root has no JSDoc on the named export — it goes on the `Object.assign` const so the namespace usage is the documented entry point.
- **Tier-3 violations are wrapped, not thrown.** The component still renders its element; `withErrorOverlay(element, {...})` returns a wrapped version. Never `throw` for an a11y violation. See [[registry-runtime-guard-convention]].

Apply this shape when planning new compound components (Accordion, Tabs, etc.). Don't invent alternative structures.
