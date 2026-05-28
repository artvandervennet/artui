# Contributing to artui

Thanks for considering a contribution. The whole point of this library is
that accessibility violations should never reach production — and the
fastest path to that goal is more eyes on the code, more components, and
more real-world tests.

## Local setup

```bash
git clone https://github.com/artvandervennet/artui.git
cd artui
pnpm install
pnpm --filter @artui/registry build
pnpm dev
```

You need **Node 22+** and **pnpm 10+**. The `.nvmrc` file pins the Node
version if you use `nvm` or `fnm`.

## Workspace layout

```markdown
artui/
├── apps/docs/ Fumadocs site + hosted MCP endpoint (/api/mcp)
├── packages/cli/ The `artui` CLI
└── registry/ Component source-of-truth
```

## Common commands

```bash
pnpm turbo run lint        # Biome + ESLint+jsx-a11y across all workspaces
pnpm turbo run typecheck   # tsc --noEmit
pnpm turbo run test        # Vitest
pnpm turbo run build       # Build registry + packages + docs site
```

To work on a single workspace:

```bash
pnpm --filter @artui/cli dev
pnpm --filter @artui/docs dev
```

## Adding a component

1. Create `registry/components/<your-component>/` with the source `.tsx`
   and a `meta.ts` matching the `ComponentMeta` shape.
2. If you need new shared helpers (focus logic, ARIA wiring, keyboard
   handlers), add them under `registry/lib/` and list them as
   `registryDependencies` in your meta.
3. Add at least one vitest test that exercises the accessibility
   contract: keyboard reachability, focus management, ARIA exposure.
4. Add a docs page at `apps/docs/content/docs/components/<name>.mdx`
   following the §2.1.3 checklist (purpose, install, preview, API,
   accessibility, do/don'ts, related).
5. Run `pnpm --filter @artui/registry build` so `registry.json`
   regenerates.

## Pull requests

Every PR must:

- pass `pnpm turbo run lint typecheck test build`
- include a Changeset (`pnpm changeset`) if it touches `@artui/cli`,
  the release workflow needs it
- include an accessibility test if the change affects component
  behavior (keyboard, focus, ARIA)
- update the corresponding docs page if props or behavior changed

## Reporting bugs

Use the issue templates. Accessibility bugs have their own template,
please include the WCAG criterion you believe is violated and which
assistive technology + version you tested with. That detail makes
the fix dramatically faster.

## Code of conduct

This project follows the [Contributor Covenant](CODE_OF_CONDUCT.md).
By participating, you agree to abide by its terms.
