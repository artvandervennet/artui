---
"@artui/registry": minor
---

Accessibility audit fixes across Datepicker, Dialog, Accordion, and Select.

**Datepicker**

- On open, focus now lands on the previous-month button and the current selection is announced via the live region ("15 May 2026 selected" / "No date selected") (WCAG 2.4.3).
- Arrow-key day navigation moves focus synchronously (no post-render lag), and the focused day now has a distinct `:focus-visible` ring so it is visibly tracked while navigating (WCAG 2.1.1, 2.4.7).
- Grid cells now report `aria-selected="false"` when unselected instead of omitting the attribute (WCAG 4.1.2).
- Invalid-date errors are now specific — e.g. "30 February isn't a valid date. Enter a valid date in MM/DD/YYYY format." and "Month must be 1–12. …" — instead of a generic message (WCAG 3.3.1).

**Dialog**

- New `DialogTrigger` subcomponent (exported alongside `Dialog`) that wires `aria-haspopup="dialog"`, `aria-expanded` (reflecting open state), and `aria-controls` automatically. `Dialog` gains an optional `id` prop so the trigger's `aria-controls` resolves to the `<dialog>` element. Consumers keep owning the `open` state (WCAG 4.1.2).

**Accordion**

- Disabled item headers are removed from the tab order (`tabIndex={-1}`); `aria-disabled` alone left them focusable, which caused screen readers to announce the previously-focused item. Tab now skips disabled headers, matching the existing arrow-key behavior.

**Select (multi mode)**

- Tab order corrected: the combobox trigger is now the first tab stop, with chip remove buttons reached afterward (DOM reordered; visual layout preserved via CSS `order`).
- The trigger now has an `aria-describedby` summary of the current selection ("3 selected: Apple, Banana, Cherry" / "None selected") announced when focus lands on it (WCAG 1.3.1).
