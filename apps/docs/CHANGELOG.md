# @artui/docs

## 0.1.2

### Patch Changes

- Updated dependencies [0a13d07]
- Updated dependencies [0a13d07]
  - @artui/registry@0.3.0

## 0.1.1

### Patch Changes

- aba3bfc: Promote Datepicker from beta to stable.
- Updated dependencies [aba3bfc]
  - @artui/registry@0.2.1

## 0.1.0

### Minor Changes

- e38326c: The MCP server now ships as a hosted HTTP endpoint at
  `https://artui.vandervennet.art/api/mcp` (Streamable HTTP transport via
  `mcp-handler`). One-command install: `claude mcp add --transport http artui
https://artui.vandervennet.art/api/mcp` — no local binary, no config file.

  The `@artui/mcp` npm package (which only provided a stdio binary) is removed
  from the monorepo. The previously published `@artui/mcp@0.0.1` should be
  deprecated on npm separately with `npm deprecate @artui/mcp@0.0.1 "Use the
hosted endpoint at https://artui.vandervennet.art/api/mcp instead."`.

## 0.0.2

### Patch Changes

- c380c97: Registry versioning + docs coupling. The registry now stamps its `package.json` version into `registry.json`, and the docs site publishes an immutable snapshot at `/registry/v<version>/registry.json` alongside the existing `/registry.json` "latest". The CLI accepts an optional `version` field in `components.json` to pin installs to a specific registry release, and validates that the fetched registry's version matches the pin. The docs site shows a registry-version badge and an install banner with the matching `components.json` snippet so docs and CLI always agree.
- Updated dependencies [c380c97]
  - @artui/registry@0.2.0

## 0.0.1

### Patch Changes

- Updated dependencies [a8cd519]
  - @artui/registry@0.1.0
