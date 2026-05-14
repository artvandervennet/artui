/**
 * Shape that every component's meta.ts must satisfy.
 *
 * This is the source-of-truth for `registry.json`. The build script reads
 * each meta file, walks the component's source files, and emits the entries
 * the CLI and MCP server consume.
 */

export interface PropDoc {
  name: string;
  /** TypeScript type as a string, for display. */
  type: string;
  required: boolean;
  /** Default value as source code, if any. */
  defaultValue?: string;
  description: string;
}

export interface AccessibilityNote {
  /** WCAG criterion this addresses (e.g. "1.1.1"). */
  wcag: string;
  /** Plain-language description of what the component does to satisfy it. */
  description: string;
}

export interface ComponentExample {
  name: string;
  description: string;
  code: string;
}

export type ComponentStatus = 'stable' | 'beta' | 'experimental';

export interface ComponentMeta {
  name: string;
  description: string;
  status: ComponentStatus;
  /** Files (relative to the component dir) to copy when the CLI runs `artui add <name>`. */
  files: string[];
  /** npm peer dependencies needed in the consumer project. */
  dependencies?: Record<string, string>;
  /** Other registry components this one depends on (e.g. Modal pulls in focus-trap). */
  registryDependencies?: string[];
  props: PropDoc[];
  accessibility: AccessibilityNote[];
  examples: ComponentExample[];
  /** Other components a user might also want. */
  related?: string[];
  /** Anti-patterns surfaced in the docs do/don'ts section. */
  donts?: { code: string; reason: string }[];
}
