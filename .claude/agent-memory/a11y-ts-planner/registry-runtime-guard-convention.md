---
name: registry-runtime-guard-convention
description: How Tier-3 dev-only a11y guards are implemented in the artui registry (withErrorOverlay, not devWarn).
metadata:
  type: project
---

Registry runtime guards (Tier 3) are implemented exclusively via `withErrorOverlay` from `registry/lib/dev-overlay.tsx` — not `devWarn` / `registry/lib/dev-warn.ts`.

**Why:** the `plan-a11y` skill doc (`.claude/skills/plan-a11y/SKILL.md`) still references `registry/lib/dev-warn.ts` and a `devWarn` function, but that file does not exist in this repo. The actual convention used by Dialog, DropdownMenu, and Datepicker is `withErrorOverlay`. It wraps the offending element in a red full-coverage overlay (aria-hidden, pointer-events:none) and emits a deduplicated `console.error`. No-op in production.

**How to apply:** when producing plans, cite `withErrorOverlay` and the file path `registry/lib/dev-overlay.tsx`. Do not reference `devWarn` or `registry/lib/dev-warn.ts` even though [[plan-a11y-skill]] still mentions them — they don't exist. Each guard needs `{ key, component, wcag?, message }`. Use stable keys like `Component:short-key` for dedup. See `registry/components/dropdown-menu/dropdown-menu.tsx:271-278` and `dialog.tsx:262-268` for canonical usage.

Tier-4 fatal fallback (`renderA11yError` / `registry/lib/render-a11y-error.tsx`) also doesn't exist. The registry's practice is "Tier 4: none — every catastrophic case caught at the type level via [[accessible-name-props-shape]]."
