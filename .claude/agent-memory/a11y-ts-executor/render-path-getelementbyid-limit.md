---
name: render-path-getelementbyid-limit
description: document.getElementById in render body returns null for sibling elements not yet committed — aria-labelledby DOM checks must go in useEffect
metadata:
  type: feedback
---

Never call `document.getElementById` in a component's render body to validate an `aria-labelledby` attribute that may point to a sibling element rendered in the same tree.

At React render time, sibling elements have not yet been committed to the real DOM, so `document.getElementById` returns null even when the element is present in the virtual tree. This causes false-positive overlay triggers on valid sibling ids.

**Why:** Discovered during Slider `Slider:range-without-group-name` guard implementation. Test `<div><span id="range-lbl">...</span><Slider aria-labelledby="range-lbl" /></div>` triggered the overlay incorrectly because the span hadn't been committed when Slider's render ran.

**How to apply:** `aria-labelledby` DOM-resolution checks must go in `useEffect` (fires after commit). They can only call `console.error` — no `withErrorOverlay` is possible for this variant. The "no label at all" variant (no aria-label and no aria-labelledby) CAN use `withErrorOverlay` in the render path because it requires no DOM lookup. See `registry/components/slider/slider.tsx` and `registry/components/dialog/dialog.tsx` for examples of both patterns in the same component.
