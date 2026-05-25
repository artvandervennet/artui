---
"@artui/registry": minor
---

Add Select component — a dual-mode, native-`<select>`-backed accessible select control.

**Mode discriminant.** A single `multiple` boolean prop is the TypeScript discriminant between the two modes, giving each a fully separate prop surface at the type level.

**Single mode** (no `multiple` prop). Renders a real, styled native `<select>` element. No custom panel, no chips — just a semantically correct select that delegates all keyboard navigation and form behaviour to the browser. Accessible name is required at compile time via `AccessibleNameProps` on the root (`aria-label` or `aria-labelledby`). Supports `name`, `disabled`, controlled `value`/`onValueChange` (string), and `defaultValue`. Option children become `<option>` elements; Group children become `<optgroup>` elements.

**Multi mode** (`multiple={true}`). A hidden `<select multiple>` acts as the form and value source of truth, while a `Select.Control` field provides the interaction layer. The Control renders a single fixed-width bordered field — a presentational `div` — split into a flexible field region (chips inline + label/placeholder, which wraps onto new rows) and a pinned actions region (an optional clear-all `<button>` followed by the open/close trigger `<button>` with its decorative caret `▾`). The field keeps a stable width and only the chips wrap; the clear-all and caret never move. The clear-all button precedes the trigger in tab order. All interactive elements are DOM siblings inside the div, never nested inside a `<button>`, making the HTML valid and compatible with all assistive technology.

- **Control** (`Select.Control`) — the unified field. `AccessibleNameProps` on Control enforces an accessible name on the trigger at compile time (one of `aria-label`, `aria-labelledby`, or `children` — TypeScript error otherwise). `placeholder` shows inside the trigger when nothing is selected; hidden when chips are present. `removeLabel` customises each chip's remove-button accessible name. `showClearAll`/`clearAllLabel` opt-in to a clear-all button.
- **Content** (`Select.Content`) — wraps both render passes: native slot (options into the hidden `<select multiple>`) and custom slot (ARIA listbox). The listbox opens as a non-modal floating overlay (`position: fixed`, anchored to the field) so it never reflows the page; it repositions on scroll/resize and stays open while the option list scrolls internally. Guards against empty Content, duplicate Option values, empty/whitespace Option labels at runtime via `withErrorOverlay`.
- **Option** — reads slot context to render either `<option>` (native) or `role="option"` div (custom). Label registration runs in the native pass only.
- **Group** (`Select.Group label="…"`) — renders `<optgroup>` in native slot and `role="group"` with a visually-hidden header in the custom slot. Dev overlay fires for empty group labels.

**Keyboard contract (multi mode).** Arrow Up/Down navigate options (no wrap). Home/End jump to ends. Space/Enter toggle without closing. Escape and Tab close and return focus to trigger. Printable-character typeahead. Backspace on trigger removes last chip. When the last chip is removed (via remove button or Backspace), focus is rescued to the trigger.

**Announcements.** A visually-hidden `aria-live="polite"` region announces every selection change (e.g. "React added, 2 selected") and clear-all ("All selections cleared").

**Visual accessibility.** Selection conveyed by checkmark icon (not colour alone). Field focus ring shown only on keyboard focus via `:has(.artui-select-trigger:focus-visible)` — mouse clicks do not show the ring. Individual chip remove and clear-all buttons have `:focus-visible` outlines. `forced-colors` block preserves Windows High Contrast Mode. 44 px minimum touch targets on field, remove buttons, and clear-all. Chip entrance animation gated behind `prefers-reduced-motion: no-preference`.
