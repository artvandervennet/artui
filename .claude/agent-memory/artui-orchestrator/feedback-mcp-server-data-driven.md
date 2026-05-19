---
name: feedback-mcp-server-data-driven
description: The artui MCP server is fully data-driven from registry.json — new components need no code changes to tools.ts
metadata:
  type: feedback
---

`apps/docs/lib/mcp/tools.ts` reads all component data dynamically via `loadRegistry()` and `findComponent()`. There is no per-component registration. Adding a new component to `registry.json` automatically makes it discoverable by all six MCP tools.

**Why:** Confirmed when wiring Dialog into MCP — `grep -n "dialog" tools.ts` returned zero results, yet the MCP tools work because `list_components`, `get_component_docs`, etc. iterate over `registry.components` dynamically.

**How to apply:** The `mcp-component-publisher` step in the default pipeline can be skipped for new components as long as `registry.json` has been regenerated. Only invoke `mcp-component-publisher` if the MCP tool schemas themselves need updating (e.g., new tool types, new input fields).
