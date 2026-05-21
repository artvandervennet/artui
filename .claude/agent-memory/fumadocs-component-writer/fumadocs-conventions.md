---
name: fumadocs-conventions
description: Fumadocs MDX authoring conventions for artui docs — component imports, frontmatter shape, playground registration pattern, nav manifest.
metadata:
  type: project
---

## Frontmatter shape

```yaml
---
title: ComponentName
description: One-sentence summary ending with a period.
---
```

No other fields. The description should name the WAI-ARIA pattern or HTML foundation, accessibility guarantees, and the one differentiating feature.

## MDX global components available (no import needed in MDX)

- `<InstallBanner />` — placed immediately after frontmatter, before first heading
- `<Callout type="info" title="...">` / `<Callout type="warn">` / `<Callout type="error" title="...">`
- Playground components: `<AccordionPlayground />`, `<DialogPlayground />`, `<DropdownMenuPlayground />`, `<ImagePlayground />`, `<DatepickerPlayground />`
- `<RegistryVersionBadge />`

## Page structure order

1. Frontmatter
2. `<InstallBanner />`
3. `## Playground` — short prose + playground component
4. `## Install` — `npx artui@latest add <name>` + note about which files are copied
5. `## Why native X?` or motivating overview section (optional, component-specific)
6. `## Usage` — subsections with labeled `###` examples
7. `## TypeScript enforcement` — compile errors then valid usage
8. `## Runtime errors` — table of error keys + `<Callout type="warn">` about production
9. `## Keyboard navigation` — tables with Key/Action, one table per navigation group
10. `## API` — one `###` per sub-component, tables with Prop/Type/Default/Description
11. `## Accessibility` — optional `<Callout type="info">` + WCAG table + additional behaviors list
12. `## Dos and Don'ts` — alternating `<Callout type="info" title="Do —...">` / `<Callout type="error" title="Don't —...">`
13. `## Related` — bullet list of cross-links

## Dos and Don'ts format

Alternate info/error Callout pairs:
```mdx
<Callout type="info" title="Do — short imperative">
prose or code
</Callout>

<Callout type="error" title="Don't — short imperative">
code
prose explaining why
</Callout>
```

## Navigation manifest

`apps/docs/content/docs/components/meta.json` — add new component slug to `"pages"` array (alphabetical or logical order; accordion was placed first).

## Playground registration (three steps)

1. Create `apps/docs/components/<name>-playground.tsx` — `'use client'` directive, imports from `@artui/registry`
2. Export Accordion (or new component) from `registry/index.ts`
3. Import and register in `apps/docs/mdx-components.tsx` inside `getMDXComponents()`

## Build command

```bash
pnpm --filter @artui/docs build
```

The NFT warning about `next.config.mjs` / `registry-loader.ts` is pre-existing and non-fatal — ignore it.

## WCAG table format (Accessibility section)

```md
| WCAG | Criterion | How it is satisfied |
|------|-----------|---------------------|
| **1.3.1** | Info and Relationships | ... |
```

## Import path in playground files

Use `@artui/registry` (the monorepo internal package alias), not a relative path.
