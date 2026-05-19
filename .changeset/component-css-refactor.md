---
"@artui/registry": minor
---

refactor(styling): per-component CSS files with modern CSS

Every component now ships its own `<name>.css` file alongside `<name>.tsx` instead of inlining a `STYLE` template string and injecting it into `<head>` at runtime. The new files use native CSS nesting and logical properties (`margin-block-end`, `inset-inline-end`, `padding-inline`) throughout, and each declares its component-scoped custom properties in a `:root` block at the top. Class names are unchanged — consumers who already styled around `.artui-dialog`, `.artui-dp-*`, etc. keep working without modification.

Consumers who reinstall via the CLI receive the new `.css` files automatically. Consumers who hand-copied component sources previously will need to copy the new `.css` file and delete the old `injectStyle()`/`STYLE` block.
