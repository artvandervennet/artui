import registryJson from '../../public/registry.json' with { type: 'json' };

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

/**
 * Resolves the registry. Default is the JSON bundled at build time from
 * `apps/docs/public/registry.json` (placed there by `scripts/copy-registry.mjs`
 * during the docs site's `prebuild`). The static import keeps Vercel's
 * file tracing tight — no runtime fs scan, no whole-project bundling.
 *
 * `ARTUI_REGISTRY` is honored only in dev: it may point to an http(s) URL
 * or an absolute file path so you can iterate against an unbuilt registry
 * workspace. In production the env var is ignored — the bundled JSON is
 * always served. Gating on NODE_ENV also lets Turbopack tree-shake the
 * dev branch out, which keeps NFT from tracing the whole project.
 */
export async function loadRegistry(): Promise<Registry> {
  if (process.env.NODE_ENV !== 'production') {
    const override = process.env.ARTUI_REGISTRY;
    if (override) return loadOverride(override);
  }
  return registryJson as Registry;
}

async function loadOverride(source: string): Promise<Registry> {
  if (/^https?:/i.test(source)) {
    const res = await fetch(source);
    if (!res.ok) {
      throw new Error(`Failed to fetch ${source}: HTTP ${res.status}`);
    }
    return (await res.json()) as Registry;
  }

  const { readFile } = await import('node:fs/promises');
  const { isAbsolute, resolve } = await import('node:path');
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
