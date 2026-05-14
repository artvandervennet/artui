import { readFile } from 'node:fs/promises';
import { isAbsolute, resolve } from 'node:path';

export interface PropDoc {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: string;
  description: string;
}

export interface AccessibilityNote {
  wcag: string;
  description: string;
}

export interface ComponentExample {
  name: string;
  description: string;
  code: string;
}

export interface RegistryComponent {
  name: string;
  description: string;
  status: 'stable' | 'beta' | 'experimental';
  files: string[];
  dependencies?: Record<string, string>;
  registryDependencies?: string[];
  props: PropDoc[];
  accessibility: AccessibilityNote[];
  examples: ComponentExample[];
  related?: string[];
  donts?: { code: string; reason: string }[];
  fileContents: { path: string; content: string }[];
}

export interface Registry {
  $schema: string;
  version: string;
  generatedAt: string;
  components: RegistryComponent[];
}

const DEFAULT_REGISTRY_URL = 'https://artui.vandervennet.art/registry.json';

/**
 * Resolves the registry source from env override or default URL.
 * `ARTUI_REGISTRY` may be either an http(s) URL or a local file path —
 * used during local development against the registry workspace.
 */
export async function loadRegistry(): Promise<Registry> {
  const source = process.env.ARTUI_REGISTRY ?? DEFAULT_REGISTRY_URL;

  if (/^https?:/i.test(source)) {
    const res = await fetch(source);
    if (!res.ok) {
      throw new Error(`Failed to fetch ${source}: HTTP ${res.status}`);
    }
    return (await res.json()) as Registry;
  }

  const abs = isAbsolute(source) ? source : resolve(process.cwd(), source);
  return JSON.parse(await readFile(abs, 'utf8')) as Registry;
}

export function findComponent(registry: Registry, name: string): RegistryComponent {
  const lower = name.toLowerCase();
  const match = registry.components.find((c) => c.name.toLowerCase() === lower);
  if (!match) {
    const available = registry.components.map((c) => c.name).join(', ');
    throw new Error(`Component "${name}" not found. Available: ${available}`);
  }
  return match;
}
