import type { Command } from 'commander';
import { execa } from 'execa';

import { readConfig } from '../lib/config.js';
import { log } from '../lib/log.js';

interface LintOptions {
  path?: string;
  fix?: boolean;
}

export function registerLint(program: Command): void {
  program
    .command('lint')
    .description('Run accessibility checks: eslint-plugin-jsx-a11y on your components.')
    .option('--path <path>', 'override the path to lint')
    .option('--fix', 'auto-fix issues where possible')
    .action(async (options: LintOptions) => {
      const config = await readConfig();
      const target = options.path ?? config.paths.components;

      log.info(`Running jsx-a11y rules against ${target}`);

      const args = [
        '--no-eslintrc',
        '--rule',
        'jsx-a11y/recommended:error',
        '--ext',
        '.ts,.tsx,.js,.jsx',
        ...(options.fix ? ['--fix'] : []),
        target,
      ];

      try {
        const result = await execa('eslint', args, {
          stdio: 'inherit',
          reject: false,
        });
        if (result.exitCode === 0) {
          log.success('No accessibility violations found.');
        } else {
          log.error('Accessibility violations found above. See WCAG references per rule.');
          process.exit(result.exitCode ?? 1);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes('ENOENT')) {
          log.error(
            'eslint not found in PATH. Install it: pnpm add -D eslint eslint-plugin-jsx-a11y',
          );
          process.exit(1);
        }
        throw err;
      }
    });
}
