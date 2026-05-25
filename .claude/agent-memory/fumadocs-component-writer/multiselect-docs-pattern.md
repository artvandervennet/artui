---
name: multiselect-docs-pattern
description: Documentation patterns established while writing the Multiselect Fumadocs page — keyboard section split, live-region prose placement, playground toggle choices
metadata:
  type: project
---

Keyboard section split into two H3 groups (Trigger and Listbox) because the key contracts genuinely differ: trigger handles Backspace-removes-last, listbox handles Arrow/Home/End/Space/Enter/Escape/Tab/typeahead. Post-table prose notes the APG no-wrap behaviour and live-region announcement format.

Playground toggles: selection mode (uncontrolled/controlled), disabled option (shown/hidden), component (enabled/disabled). Controlled value is shown as a readable `[...]` string so users can see state changes in real time.

The `@artui/registry` `index.ts` must be updated to export new components before the playground can import them — the docs playground imports from `@artui/registry`, not a local path.

`mdx-components.tsx` requires both an import line AND an entry in the returned object — easy to add the import and miss the object key.

**Why:** Discovered during Multiselect doc authoring.
**How to apply:** For every new component: (1) add export to registry/index.ts, (2) write playground, (3) add import + object key to mdx-components.tsx, (4) add slug to meta.json, (5) write MDX.
