import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';

import { registerTools } from '@/lib/mcp/tools';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * Hosted MCP endpoint served at `https://artui.vandervennet.art/api/mcp`.
 *
 * Streamable HTTP (2025-03-26 spec), stateless, one transport per request.
 * Handles GET (SSE subscription), POST (JSON-RPC), and DELETE (session close).
 *
 * Consumers add the server with:
 *   claude mcp add --transport http artui https://artui.vandervennet.art/api/mcp
 */
async function handler(request: Request): Promise<Response> {
  const transport = new WebStandardStreamableHTTPServerTransport();
  const server = new McpServer({ name: 'artui-mcp', version: '0.1.0' });
  registerTools(server);
  await server.connect(transport);
  return transport.handleRequest(request);
}

export { handler as DELETE, handler as GET, handler as POST };
