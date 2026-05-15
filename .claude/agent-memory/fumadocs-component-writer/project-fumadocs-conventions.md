---
name: project-fumadocs-conventions
description: Fumadocs MDX authoring conventions for the artui docs site — MDX components, frontmatter, routing, and playground patterns
metadata:
  type: project
---

## Fumadocs MDX conventions in artui docs

**Fumadocs version:** fumadocs-ui v16, fumadocs-mdx, Next.js 16, Tailwind v4.

**Routing:** `apps/docs/app/docs/[[...slug]]/page.tsx` — single catch-all route. `source` is loaded from `@/.source/server` via `fumadocs-core/source`. Page renders `<DocsPage>`, `<DocsTitle>`, `<DocsDescription>`, `<DocsBody>` from `fumadocs-ui/page`.

**MDX component registration:** `apps/docs/mdx-components.tsx` exports `getMDXComponents`. Components added here are globally available in all MDX without per-file imports. `defaultMdxComponents` from `fumadocs-ui/mdx` is always spread first.

**`Callout` usage:** Globally available via `defaultMdxComponents`. Types: `info`, `warn`, `error`. Optional `title` prop. No import needed in MDX.

**Frontmatter fields in use:** `title` (string, required), `description` (string, required). No `full` or other fields observed in component docs.

**Content directory layout:** `apps/docs/content/docs/` — flat MDX files plus `meta.json` per folder. Component docs live at `content/docs/components/<name>.mdx`. Navigation order controlled by `meta.json` `"pages"` array.

**Playground pattern:** Create a `'use client'` component in `apps/docs/components/<name>-playground.tsx`. Register it in `mdx-components.tsx`. Use it in MDX as `<NamePlayground />` with no import.

**Tailwind v4 tokens in playground components:**
- Background: `bg-fd-card`, `bg-fd-background`, `bg-fd-muted`
- Text: `text-fd-foreground`, `text-fd-muted-foreground`
- Border: `border-fd-border`, `border-fd-primary`
- Active tab style: `border-b-2 border-fd-primary` / inactive: `border-b-2 border-transparent`
- Wrap interactive demos in `not-prose` to escape Fumadocs prose styles.

**`@/` alias:** Maps to `apps/docs/` (configured in `tsconfig.json`).

**Registry import in playground:** `import { Image } from '@artui/registry'` — the registry is a workspace package transpiled by `transpilePackages` in `next.config.mjs`.

**CLI install command convention:** `npx artui@latest add <component-name>` (not `pnpm dlx @artui/cli add`).

**Files the Image CLI install copies:** `image.tsx` + `lib/dev-overlay.tsx`.

**`@artui/registry` exports:** `Image` component and `ImageProps` type from `./components/image/image`.

**Why:** Need these conventions each time writing a new component doc to avoid inconsistency with the existing site.

**How to apply:** Use for every new component MDX file — check this before choosing heading levels, MDX components, or playground structure.

[[project-registry-image-api]]
