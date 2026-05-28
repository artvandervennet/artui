---
name: project-registry-sourced-docs
description: RegistryPropsTable and RegistryAccessibility RSC wrappers exist in apps/docs/components/docs/ and are registered in mdx-components.tsx — all 8 component MDX pages now source props/a11y from registry.json
metadata:
  type: project
---

`RegistryPropsTable` (`apps/docs/components/docs/registry-props-table.tsx`) and `RegistryAccessibility` (`apps/docs/components/docs/registry-accessibility.tsx`) are async RSCs that call `loadRegistry()` + `findComponent()` from `@/lib/mcp/registry-loader`.

Both are registered in `apps/docs/mdx-components.tsx` and used in all 8 component MDX pages.

**Why:** Props in MDX were hardcoded duplicates of registry.json, causing drift vs. the MCP server. The fix centralises both sources on registry.json at build time.

**How to apply:** When adding a new component, add `<RegistryPropsTable component="Name" />` and `<RegistryAccessibility component="Name" />` to its MDX page — no MDX hardcoding needed. For sub-components use the `sub` prop (e.g. `sub="Item"`) matching the dot-prefix in `meta.ts` props (e.g. `"Item.value"`).

**Dot-notation mapping:** Props in meta.ts like `"Item.value"` → `sub="Item"` strips the `"Item."` prefix for display. Root props (no dot) are shown when `sub` is omitted.

**WcagMeta coverage:** The static `wcagMeta` lookup in `registry-accessibility.tsx` covers WCAG criteria actually used across all 8 components: 1.1.1, 1.3.1, 1.3.3, 1.4.1, 1.4.3, 1.4.4, 1.4.11, 2.1.1, 2.1.2, 2.1.3, 2.2.1, 2.3.3, 2.4.3, 2.4.7, 2.4.10, 2.5.5, 3.2.2, 3.3.1, 3.3.2, 4.1.2, 4.1.3. Unknown criteria fall back to the raw criterion string with no level.
