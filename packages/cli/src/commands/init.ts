import { access } from 'node:fs/promises';
import { join } from 'node:path';

import type { Command } from 'commander';
import prompts from 'prompts';

import { type ArtuiConfig, CONFIG_FILE, DEFAULT_CONFIG, writeConfig } from '../lib/config.js';
import { log } from '../lib/log.js';

interface InitOptions {
  yes?: boolean;
  registry?: string;
}

export function registerInit(program: Command): void {
  program
    .command('init')
    .description('Create components.json and set up paths for artui.')
    .option('-y, --yes', 'skip interactive prompts and accept defaults')
    .option('--registry <url>', 'registry URL or local file path')
    .action(async (options: InitOptions) => {
      const cwd = process.cwd();

      // Bail early if config already exists — don't clobber user choices.
      const configExists = await access(join(cwd, CONFIG_FILE)).then(
        () => true,
        () => false,
      );
      if (configExists) {
        throw new Error(`${CONFIG_FILE} already exists. Delete it first if you want to re-init.`);
      }

      let config: ArtuiConfig;

      if (options.yes) {
        config = {
          ...DEFAULT_CONFIG,
          ...(options.registry ? { registry: options.registry } : {}),
        };
      } else {
        const answers = await prompts(
          [
            {
              type: 'text',
              name: 'registry',
              message: 'Registry URL or local path',
              initial: options.registry ?? DEFAULT_CONFIG.registry,
            },
            {
              type: 'text',
              name: 'components',
              message: 'Where should components be written?',
              initial: DEFAULT_CONFIG.paths.components,
            },
            {
              type: 'text',
              name: 'lib',
              message: 'Where should shared lib helpers go?',
              initial: DEFAULT_CONFIG.paths.lib,
            },
            {
              type: 'text',
              name: 'hooks',
              message: 'Where should hooks go?',
              initial: DEFAULT_CONFIG.paths.hooks,
            },
            {
              type: 'text',
              name: 'style',
              message: 'Path to your global CSS file (for Tailwind imports)',
              initial: DEFAULT_CONFIG.style,
            },
          ],
          { onCancel: () => process.exit(1) },
        );

        config = {
          $schema: DEFAULT_CONFIG.$schema,
          registry: answers.registry as string,
          paths: {
            components: answers.components as string,
            lib: answers.lib as string,
            hooks: answers.hooks as string,
          },
          style: answers.style as string,
        };
      }

      const path = await writeConfig(config, cwd);
      log.success(`Wrote ${path}`);
      log.info('Next: `artui add Image` to add your first component.');
    });
}
