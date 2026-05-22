import pc from 'picocolors';

export const log = {
  info: (msg: string): void => {
    process.stdout.write(`${pc.cyan('artui')} ${msg}\n`);
  },
  success: (msg: string): void => {
    process.stdout.write(`${pc.green('✓')} ${msg}\n`);
  },
  warn: (msg: string): void => {
    process.stderr.write(`${pc.yellow('!')} ${msg}\n`);
  },
  error: (msg: string): void => {
    process.stderr.write(`${pc.red('✗')} ${msg}\n`);
  },
  step: (msg: string): void => {
    process.stdout.write(`  ${pc.dim('→')} ${msg}\n`);
  },
};
