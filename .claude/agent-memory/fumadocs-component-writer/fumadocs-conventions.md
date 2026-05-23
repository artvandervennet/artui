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

Registered in `apps/docs/mdx-components.tsx` via `getMDXComponents()`:
- `<PropsTable rows={[...]} />` — prop tables; row shape: `{ name, type, required?, default?, description }`
- `<KeyTable rows={[...]} />` — keyboard shortcut tables; row shape: `{ keys: string[], action }`
- `<WcagTable rows={[...]} />` — WCAG criterion tables; row shape: `{ criterion, name, level?, satisfiedBy }`
- `<Do title="...">` / `<Dont title="...">` — do/don't callout blocks that accept code fences and prose children
- `<CardLink />`, `<FeatureGrid />` — doc navigation/landing helpers
- Playground components: `<AccordionPlayground />`, `<DialogPlayground />`, `<DropdownMenuPlayground />`, `<ImagePlayground />`, `<DatepickerPlayground />`, `<ToastPlayground />`

Fumadocs built-ins from `fumadocs-ui/mdx` are also available (Callout, Steps, Tabs, etc.) but the component pages do NOT use them — they use the artui custom components above.

## Page structure order (canonical from dialog.mdx / dropdown-menu.mdx)

1. Frontmatter (`title`, `description` — no other fields)
2. `\`\`\`bash` install snippet (`npx artui@latest add <name>`) immediately after frontmatter, before any heading
3. Optional 2–4 sentence intro paragraph (no heading)
4. Optional `## Why native X?` motivating callout (prose only, no MDX component)
5. `## Playground` — playground component tag only (e.g. `<ToastPlayground />`)
6. `## Usage` — `###` subsections each with a labeled code block + 1–2 sentences of prose
7. `## API` — `###` per sub-component/type, each with a `<PropsTable>` immediately below
8. `## Keyboard` — `<KeyTable>` with optional prose after
9. `## Accessibility` — `<WcagTable>` covering all satisfied WCAG criteria
10. `## Do` — one or more `<Do>` blocks
11. `## Don't` — one or more `<Dont>` blocks
12. `## Related` — markdown bullet list of cross-links

Note: Do/Don't blocks live under separate `## Do` and `## Don't` headings, not interleaved.

## Dos and Don'ts format

```mdx
## Do

<Do title="Short imperative phrase">
```tsx
// code example
```
Optional one-sentence explanation.
</Do>

## Don't

<Dont title="Short imperative phrase">
```tsx
// code showing the anti-pattern
```
One sentence explaining why.
</Dont>
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
