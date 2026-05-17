---
'@artui/docs': minor
---

The MCP server now ships as a hosted HTTP endpoint at
`https://artui.vandervennet.art/api/mcp` (Streamable HTTP transport via
`mcp-handler`). One-command install: `claude mcp add --transport http artui
https://artui.vandervennet.art/api/mcp` — no local binary, no config file.

The `@artui/mcp` npm package (which only provided a stdio binary) is removed
from the monorepo. The previously published `@artui/mcp@0.0.1` should be
deprecated on npm separately with `npm deprecate @artui/mcp@0.0.1 "Use the
hosted endpoint at https://artui.vandervennet.art/api/mcp instead."`.
