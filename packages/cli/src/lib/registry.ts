import { readFile } from 'node:fs/promises';
import { isAbsolute, resolve } from 'node:path';

export interface RegistryFile {
  path: string;
  content: string;
}

export interface RegistryComponent {
  name: string;
  description: string;
  status: string;
  files: string[];
  fileContents: RegistryFile[];
  dependencies?: Record<string, string>;
  registryDependencies?: string[];
  props: unknown[];
  accessibility: unknown[];
  examples: unknown[];
  related?: string[];
}

export interface Registry {
  $schema: string;
  version: string;
  generatedAt: string;
  components: RegistryComponent[];
}

/**
 * Loads `registry.json` from a URL or a local file path.
 * Source order: explicit override → config value → bail out.
 */
export async function loadRegistry(source: string): Promise<Registry> {
  if (/^https?:/i.test(source)) {
    const res = await fetch(source);
    if (!res.ok) {
      throw new Error(`Failed to fetch ${source}: HTTP ${res.status}`);
    }
    return (await res.json()) as Registry;
  }

  const abs = isAbsolute(source) ? source : resolve(process.cwd(), source);
  const raw = await readFile(abs, 'utf8');
  return JSON.parse(raw) as Registry;
}

export function findComponent(registry: Registry, name: string): RegistryComponent {
  const lower = name.toLowerCase();
  const match = registry.components.find((c) => c.name.toLowerCase() === lower);
  if (!match) {
    const available = registry.components.map((c) => c.name).join(', ');
    throw new Error(`Component "${name}" not in registry. Available: ${available}`);
  }
  return match;
}
