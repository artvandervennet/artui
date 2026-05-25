---
name: always-mounted-content-pattern
description: Always-mount listbox/popup content with hidden+aria-hidden so child Options register their labels even when closed
metadata:
  type: project
---

When a compound component's Tags/summary needs to display option labels (e.g. "Remove Belgium"), the Option children must be mounted even when the panel is closed so their useEffect label-registration runs.

Pattern: render Content unconditionally with `hidden={!open}` and `aria-hidden={!open}`. This keeps Options in the DOM (so they mount and register) while hiding them from both layout and the ARIA tree.

```tsx
<div
  role="listbox"
  hidden={!open}
  aria-hidden={!open}
  ...
>
  {children}
</div>
```

**Why:** Tags renders before Options in tree order. Without always-mounting, Options never register their labels when the panel starts closed (e.g. `defaultValue={["be"]}` on load), so Tags shows raw values ("be") instead of labels ("Belgium").

**How to apply:** Any compound component where a sibling consumes child-registered data (labels, counts, etc.) and the children live inside a conditionally-visible panel.

Related: [[label-registry-state-vs-ref]]
