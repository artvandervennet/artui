---
name: label-registry-state-vs-ref
description: Use React state (not ref) for child label registries so siblings re-render when labels arrive via useEffect
metadata:
  type: project
---

When Options register their labels via `useEffect` (post-paint), the Tags component must re-render to pick up those labels. A `useRef<Map>` won't trigger re-renders — use `useState<Record<string,string>>` instead.

Guard against infinite loops: only call `setOptionLabels` when the label actually changed:

```typescript
const registerOption = useCallback((value: string, label: string) => {
  setOptionLabels((prev) => {
    if (prev[value] === label) return prev; // no-op if unchanged
    return { ...prev, [value]: label };
  });
}, []);
```

Mirror into a ref (`optionLabelsRef`) for event handlers that must read the current map synchronously without stale closures.

**Why:** Tags showed raw values ("Remove be") instead of labels ("Remove Belgium") because a ref update doesn't cause Tags to re-render.

**How to apply:** Any compound component with sibling-consumer/child-registrant pattern (e.g. Combobox, Select, MultiSelect).

Related: [[always-mounted-content-pattern]]
