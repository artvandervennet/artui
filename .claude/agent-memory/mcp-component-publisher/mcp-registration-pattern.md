---
name: mcp-registration-pattern
description: How artui MCP server registers components — fully convention-based via registry.json
type: project
---

The MCP server at `apps/docs/lib/mcp/` is entirely convention-based. No explicit per-component registration is needed.

**How it works:**
- `registry-loader.ts` imports `apps/docs/public/registry.json` (static import, bundled at build time)
- `tools.ts` registers 6 tools: `list_components`, `get_component_docs`, `get_component_examples`, `search_components`, `get_accessibility_guidelines`, `get_installation_command`
- All tools call `loadRegistry()` which returns the bundled JSON, then query it by component name
- `findComponent()` does case-insensitive name lookup

**How a new component appears in MCP:**
1. Component has a `meta.ts` in `registry/components/<name>/`
2. `registry/scripts/build-registry.ts` is run to regenerate `registry/registry.json`
3. `apps/docs/scripts/copy-registry.mjs` (runs as prebuild) copies registry.json to `apps/docs/public/registry.json`
4. The MCP server serves it automatically — no code changes needed

**Data shape each component entry has:**
- `name`, `description`, `status` (stable/beta/experimental)
- `files[]`, `dependencies`, `registryDependencies`
- `props[]` — PropDoc with name, type, required, defaultValue, description
- `accessibility[]` — AccessibilityNote with wcag criterion and description
- `examples[]` — ComponentExample with name, description, code
- `related[]`, `donts[]`
- `fileContents[]` — { path, content } for each file including registry dependencies

**Why:** No per-component MCP wiring exists. Adding a component to `registry/components/` with a proper `meta.ts` is sufficient — the registry build + copy pipeline does the rest.

**How to apply:** When asked to publish a new component to MCP, first check if it's already in `apps/docs/public/registry.json`. If yes, the job is done. If no, run `registry/scripts/build-registry.ts` (or instruct user to), then rebuild docs.
