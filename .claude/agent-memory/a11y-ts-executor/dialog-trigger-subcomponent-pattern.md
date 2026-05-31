---
name: dialog-trigger-subcomponent-pattern
description: Pattern for wiring a DialogTrigger subcomponent that exposes aria-expanded, aria-haspopup, and aria-controls to assistive tech without introducing context or breaking the controlled Dialog.
metadata:
  type: project
---

For modal dialog triggers the correct ARIA contract is `aria-haspopup="dialog"` + `aria-expanded={open}` + `aria-controls={dialogId}`.

Key decisions made for artui's `DialogTrigger`:

1. `controls: string` and `open: boolean` are both **required** — no defaults, compile error if omitted. This makes `aria-expanded` impossible to forget.
2. `AccessibleNameProps` is intersected into `DialogTriggerProps` so the trigger button always has an accessible name (children | aria-label | aria-labelledby).
3. `aria-haspopup`, `aria-expanded`, `aria-controls`, and `type` are blocked via `Omit<ButtonHTMLAttributes, BlockedTriggerAttrs>` — consumers cannot override the ARIA contract.
4. `type="button"` is hard-coded internally to prevent accidental form submission.
5. Ref is forwarded — consumers pass it as `Dialog`'s `returnFocusRef` so focus returns reliably to the trigger after close.
6. Dev guard uses `useEffect([], [])` (mount-only, empty deps with eslint-disable comment) to check `document.getElementById(controls)` — if unresolved, logs `console.error` (NOT `withErrorOverlay`). Consistent with existing Dialog `aria-labelledby` guard style.
7. `Dialog` gained an optional `id` prop applied directly to the `<dialog>` element — no auto-generated fallback, intentionally. Consumers wire id manually.
8. `Dialog` stays fully usable without `DialogTrigger` — no context, no coupling.

**Why:** The audit finding was that `aria-expanded` was never exposed on the trigger button, so AT users had no programmatic indication of open/closed state. The controlled pattern means Dialog cannot manage this itself — the trigger is consumer-owned.

**How to apply:** When adding any "trigger + controlled panel" subcomponent pair, follow this pattern: required `open` prop drives ARIA state, required `controls` prop drives `aria-controls`, blocked attrs prevent contract drift, ref is always forwarded for focus management.
