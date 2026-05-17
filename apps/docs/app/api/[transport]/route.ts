import { createMcpHandler } from 'mcp-handler';

import { registerTools } from '@/lib/mcp/tools';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * Hosted MCP endpoint served at `https://artui.vandervennet.art/api/mcp`.
 *
 * Streamable HTTP transport only (SSE disabled — deprecated in the
 * 2025-03-26 MCP spec). Routed via Next.js dynamic segment so the same
 * file handles `/api/mcp` (and would handle `/api/sse` if it were enabled).
 *
 * Consumers add the server with:
 *   claude mcp add --transport http artui https://artui.vandervennet.art/api/mcp
 */
const handler = createMcpHandler(
  (server) => {
    registerTools(server);
  },
  {
    serverInfo: { name: 'artui-mcp', version: '0.1.0' },
  },
  {
    basePath: '/api',
    disableSse: true,
    verboseLogs: false,
  },
);

export { handler as DELETE, handler as GET, handler as POST };
