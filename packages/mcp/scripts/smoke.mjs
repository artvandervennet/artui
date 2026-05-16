#!/usr/bin/env node
/**
 * Minimal MCP client for smoke-testing the local artui-mcp build.
 *
 * Pipes a few JSON-RPC requests to ./dist/index.js over stdio:
 *   1. initialize         (handshake)
 *   2. tools/list         (must return 6 tools)
 *   3. tools/call         (get_component_docs { name: "Image" })
 *
 * Prints raw responses so anything unexpected is obvious.
 */
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const SERVER = resolve(__dirname, 'dist/index.js');
const REGISTRY = resolve(__dirname, '../../registry/registry.json');

const child = spawn(process.execPath, [SERVER], {
  env: { ...process.env, ARTUI_REGISTRY: REGISTRY },
  stdio: ['pipe', 'pipe', 'inherit'],
});

let buffer = '';
const responses = [];
child.stdout.on('data', (chunk) => {
  buffer += chunk.toString('utf8');
  let nl = buffer.indexOf('\n');
  while (nl !== -1) {
    const line = buffer.slice(0, nl).trim();
    buffer = buffer.slice(nl + 1);
    if (line) responses.push(JSON.parse(line));
    nl = buffer.indexOf('\n');
  }
});

function send(msg) {
  child.stdin.write(`${JSON.stringify(msg)}\n`);
}

async function waitFor(id, timeoutMs = 3000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const found = responses.find((r) => r.id === id);
    if (found) return found;
    await new Promise((r) => setTimeout(r, 20));
  }
  throw new Error(`timeout waiting for response id=${id}`);
}

try {
  send({
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'smoke-test', version: '0' },
    },
  });
  const init = await waitFor(1);
  console.log('initialize →', init.result.serverInfo);

  send({ jsonrpc: '2.0', method: 'notifications/initialized', params: {} });

  send({ jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} });
  const listed = await waitFor(2);
  console.log(`tools/list → ${listed.result.tools.length} tools:`);
  for (const t of listed.result.tools) console.log(`  - ${t.name}`);

  send({
    jsonrpc: '2.0',
    id: 3,
    method: 'tools/call',
    params: { name: 'get_component_docs', arguments: { name: 'Image' } },
  });
  const call = await waitFor(3);
  const text = call.result.content[0].text;
  const parsed = JSON.parse(text);
  console.log(`get_component_docs(Image) → ${parsed.name}: ${parsed.description}`);
  console.log(`  props: ${parsed.props.map((p) => p.name).join(', ')}`);
} finally {
  child.kill();
}
