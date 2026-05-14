/**
 * Walks `registry/components/*`, loads each component's `meta.ts`, reads the
 * referenced source files, and emits `registry.json` at the registry root.
 *
 * `registry.json` is the single source of truth for:
 *   - `artui add <name>` (the CLI copies file contents from here)
 *   - the MCP server (every tool reads this file)
 *   - the docs site (component pages are generated from these entries)
 */

import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import type { ComponentMeta } from '../lib/meta-types.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REGISTRY_ROOT = resolve(__dirname, '..');
const COMPONENTS_DIR = join(REGISTRY_ROOT, 'components');
const OUTPUT = join(REGISTRY_ROOT, 'registry.json');

interface FileEntry {
  path: string;
  content: string;
}

interface RegistryEntry extends ComponentMeta {
  /** Sourced from disk at build time, not from the meta file. */
  fileContents: FileEntry[];
}

async function exists(p: string): Promise<boolean> {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

async function loadComponent(name: string): Promise<RegistryEntry | null> {
  const componentDir = join(COMPONENTS_DIR, name);
  const metaPath = join(componentDir, 'meta.ts');

  if (!(await exists(metaPath))) {
    console.warn(`[build-registry] skipping ${name}: no meta.ts`);
    return null;
  }

  const mod = (await import(pathToFileURL(metaPath).href)) as { meta: ComponentMeta };
  const meta = mod.meta;

  const fileContents: FileEntry[] = [];

  // Component's own files (live under components/<name>/).
  for (const file of meta.files) {
    const abs = join(componentDir, file);
    if (!(await exists(abs))) {
      throw new Error(`[build-registry] ${name}: meta lists ${file} but file is missing`);
    }
    fileContents.push({
      path: relative(REGISTRY_ROOT, abs).replace(/\\/g, '/'),
      content: await readFile(abs, 'utf8'),
    });
  }

  // Registry dependencies (lib/*, hooks/*) are paths relative to the registry root.
  // We bundle them into fileContents so the CLI can write them alongside the component.
  for (const dep of meta.registryDependencies ?? []) {
    const abs = join(REGISTRY_ROOT, dep);
    if (!(await exists(abs))) {
      throw new Error(
        `[build-registry] ${name}: registryDependency ${dep} not found at ${abs}`,
      );
    }
    fileContents.push({
      path: dep.replace(/\\/g, '/'),
      content: await readFile(abs, 'utf8'),
    });
  }

  return { ...meta, fileContents };
}

async function main(): Promise<void> {
  if (!(await exists(COMPONENTS_DIR))) {
    throw new Error(`No components/ directory at ${COMPONENTS_DIR}`);
  }

  const entries = await readdir(COMPONENTS_DIR, { withFileTypes: true });
  const componentNames = entries.filter((e) => e.isDirectory()).map((e) => e.name);

  const components: RegistryEntry[] = [];
  for (const name of componentNames) {
    const entry = await loadComponent(name);
    if (entry) components.push(entry);
  }

  components.sort((a, b) => a.name.localeCompare(b.name));

  const registry = {
    $schema: 'https://artui.dev/registry-schema.json',
    version: '0.0.0',
    generatedAt: new Date().toISOString(),
    components,
  };

  await writeFile(OUTPUT, `${JSON.stringify(registry, null, 2)}\n`, 'utf8');
  console.log(
    `[build-registry] wrote ${OUTPUT} with ${components.length} component(s): ${components
      .map((c) => c.name)
      .join(', ')}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
