import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

import type { Command } from 'commander';

import { type ArtuiConfig, readConfig } from '../lib/config.js';
import { rewriteImports, route } from '../lib/file-router.js';
import { log } from '../lib/log.js';
import {
  assertVersionMatch,
  findComponent,
  loadRegistry,
  resolveRegistryUrl,
} from '../lib/registry.js';
import { runInit } from './init.js';

interface AddOptions {
  registry?: string;
  overwrite?: boolean;
  yes?: boolean;
}

export function registerAdd(program: Command): void {
  program
    .command('add <component>')
    .description('Copy a component (and its dependencies) into your project.')
    .option('--registry <source>', 'override registry URL/path for this run')
    .option('--overwrite', 'overwrite existing files without prompting')
    .option('-y, --yes', 'skip prompts and accept defaults (runs init automatically if needed)')
    .action(async (componentName: string, options: AddOptions) => {
      const cwd = process.cwd();

      let config: ArtuiConfig;
      try {
        config = await readConfig(cwd);
      } catch {
        log.info('No components.json found — running init first.');
        config = await runInit(cwd, { yes: options.yes, registry: options.registry });
      }

      const baseSource = options.registry ?? config.registry;
      const source = resolveRegistryUrl(baseSource, config.version);

      log.info(
        config.version
          ? `Fetching registry v${config.version} from ${source}`
          : `Fetching registry from ${source}`,
      );
      const registry = await loadRegistry(source);
      assertVersionMatch(registry, config.version);
      const component = findComponent(registry, componentName);

      log.info(`Adding ${component.name}`);

      for (const file of component.fileContents) {
        const { outPath, destRelative } = route(file.path, cwd, config);
        const content = rewriteImports(file.content, file.path, config);

        await mkdir(dirname(outPath), { recursive: true });
        await writeFile(outPath, content, 'utf8');
        log.step(`wrote ${destRelative}`);
      }

      if (component.dependencies) {
        const deps = Object.entries(component.dependencies)
          .map(([name, version]) => `${name}@${version}`)
          .join(' ');
        log.info(`Install peer dependencies: pnpm add ${deps}`);
      }

      log.success(`${component.name} added.`);
    });
}
