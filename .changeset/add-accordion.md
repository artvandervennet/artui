---
"@artui/registry": minor
"@artui/cli": minor
---

Add Accordion component — accessible disclosure pattern built on native `<details>` / `<summary>` and improved to close the gaps native leaves open. Foundation gives 1.3.1 trigger↔panel association, 1.3.1 closed-panel-hidden, 2.1.1 Enter/Space toggling, and 4.1.2 state for free. Layered on top: single-expand coordination across siblings (via the native `name=""` attribute plus a `toggle`-event JS fallback for non-supporting webviews), full APG keyboard contract across summaries (Up/Down/Home/End with wrap, skip disabled), and — most importantly — focus moves into `Accordion.Panel` on user-initiated expand so the screen reader actually announces the disclosed content, fixing the "panel text not announced" gap found across every major library (Chakra, PrimeReact, shadcn, MUI). Compile-time accessible-name enforcement on `Accordion.Trigger` via `AccessibleNameProps`; required `headingLevel` prop (no default) forces the consumer to align the accordion with their page outline. Four dev-overlay runtime guards: item-without-trigger, item-without-panel, duplicate-values, empty.

Improved docs
