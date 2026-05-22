---
name: dev-guard-timing-pattern
description: Pattern for deferred dev-time guards that depend on child registration via useEffect
metadata:
  type: feedback
---

Dev-time validation that depends on child components having registered themselves (via `useEffect`) cannot run synchronously at mount time — the parent's effects run before children's effects in some trees, but after in others depending on React's scheduling.

**Fix**: Wrap dev guards in `useEffect` + `setTimeout(..., 0)` to defer until after all sibling/child registration effects have flushed:

```tsx
useEffect(() => {
  if (!isDev) return;
  const id = setTimeout(() => {
    if (!hasTriggerRef.current) {
      console.error(`[artui] <Accordion.Item> missing trigger...`);
    }
    if (registeredValuesRef.current.filter(v => v === value).length > 1) {
      console.error(`[artui] duplicate value...`);
    }
  }, 0);
  return () => clearTimeout(id);
}, []);
```

In tests, flush the deferred guards with:
```tsx
await new Promise(resolve => setTimeout(resolve, 0));
```

**How to apply**: Any registry component with parent-validates-children dev overlays. See `accordion.tsx` for the reference implementation.
