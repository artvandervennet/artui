---
name: native-details-accordion-gaps
description: What native <details>/<summary> covers vs. what an accessibility-first accordion still has to add.
metadata:
  type: reference
---

When planning a `<details>`-backed accordion (or any disclosure primitive), this is the as-of-2026 division of labor.

**Native `<details>`/`<summary>` covers for free:**

- 1.3.1 trigger↔panel programmatic association (implicit DOM relationship; AX tree exposes it).
- 1.3.1 hidden-when-closed (UA stylesheet hides non-`<summary>` children from the AX tree when no `open` attribute).
- 1.3.3 decorative marker (UA `::marker` / `::-webkit-details-marker`; disable via `summary { list-style: none; }` if shipping a custom chevron).
- 2.1.1 Enter / Space toggle.
- 2.4.7 focus visible (native focus on `<summary>`).
- 4.1.2 expanded/collapsed state (via `open` attribute + implicit button role on summary).

**Native does NOT cover, you must add:**

- Single-expand coordination across siblings. Native `name=""` on `<details>` (Baseline newly-available 2024) handles this in supporting browsers; ship a JS `toggle`-event fallback for non-supporting webviews (and for controlled-mode `onValueChange`).
- Up/Down/Home/End across summaries. Native gives Tab only. Add a root-level keydown handler delegating by `event.target.matches('summary[data-...]')`.
- Heading semantics. `<summary>` is not a heading. Place `<hN>` *inside* the `<summary>` (flow content is allowed) — do NOT wrap `<details>` in `<hN>` (invalid: summary must be first child of details).
- Panel-text-not-announced fix. After user-initiated open, move focus to the Panel (`tabIndex={-1}`, `role="region"`, `aria-labelledby={summaryId}`). Detect user-initiated via a ref set on `pointerdown`/`keydown(Enter|Space)` on the summary and consumed by the `toggle` event handler. Programmatic / controlled changes must NOT move focus.
- `role="region"` only when the accordion has ≤6 items (APG landmark-proliferation guidance).
- Defensive mirrors of `aria-expanded` and `aria-controls` on the summary — older NVDA/JAWS builds didn't reliably surface the implicit state.

**Known footgun:** if a consumer mutates `details.open` from inside a click handler on the summary, the user-initiated ref will be set and the focus-into-Panel effect will fire even though the change was technically programmatic. Document this in the component's JSDoc.

Compose this with [[registry-runtime-guard-convention]] and [[compound-component-conventions]] when producing the actual plan.
