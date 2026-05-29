# @artui/registry

## 0.8.1

### Patch Changes

- 25780fc: refactor code structure for improved readability and maintainability

## 0.8.0

### Minor Changes

- bceb557: fixed some bugs

### Patch Changes

- 489fbc0: fixed order of items

## 0.7.1

### Patch Changes

- bbfb680: fixed css

## 0.7.0

### Minor Changes

- 8061bb6: Add Select component — a dual-mode, native-`<select>`-backed accessible select control.

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

- 8061bb6: Add Slider component — accessible single-thumb and two-thumb range primitive following the WAI-ARIA APG Slider and Slider (Multi-Thumb) patterns. Per-thumb accessible names enforced at compile time via the `readonly [SliderThumbDescriptor, SliderThumbDescriptor]` tuple; passing empty thumb descriptors is a type error. `aria-valuetext` wired automatically from `formatValue` for non-numeric domains (currencies, weekdays, labels). When a thumb's value crosses the other thumb's via keyboard or pointer drag, focus and value-identity transfer seamlessly to the other thumb so the gesture continues without releasing and re-grabbing. Per-thumb `aria-valuemin` / `aria-valuemax` recompute on every render so each thumb's reported range stays consistent with the current ordering. `aria-disabled` used instead of `disabled` so AT can still inspect the thumb. `prefers-reduced-motion` gates all track-fill and thumb-position transitions. Focus indicators use `outline` (not `box-shadow`) for Windows High Contrast Mode. 44×44 CSS px hit area via `::before` pseudo-element. Five dev-overlay runtime guards: missing thumb names, out-of-range values, range slider without a group label, invalid `step`, and `value`/`thumbs` arity mismatch.

## 0.6.0

### Minor Changes

- 58924d8: Add Toast component — transient-notification primitive built on the native Popover API (`popover="manual"`) so the browser owns top-layer stacking and Toast never fights z-index with modals or other floating UI. Two persistent live regions are mounted by `ToastProvider` before any toast is shown: a `role="status"` polite region for `info`/`success` and a `role="alert"` assertive region for `warning`/`error` — toasts append into the matching region so AT announces without focus moving, satisfying 4.1.3 by construction. Auto-dismiss timer is genuinely 2.2.1-compliant: pauses on `pointerenter`, `focusin`, `document.visibilityState !== 'visible'`, and `prefers-reduced-motion: reduce`; toasts with an `action` clamp to a 10 s minimum; `duration: null` means persistent; close button is always present. No focus theft (2.1.1): Toast never auto-focuses; `Alt+T` moves focus into the newest toast on demand, `F6` uses native landmark cycling, `Esc` dismisses the focused toast with `stopPropagation()` so it doesn't also close an underlying modal. Focus is captured on `show()` and restored on dismiss/action/Esc (2.4.3), unless the user moved on. Type is conveyed via colour, icon, AND a visually-hidden `"Success: " | "Error: " | "Warning: " | "Information: "` prefix in the live-region text (1.4.1); action/close buttons use `outline` not `box-shadow` for Windows High Contrast (2.4.7) and meet 44×44 px (2.5.5). Polyfill fallback: when the Popover API is unsupported, regions fall back to fixed-positioned containers with a high z-index — semantics unchanged. Compile-time enforcement: `title` and `action.label` are generic `AccessibleText<T>` so empty/whitespace/placeholder strings like `""` or `"image"` are rejected at the call site. Four runtime dev-overlay guards: `useToast()` outside provider (throws), multiple `ToastProvider` instances mounted, region missing at fire time, error toast with finite duration < 10 s and no action.

## 0.5.0

### Minor Changes

- cb4f6e5: Add Accordion component — accessible disclosure pattern built on native `<details>` / `<summary>` and improved to close the gaps native leaves open. Foundation gives 1.3.1 trigger↔panel association, 1.3.1 closed-panel-hidden, 2.1.1 Enter/Space toggling, and 4.1.2 state for free. Layered on top: single-expand coordination across siblings (via the native `name=""` attribute plus a `toggle`-event JS fallback for non-supporting webviews), full APG keyboard contract across summaries (Up/Down/Home/End with wrap, skip disabled), and — most importantly — focus moves into `Accordion.Panel` on user-initiated expand so the screen reader actually announces the disclosed content, fixing the "panel text not announced" gap found across every major library (Chakra, PrimeReact, shadcn, MUI). Compile-time accessible-name enforcement on `Accordion.Trigger` via `AccessibleNameProps`; required `headingLevel` prop (no default) forces the consumer to align the accordion with their page outline. Four dev-overlay runtime guards: item-without-trigger, item-without-panel, duplicate-values, empty.

  Improved docs

