---
name: centralized-css-tokens
description: artui registry components draw color/theme tokens from registry/styles/artui-tokens.css; structural vars stay local
metadata:
  type: project
---

Registry component CSS files draw all color/theme values from a single centralized token file `registry/styles/artui-tokens.css` (`:root` for light, `.dark` + `@media (prefers-color-scheme: dark)` for dark). Components keep only structural/sizing/layout vars in their own reduced `:root`.

Canonical token names: `--artui-bg`, `--artui-fg`, `--artui-border`, `--artui-hover-bg`, `--artui-surface-2`, `--artui-accent`, `--artui-accent-fg`, `--artui-focus-ring` (= `2px solid var(--artui-accent)`), `--artui-selected-bg` (accent-tinted color-mix), `--artui-color-info/success/warning/error`, `--artui-shadow`, `--artui-shadow-lg`, `--artui-radius-sm/radius/radius-lg` (4/6/8px), `--artui-disabled-opacity` (0.45).

`--artui-focus-ring`, `--artui-selected-bg`, `--artui-color-info` reference `--artui-accent` via `var()` so they track the dark-mode accent automatically (CSS custom props resolve lazily) — do NOT re-declare them in `.dark`.

**Why:** Eliminated 7 components each declaring duplicate light/dark color blocks. Single source of truth for theming.
**How to apply:** New registry components should consume these tokens rather than declaring their own color vars. The docs site (`apps/docs/app/global.css`) imports the token file and overrides `--artui-accent`/`--artui-accent-fg` to the brand palette (`--brand-600`/`--brand-400`). See [[registry-css-no-import]].
