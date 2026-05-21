---
name: reference-issue-conventions
description: How new-component issues are titled, labeled, and structured in the artui repo
metadata:
  type: reference
---

New-component proposals on artui follow a strict house style — match it exactly, do not invent fields.

**Template:** `.github/ISSUE_TEMPLATE/feature.yml` (label `enhancement`). It has four textareas: *What problem does this solve?*, *Proposed API*, *Accessibility considerations*, *Alternatives considered*. Only the first is required; the others are expected to be filled in for component proposals.

**Title:** `Add <Component Name> component to registry` (see issues #10, #13, #16). Title-case the component name.

**Labels to pass to `gh issue create`:** `enhancement,accessibility,component:new`. The template only auto-adds `enhancement`; the other two are convention.

**Body conventions (modeled on issues #13 and #16):**
- Open *What problem does this solve?* with WCAG/thesis-survey context, not implementation. Include a comparison table of how Chakra / PrimeReact / Shadcn / MUI / Ant fare on the relevant WCAG rows when the data exists.
- *Proposed API* uses a `ts` block for the props type and a `tsx` block for the usage example. Reference `AccessibleNameProps` from `registry/lib/a11y-types.ts` for anything that needs a name.
- *Accessibility considerations* uses the four-tier framework from `.claude/skills/plan-a11y/SKILL.md` and the [[reference-a11y-tier-model]] hierarchy: WCAG table -> Tier-3 runtime guards (with `withErrorOverlay` keys named `Component:problem-slug`) -> Tier-4 fatal fallback -> Keyboard contract -> Focus management -> ARIA -> Reduced motion/contrast.
- *Alternatives considered* is a two-column table covering Radix, Headless UI, React Aria, shadcn, plus whichever thesis-benchmarked libraries are relevant, ending with the native HTML option if one exists.

**File the body via `--body-file`, not heredoc.** Heredocs on Windows bash mangle backticks and tables; write a temp markdown file, then `gh issue create --body-file <path>` and delete the temp file. Do not commit the temp file.
