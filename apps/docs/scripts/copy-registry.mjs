/**
 * Copies registry.json into apps/docs/public/ so Next.js serves it as a
 * static asset at /registry.json. Runs in the docs site's `prebuild` step,
 * which means Turborepo has already built @artui/registry by the time this
 * script runs (Turbo's ^build dependency takes care of ordering).
 */
import { cpSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = resolve(here, '../../../registry/registry.json');
const dest = resolve(here, '../public/registry.json');

mkdirSync(dirname(dest), { recursive: true });
cpSync(src, dest);
console.log(`[copy-registry] ${src} → ${dest}`);
