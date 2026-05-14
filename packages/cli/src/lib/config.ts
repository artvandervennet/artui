import { readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

export const CONFIG_FILE = 'components.json';

export interface ArtuiConfig {
  $schema?: string;
  /** URL or local path to the registry.json file. */
  registry: string;
  paths: {
    components: string;
    lib: string;
    hooks: string;
  };
  /** Path to the project's global CSS file, relative to cwd. */
  style?: string;
}

export const DEFAULT_CONFIG: ArtuiConfig = {
  $schema: 'https://artui.dev/schema.json',
  registry: 'https://artui.dev/registry.json',
  paths: {
    components: 'components/ui',
    lib: 'lib/artui',
    hooks: 'hooks/artui',
  },
  style: 'app/globals.css',
};

export async function readConfig(cwd: string = process.cwd()): Promise<ArtuiConfig> {
  const path = join(cwd, CONFIG_FILE);
  let raw: string;
  try {
    raw = await readFile(path, 'utf8');
  } catch {
    throw new Error(`No ${CONFIG_FILE} found in ${resolve(cwd)}.`);
  }
  return JSON.parse(raw) as ArtuiConfig;
}

export async function writeConfig(
  config: ArtuiConfig,
  cwd: string = process.cwd(),
): Promise<string> {
  const path = join(cwd, CONFIG_FILE);
  await writeFile(path, `${JSON.stringify(config, null, 2)}\n`, 'utf8');
  return path;
}
