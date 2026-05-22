---
name: jsdom-details-toggle-pitfall
description: jsdom <details> toggle event pitfalls that break accordion tests and how to work around them
metadata:
  type: feedback
---

Two critical jsdom quirks when testing `<details>`-based components:

1. **Name-attribute exclusive accordion side effect**: If you set `details.open = true` in a test helper and multiple `<details>` elements share a `name` attribute (artui accordion uses a shared `groupName` for single-expand), jsdom may fire spurious `toggle` events on sibling details. This causes state corruption in uncontrolled mode.

   **Fix**: In test helpers, never set `details.open`. Instead dispatch the toggle event directly without touching the `open` property:
   ```tsx
   async function fireToggle(details, newState) {
     await act(async () => {
       const event = new Event("toggle");
       Object.defineProperty(event, "newState", { value: newState, writable: false });
       details.dispatchEvent(event);
     });
   }
   ```

2. **React synthetic events not triggered by native dispatch**: `element.dispatchEvent(new PointerEvent(...))` bypasses React's synthetic event system. Use `fireEvent.pointerDown(element)` from @testing-library/react instead.

**How to apply**: Use this pattern any time you need to test a `<details>`/`<summary>`-based accordion or disclosure in this registry.
