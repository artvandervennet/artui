import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

import type { Command } from 'commander';

import { readConfig } from '../lib/config.js';
import { rewriteImports, route } from '../lib/file-router.js';
import { log } from '../lib/log.js';
import { findComponent, loadRegistry } from '../lib/registry.js';

interface AddOptions {
  registry?: string;
  overwrite?: boolean;
}

export function registerAdd(program: Command): void {
  program
    .command('add <component>')
    .description('Copy a component (and its dependencies) into your project.')
    .option('--registry <source>', 'override registry URL/path for this run')
    .option('--overwrite', 'overwrite existing files without prompting')
    .action(async (componentName: string, options: AddOptions) => {
      const cwd = process.cwd();
      const config = await readConfig(cwd);
      const source = options.registry ?? config.registry;

      log.info(`Fetching registry from ${source}`);
      const registry = await loadRegistry(source);
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
