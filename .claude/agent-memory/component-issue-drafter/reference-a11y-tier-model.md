---
name: reference-a11y-tier-model
description: The four-tier accessibility enforcement model artui uses, and how it shows up in component issues
metadata:
  type: reference
---

artui sorts every accessibility guarantee a registry component makes into one of four tiers. New-component issues are expected to map each WCAG row to a tier so the implementation plan is unambiguous. Source: `.claude/skills/plan-a11y/SKILL.md`.

- **Tier 1 — Structural / always-on.** The component renders the right element, role, or relationship attribute unconditionally. Examples: native `<button>`, `role="region"`, `aria-controls`, focus-visible outline.
- **Tier 2 — Compile-time.** A TypeScript type makes the bad shape un-typeable. Almost always `AccessibleNameProps` from `registry/lib/a11y-types.ts` (forces `children` | `aria-label` | `aria-labelledby` for any interactive element with a name). `AccessibleText` rejects empty / placeholder strings.
- **Tier 3 — Dev overlay.** `withErrorOverlay` from `registry/lib/dev-overlay.tsx` fires in dev only when a runtime invariant is violated (empty Content, duplicate values, item without trigger, etc.). Each guard has a stable key `Component:problem-slug` and a documented production fallback so users are not harmed when the overlay is gone.
- **Tier 4 — Fatal fallback.** Reserved for catastrophic, otherwise-undetectable cases. Most components have *none* because Tier 2 + Tier 3 cover everything.

When drafting the *Accessibility considerations* section, the WCAG table's "Tier" column should reference these labels directly. See issues #13 (DropdownMenu) and #16 (Accordion) for the canonical shape.

Related: [[reference-issue-conventions]].
