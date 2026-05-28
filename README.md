# artui

[![CI](https://github.com/artvandervennet/artui/actions/workflows/ci.yml/badge.svg)](https://github.com/artvandervennet/artui/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

Accessibility-first React components. Missing alt text or an unlabelled button
is a TypeScript error — the build won't pass.

## Why

The [WebAIM Million 2026](https://webaim.org/projects/million/) report found
WCAG violations on 95.9% of the top one million homepages. Same six categories
every year: contrast, alt text, form labels, empty links, empty buttons, missing
language. The tooling keeps missing them.

artui moves that catch to earlier in the pipeline:

- **Compile time** — missing alt text, placeholder alt values, unlabelled
  buttons are TypeScript errors. The code doesn't build.
- **Runtime (dev)** — dynamic strings that evaluate to placeholders at runtime
  get a console warning and a red outline on the offending element.
- **AI assistants** — an MCP server gives Claude Code, Cursor, and Copilot
  the component docs, so generated code starts from the right API.

## Install

In your existing React project:

```bash
npx artui@latest init
npx artui@latest add accordion
```

Or install the CLI globally if you plan to use it across multiple projects:

```bash
npm install -g @artui/cli
artui init
artui add accordion
```

The CLI copies component source into your project. You own the files and can
edit them freely.

## MCP server

```bash
claude mcp add --transport http artui https://artui.vandervennet.art/api/mcp
```

Then ask your assistant: _"how do I add an accessible image with artui?"_

## Packages

| Package                      | What it is                              |
| ---------------------------- | --------------------------------------- |
| [`@artui/cli`](packages/cli) | `artui init`, `artui add`, `artui list` |

## Developing

```bash
git clone https://github.com/artvandervennet/artui && cd artui
pnpm install
pnpm --filter @artui/registry build   # generates registry.json from meta.ts files
pnpm dev                               # docs site at http://localhost:3000
```

```bash
pnpm test       # vitest
pnpm typecheck  # tsc --noEmit across the workspace
pnpm lint       # biome check
```

To add a component or report an accessibility bug, see [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE) © Art Van der Vennet
