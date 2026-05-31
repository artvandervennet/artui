---
name: live-region-just-opened-guard
description: When two useEffect hooks both write to the same live region and one must win on open, use a ref flag to suppress the second effect on the first render.
metadata:
  type: feedback
---

When a component has two `useEffect` hooks that both call `setLiveText`:
1. An on-open effect that announces the current selection ("May 15, 2026 selected").
2. A heading-change effect that announces month navigation.

Both fire on the same render cycle when the calendar opens — the second clobbers the first.

**Fix:** Set `justOpenedRef.current = true` inside the open effect. In the heading-change effect, check the ref, skip the announcement, and clear the flag:

```tsx
// open effect
useEffect(() => {
  if (!isOpen) return;
  justOpenedRef.current = true;
  setLiveText(/* selection announcement */);
}, [isOpen, value, resolvedLocale]);

// heading-change effect
useEffect(() => {
  if (!isOpen) return;
  if (justOpenedRef.current) { justOpenedRef.current = false; return; }
  setLiveText(headingText);
}, [headingText, isOpen]);
```

**Why:** React batches effects in declaration order in the same commit, so the second effect always wins without the guard.

**How to apply:** Any time multiple effects share a live region and have a priority ordering that must hold on first render.
