---
name: details-controlled-sync-pattern
description: How to sync React controlled state to native <details> open attribute without feedback loops
metadata:
  type: feedback
---

When building a controlled accordion on native `<details>/<summary>`, a naive `useEffect([isOpen])` that writes `details.open = isOpen` in both controlled and uncontrolled modes creates a feedback loop:

- Native toggle event fires → React state updates → effect runs → writes `details.open` → fires another toggle event → repeat

**Fix**: Only sync `details.open` in controlled mode. In uncontrolled mode, the native toggle event IS the source of truth for the DOM; React state tracks `aria-expanded` but must not write back to `details.open`.

```tsx
// Controlled-only sync — avoids feedback loop in uncontrolled mode
useEffect(() => {
  if (!isControlled) return;
  if (detailsRef.current && detailsRef.current.open !== isOpen) {
    detailsRef.current.open = isOpen;
  }
}, [isControlled, isOpen]);
```

**How to apply**: Any `<details>`-based disclosure/accordion component that supports both controlled and uncontrolled state.
