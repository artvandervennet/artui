---
name: dev-guard-useeffect-empty-deps
description: Slider-style dev guards run in useEffect([]) — they fire once on mount, not on every render; dedup via reported Set is not needed for mount-only guards
metadata:
  type: project
---

Slider's dev guards (Slider:invalid-step, Slider:value-out-of-range, Slider:range-without-group-name, etc.) use `useEffect(fn, [])` — they fire once on mount. Accordion used `setTimeout(0)` inside useEffect for guards that needed to wait for child registration. Slider guards don't need that because they only read from initial props. The `withErrorOverlay` wrapper (which uses the de-dup `reported` Set) is only needed for guards that wrap DOM elements; pure `console.error` guards in a `useEffect([])` don't need the Set because they only run once.

**Why:** Using `useEffect([])` for one-time mount guards is simpler than the `useEffect + setTimeout` pattern — only use the setTimeout variant when waiting for child registrations (like Accordion items).

**How to apply:** For future components with mount-time-only guards, use `useEffect(fn, [])` directly.
