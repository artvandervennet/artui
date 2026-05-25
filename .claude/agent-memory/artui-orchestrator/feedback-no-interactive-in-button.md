---
name: no-interactive-in-button
description: Token/combobox-style fields must use a div container, not a button — interactive elements cannot nest inside a button
metadata:
  type: feedback
---

When a component needs chips (each with a remove `<button>`) plus a trigger `<button>` in the same visual field, the container MUST be a presentational `<div>`, never a `<button>`. Nesting `<button>` inside `<button>` is invalid HTML and breaks AT (NVDA/JAWS read the outer button, skip inner ones).

**Why:** Multiselect redesign — original plan considered `<button>` as container; planner correctly flagged this as a structural HTML violation before implementation started.

**How to apply:** Any component with multiple interactive children inside a shared visual boundary (combobox, token input, date range field) → use `<div>` as the container, give it `data-disabled` for CSS, and let each interactive child manage its own `disabled` attribute and focus ring. Clicking the blank area opens the panel via `onPointerDown` on the div, guarded against clicks on interactive children.
