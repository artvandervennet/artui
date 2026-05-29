---
name: how-to-guides-pattern
description: Conventions for the How-to Guides section under apps/docs/content/docs/how-to/ — page structure, verified facts about dev-overlay, tokens, and "use client" requirements
metadata:
  type: project
---

## How-to Guides section

Files live under `apps/docs/content/docs/how-to/`. The orchestrator wires nav at the root `meta.json` level; each subfolder owns its own `meta.json`.

### meta.json shape
```json
{ "title": "How-to Guides", "pages": ["theme", "override-styles", "framework-setup", "testing-a11y"] }
```

### Page order and slugs
- `theme` — artui-tokens.css token reference + dark mode + override pattern
- `override-styles` — editing copied CSS/TSX, component-specific tokens
- `framework-setup` — Next.js App Router, Vite, Remix wiring
- `testing-a11y` — withErrorOverlay pattern, vitest spy recipe

### Verified source facts (read from registry/)

**dev-overlay.tsx**
- Exports: `withErrorOverlay(element, { key, component, wcag?, message })` and `__resetDevOverlayCache()`
- De-duplication via a module-level `Set<string>`; call `__resetDevOverlayCache()` in `beforeEach`
- Overlay: wraps element in `<span style="position:relative; display:inline-block">` + child `<span aria-hidden="true" style="position:absolute; inset:0; background:#d62828; pointerEvents:none">`
- Guard: `typeof process !== "undefined" && process.env.NODE_ENV !== "production"` — no-op in prod

**artui-tokens.css**
- All tokens: `--artui-bg`, `--artui-fg`, `--artui-border`, `--artui-hover-bg`, `--artui-surface-2`, `--artui-accent` (oklch), `--artui-accent-fg`, `--artui-focus-ring` (2px solid var(--artui-accent)), `--artui-selected-bg`, `--artui-color-info`, `--artui-color-success`, `--artui-color-warning`, `--artui-color-error`, `--artui-shadow`, `--artui-shadow-lg`, `--artui-radius-sm`(4px), `--artui-radius`(6px), `--artui-radius-lg`(8px), `--artui-disabled-opacity`(0.45)
- Dark mode: `.dark` class AND `@media (prefers-color-scheme: dark) { :root:not(.light) { ... } }`
- Dark mode redefines: bg, fg, border, hover-bg, surface-2, accent, accent-fg only (not radius/shadow/etc.)

**Registry components and "use client"**
- NO registry component includes `"use client"` — confirmed by grep
- Components use hooks (useEffect, useState, useRef) so they CANNOT run as RSCs
- Consumers using Next.js App Router must add `"use client"` themselves to the copied file, OR create a thin wrapper

**Component CSS structure**
- Each component has a `:root` block at top with component-specific tokens (e.g. `--artui-accordion-summary-padding`)
- Then BEM-style class rules referencing global tokens
- `focus-visible` rules use `outline: var(--artui-focus-ring)`

**globals.css** (in apps/docs, NOT for consumers)
- Uses Tailwind v4 `@import "tailwindcss"` + `@theme` block
- Consumer-facing style entry point is `artui-tokens.css` + per-component CSS

### Voice conventions (matched from getting-started, faq, contributing)
- Second person, present tense
- No "please", no fluff phrases
- Short imperative headings
- Code blocks for all shell commands and snippets
- No trailing summaries after Do/Dont blocks beyond one sentence
- No `## Overview` or `## Introduction` sections
