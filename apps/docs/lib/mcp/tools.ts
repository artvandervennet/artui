import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { findComponent, loadRegistry } from './registry-loader';

/**
 * Tools from §2.2.2 Table 8 of the thesis. All six tools read from a single
 * registry.json (re-loaded per request — simpler than caching, and the file
 * is small).
 *
 * Each tool returns a `content` array with one text entry whose payload is a
 * JSON string. MCP clients can parse it or surface it as-is to the model.
 */

function jsonContent(payload: unknown): { content: { type: 'text'; text: string }[] } {
  return {
    content: [{ type: 'text', text: JSON.stringify(payload, null, 2) }],
  };
}

export function registerTools(server: McpServer): void {
  // 1. list_components ----------------------------------------------------
  server.registerTool(
    'list_components',
    {
      description: 'List every artui component with a one-line summary and stability status.',
      inputSchema: {},
    },
    async () => {
      const registry = await loadRegistry();
      return jsonContent(
        registry.components.map((c) => ({
          name: c.name,
          description: c.description,
          status: c.status,
        })),
      );
    },
  );

  // 2. get_component_docs -------------------------------------------------
  server.registerTool(
    'get_component_docs',
    {
      description:
        "Full reference for one component: props (types, defaults, required), do/don'ts, related components. Use before suggesting any artui code.",
      inputSchema: {
        name: z.string().describe('Component name, e.g. "Image" or "Modal".'),
      },
    },
    async ({ name }) => {
      const registry = await loadRegistry();
      const component = findComponent(registry, name);
      return jsonContent({
        name: component.name,
        description: component.description,
        status: component.status,
        props: component.props,
        donts: component.donts ?? [],
        related: component.related ?? [],
      });
    },
  );

  // 3. get_component_examples ---------------------------------------------
  server.registerTool(
    'get_component_examples',
    {
      description: 'Working code snippets for a component, optionally filtered to one variant.',
      inputSchema: {
        name: z.string().describe('Component name.'),
        variant: z
          .string()
          .optional()
          .describe('Optional variant name to filter to (case-insensitive).'),
      },
    },
    async ({ name, variant }) => {
      const registry = await loadRegistry();
      const component = findComponent(registry, name);
      let examples = component.examples;
      if (variant) {
        const v = variant.toLowerCase();
        examples = examples.filter((e) => e.name.toLowerCase().includes(v));
      }
      return jsonContent(examples);
    },
  );

  // 4. search_components --------------------------------------------------
  server.registerTool(
    'search_components',
    {
      description:
        'Search by name or description. Returns components ranked by simple relevance score.',
      inputSchema: {
        query: z.string().describe('Free-text query, e.g. "date" or "popup".'),
      },
    },
    async ({ query }) => {
      const registry = await loadRegistry();
      const q = query.toLowerCase();

      const ranked = registry.components
        .map((c) => {
          let score = 0;
          if (c.name.toLowerCase() === q) score += 100;
          else if (c.name.toLowerCase().includes(q)) score += 20;
          if (c.description.toLowerCase().includes(q)) score += 5;
          return { name: c.name, description: c.description, status: c.status, score };
        })
        .filter((c) => c.score > 0)
        .sort((a, b) => b.score - a.score);

      return jsonContent(ranked);
    },
  );

  // 5. get_accessibility_guidelines ---------------------------------------
  server.registerTool(
    'get_accessibility_guidelines',
    {
      description:
        'WCAG criteria a component satisfies, plus keyboard and screenreader behavior notes.',
      inputSchema: {
        name: z.string().describe('Component name.'),
      },
    },
    async ({ name }) => {
      const registry = await loadRegistry();
      const component = findComponent(registry, name);
      return jsonContent({
        component: component.name,
        accessibility: component.accessibility,
      });
    },
  );

  // 6. get_installation_command -------------------------------------------
  server.registerTool(
    'get_installation_command',
    {
      description: 'The exact CLI command to add a component to a consumer project.',
      inputSchema: {
        name: z.string().describe('Component name.'),
        manager: z
          .enum(['npm', 'pnpm', 'yarn', 'bun'])
          .optional()
          .describe('Package manager. Defaults to pnpm.'),
      },
    },
    async ({ name, manager }) => {
      const registry = await loadRegistry();
      const component = findComponent(registry, name);
      const runner =
        manager === 'npm'
          ? 'npx'
          : manager === 'yarn'
            ? 'yarn dlx'
            : manager === 'bun'
              ? 'bunx'
              : 'pnpm dlx';
      return jsonContent({
        command: `${runner} @artui/cli add ${component.name}`,
        peerDependencies: component.dependencies ?? {},
      });
    },
  );
}
