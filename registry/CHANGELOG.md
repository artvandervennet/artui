# @artui/registry

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
