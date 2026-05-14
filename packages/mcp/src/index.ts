#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { registerTools } from './tools.js';

async function main(): Promise<void> {
  const server = new McpServer({
    name: 'artui-mcp',
    version: '0.0.0',
  });

  registerTools(server);

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err);
  process.stderr.write(`artui-mcp fatal: ${msg}\n`);
  process.exit(1);
});
