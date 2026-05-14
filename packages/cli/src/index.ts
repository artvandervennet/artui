#!/usr/bin/env node
import { Command } from 'commander';

import { registerAdd } from './commands/add.js';
import { registerInit } from './commands/init.js';
import { registerLint } from './commands/lint.js';

const program = new Command();

program
  .name('artui')
  .description('Install accessible artui components into your project.')
  .version('0.0.0');

registerInit(program);
registerAdd(program);
registerLint(program);

program.parseAsync(process.argv).catch((err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err);
  process.stderr.write(`artui: ${msg}\n`);
  process.exit(1);
});