- cb4f6e5: improved docs

## 0.4.0

### Minor Changes

- 9cf6063: Add DropdownMenu component — accessible dropdown following the WAI-ARIA APG Menu Button pattern with single-level submenus, full keyboard contract (arrows, Home/End, typeahead, Escape, ArrowRight/Left for sub-menus), compile-time accessible name enforcement via AccessibleNameProps, and five dev-overlay runtime guards.

  Fix Dialog NVDA blank-read bug — the Dialog component previously unmounted its native `<dialog>` element while it was still in `showModal()` modal state, causing NVDA's virtual buffer to get stranded with no content to read. The `<dialog>` is now always kept in the DOM; `.close()` is called via a dedicated close-transition effect before any unmount can occur.

## 0.3.0

### Minor Changes

- 0a13d07: refactor(styling): per-component CSS files with modern CSS

  Every component now ships its own `<name>.css` file alongside `<name>.tsx` instead of inlining a `STYLE` template string and injecting it into `<head>` at runtime. The new files use native CSS nesting and logical properties (`margin-block-end`, `inset-inline-end`, `padding-inline`) throughout, and each declares its component-scoped custom properties in a `:root` block at the top. Class names are unchanged — consumers who already styled around `.artui-dialog`, `.artui-dp-*`, etc. keep working without modification.

  Consumers who reinstall via the CLI receive the new `.css` files automatically. Consumers who hand-copied component sources previously will need to copy the new `.css` file and delete the old `injectStyle()`/`STYLE` block.

- 0a13d07: feat(dialog): add accessible Dialog component

  Native `<dialog>` with `showModal()` providing browser-managed focus trap, top-layer rendering, and Escape handling. Discriminated-union props enforce exactly one label source (`title` or `aria-labelledby`) at compile time. Three runtime dev overlays cover empty children (WCAG 1.3.1), unfocusable body content (WCAG 2.1.1), and unresolvable aria-labelledby (WCAG 4.1.2). A hidden sentinel close button guarantees at least one focus stop. Focus is captured on open and restored on close.

## 0.2.1

### Patch Changes

- aba3bfc: Promote Datepicker from beta to stable.

## 0.2.0

### Minor Changes

- c380c97: Registry versioning + docs coupling. The registry now stamps its `package.json` version into `registry.json`, and the docs site publishes an immutable snapshot at `/registry/v<version>/registry.json` alongside the existing `/registry.json` "latest". The CLI accepts an optional `version` field in `components.json` to pin installs to a specific registry release, and validates that the fetched registry's version matches the pin. The docs site shows a registry-version badge and an install banner with the matching `components.json` snippet so docs and CLI always agree.

## 0.1.0

### Minor Changes

- a8cd519: Add Datepicker: accessible date input + calendar popup (issue #3).

  Follows the WAI-ARIA APG Date Picker Dialog pattern. Passes all 9 WCAG criteria that no peer library (Chakra UI, PrimeReact, shadcn/ui, Ant Design, MUI) satisfies simultaneously:

  - 1.3.1 — text input is a first-class entry path; errors wired via `aria-describedby`
  - 2.1.1 — full keyboard navigation including arrow keys, Home/End, PageUp/Down
  - 2.1.2 — no focus trap; Escape always exits; selecting a date also exits
  - 2.4.3 — `role="dialog"` with `aria-labelledby` pointing at the month/year `<h2>`
  - 2.4.7 — `outline`-based focus rings visible in Windows High Contrast Mode
  - 3.3.1 — invalid date errors and external `error` prop both use `aria-describedby`
  - 3.3.2 — compile-time enforcement: exactly one of `label`, `aria-label`, or `aria-labelledby` required
  - 4.1.2 — `aria-selected`, `aria-current="date"`, `aria-haspopup`, `aria-expanded` all wired
  - 4.1.3 — `aria-live="polite"` region announces month changes

  Runtime dev-overlay guards (same `withErrorOverlay` pattern as `Image`):

  - `min > max`
  - `value` outside `[min, max]`
  - `isDateDisabled(value)` returns true for the current value
  - Invalid BCP-47 `locale` prop

  Status: `beta`
