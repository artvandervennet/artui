---
name: accessible-name-props-shape
description: The exact shape of AccessibleNameProps and how to combine it with other optional props.
metadata:
  type: reference
---

`AccessibleNameProps` from `registry/lib/a11y-types.ts` is a three-way discriminated union:

```ts
type AccessibleNameProps =
  | { children: AccessibleText; "aria-label"?: never; "aria-labelledby"?: never }
  | { children?: never; "aria-label": AccessibleText; "aria-labelledby"?: never }
  | { children?: never; "aria-label"?: never; "aria-labelledby": string };
```

`AccessibleText` rejects empty strings and placeholders (`"image"`, `"icon"`, `"photo"`, `"logo"`, plus case variants) at compile time.

**Combining with optional props** (e.g. `className`, `disabled`): use intersection — `AccessibleNameProps & { className?: string; disabled?: boolean }`. TypeScript distributes the intersection over each union branch. This is the working pattern at `registry/components/dropdown-menu/dropdown-menu.tsx:191`.

**Do NOT** add new keys directly into a copy of the union — flattening it into a single object type defeats the "exactly one of children / aria-label / aria-labelledby" guarantee.

When a component requires an accessible name (Trigger, IconButton, Modal close, etc.), use `AccessibleNameProps` as the base. See [[registry-runtime-guard-convention]] for the matching Tier-3 layer when runtime values still slip through (e.g. a dynamic string that evaluates to a placeholder at runtime — currently no helper exists to detect this; plans must either propose a new check or accept the gap).
