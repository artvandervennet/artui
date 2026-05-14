# artui

[![CI](https://github.com/artvandervennet/artui/actions/workflows/ci.yml/badge.svg)](https://github.com/artvandervennet/artui/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

An accessibility-first React component library. Inaccessibility is a
TypeScript error, not a silent runtime failure that an audit finds three
months later.

## Why

The [WebAIM Million 2026](https://webaim.org/projects/million/) report found
detectable WCAG 2 violations on 95.9% of the top one million homepages. The
same six categories — contrast, alt text, form labels, empty links, empty
buttons, missing language — appear year after year. The pattern is bad
tooling, not bad intent.

artui addresses that by making the accessible path the default path:

- **Compile time**: missing alt text, placeholder alt values, or an
  unlabelled button are TypeScript errors. The code doesn't build.
- **Runtime (dev)**: dynamic strings that evaluate to a placeholder at
  runtime trigger a console warning and a red outline around the offending
  element.
- **AI assistants**: an MCP server exposes component docs to Claude Code,
  Cursor, and GitHub Copilot, so generated code uses the right component
  the first time.

## Install

In your existing React project:

```bash
pnpm dlx @artui/cli init
pnpm dlx @artui/cli add Image
```

The CLI copies the component source into your codebase. You own the files
after that — edit them freely.

## Packages

| Package | What it is |
|---|---|
| [`@artui/cli`](packages/cli) | The `artui` CLI: `init`, `add`, `lint`. |
| [`@artui/mcp`](packages/mcp) | MCP server with 6 tools for AI assistants. |
| [`@artui/docs`](apps/docs) | Documentation site (Fumadocs). |
| [`@artui/registry`](registry) | Component source-of-truth (not published). |

## Connecting the MCP server

Add to `claude_desktop_config.json` (Claude Desktop) or your editor's MCP
settings:

```json
{
  "mcpServers": {
    "artui": {
      "command": "npx",
      "args": ["-y", "@artui/mcp"]
    }
  }
}
```

Then ask: *"How do I add an accessible image with artui?"* — your AI
assistant will read the live registry and return the correct command.

## Development

```bash
pnpm install
pnpm --filter @artui/registry build  # generates registry.json
pnpm dev                              # all workspaces in parallel
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full local workflow.

## License

[MIT](LICENSE) © Art Van der Vennet
