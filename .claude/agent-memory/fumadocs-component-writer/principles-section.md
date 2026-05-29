---
name: principles-section
description: Structure and content of the Principles docs section under apps/docs/content/docs/principles/
metadata:
  type: project
---

The Principles section lives at `apps/docs/content/docs/principles/` and contains four pages wired via a local `meta.json`. The root `content/docs/meta.json` is NOT touched — navigation is wired by an orchestrator separately.

Pages and their key content:
- `enforcement-hierarchy.mdx` — the 3-tier model (API shape → TypeScript error → dev overlay). No Tier 4 shipped yet. Uses a markdown table for dev-overlay conditions. Cross-links to Image, Slider, Dialog, FAQ.
- `native-elements-first.mdx` — `<details>/<summary>` (Accordion), `<dialog>` with `showModal()` (Dialog), `<input type="date">` (Datepicker). Rule: ARIA only when no native element exists. Cross-links to Accordion, Dialog, FAQ.
- `verbatim-distribution.mdx` — CLI copies source verbatim; guards travel with the code; no cross-component imports; no deps on packages/ or apps/; plain CSS not Tailwind. Cross-links to Getting Started, FAQ, enforcement-hierarchy, how-to/override-styles.
- `conventions.mdx` — `Object.assign` namespace export, root context with throw-if-missing hook, child registration via useEffect+cleanup, CSS custom properties from `artui-tokens.css`, named exports only, `process.env.NODE_ENV` dev guards. Cross-links to enforcement-hierarchy, how-to/theme, how-to/override-styles, Accordion.

**Why:** These pages use prose + code blocks + `<FeatureGrid>`/`<CardLink>` for navigation. No `<PropsTable>`, `<KeyTable>`, `<Do>`, or `<Dont>` — those are component-doc patterns. No playground tags. `<WcagTable>` was considered for enforcement-hierarchy but a markdown table was used instead because the rows contain simple string columns.

Related: [[fumadocs-conventions]], [[project-fumadocs-conventions]]
