---
name: project-mcp-lives-in-docs
description: MCP server is part of apps/docs (private, not released) — no @artui/mcp package exists; changeset should not list it
metadata:
  type: project
---

There is no `packages/mcp` directory and no `@artui/mcp` npm package. The MCP server lives entirely inside `apps/docs/lib/mcp/` and is served at `/api/mcp`. `apps/docs` is `"private": true` and is never published.

**Why:** Verified 2026-05-20 during dropdown-menu delivery. The plan template referenced "@artui/mcp" in the changeset, but that package does not exist.

**How to apply:** For any changeset that would list `@artui/mcp`, drop it. Only `@artui/registry` and `@artui/cli` are releasable packages (besides any future additions). Check `ls packages/` when uncertain.
