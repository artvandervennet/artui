# @artui/registry

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
