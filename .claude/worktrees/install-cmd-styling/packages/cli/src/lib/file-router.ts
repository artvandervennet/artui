import { dirname, posix, relative as relPath } from 'node:path';

import type { ArtuiConfig } from './config.js';

interface Routed {
  /** Absolute output path on disk. */
  outPath: string;
  /** Logical destination relative to cwd (for relative-import rewriting). */
  destRelative: string;
}

/**
 * Maps a registry-source path to a destination path inside the consumer
 * project, based on the consumer's `components.json` paths config.
 *
 *   components/image/image.tsx → <paths.components>/image.tsx
 *   lib/a11y-types.ts          → <paths.lib>/a11y-types.ts
 *   hooks/use-x.ts             → <paths.hooks>/use-x.ts
 */
export function route(registryPath: string, cwd: string, config: ArtuiConfig): Routed {
  const normalized = registryPath.replace(/\\/g, '/');

  let destRelative: string;
  if (normalized.startsWith('components/')) {
    const stripped = normalized.replace(/^components\/[^/]+\//, '');
    destRelative = posix.join(config.paths.components, stripped);
  } else if (normalized.startsWith('lib/')) {
    destRelative = posix.join(config.paths.lib, normalized.slice('lib/'.length));
  } else if (normalized.startsWith('hooks/')) {
    destRelative = posix.join(config.paths.hooks, normalized.slice('hooks/'.length));
  } else {
    // Unknown prefix — write at the same relative path as a fallback.
    destRelative = normalized;
  }

  return {
    outPath: posix.join(cwd.replace(/\\/g, '/'), destRelative),
    destRelative,
  };
}

/**
 * Rewrites relative imports inside a copied file. The registry source uses
 * `../../lib/X` and `../../hooks/X` (relative to a component file two levels
 * deep). After routing, the destination structure differs — the consumer's
 * lib/ and components/ paths are independent. Recompute the relative import
 * so the file actually resolves in the new location.
 */
export function rewriteImports(
  content: string,
  fromRegistryPath: string,
  config: ArtuiConfig,
): string {
  const fromIsComponent = fromRegistryPath.startsWith('components/');
  if (!fromIsComponent) {
    // lib/ and hooks/ files don't currently import from sibling lib/. If that
    // changes, extend this function. Keeping it focused avoids subtle bugs.
    return content;
  }

  return content.replace(
    /(from\s+['"])(?:\.\.\/)+(lib|hooks)\/([^'"]+)(['"])/g,
    (_match, lead: string, kind: string, name: string, trail: string) => {
      const targetBase = kind === 'lib' ? config.paths.lib : config.paths.hooks;
      const sourceDir = dirname(routedComponentPath(fromRegistryPath, config));
      const target = posix.join(targetBase, name);
      const rel = relPath(sourceDir, target).replace(/\\/g, '/');
      const prefixed = rel.startsWith('.') ? rel : `./${rel}`;
      return `${lead}${prefixed}${trail}`;
    },
  );
}

function routedComponentPath(registryPath: string, config: ArtuiConfig): string {
  const stripped = registryPath.replace(/^components\/[^/]+\//, '');
  return posix.join(config.paths.components, stripped);
}
