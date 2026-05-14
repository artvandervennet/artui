/**
 * Runtime accessibility warnings (development only).
 *
 * Catches mistakes TypeScript can't see — for example a dynamic alt string
 * that happens to evaluate to "image" at runtime, or an aria-labelledby
 * pointing at an element that doesn't exist. The §1.4.2 "fouten zichtbaar
 * maken" layer.
 *
 * In production builds, every call is a no-op and tree-shaken by the
 * bundler when NODE_ENV is statically set to 'production'.
 */

const isDev = typeof process !== 'undefined' && process.env.NODE_ENV !== 'production';

const warned = new Set<string>();

interface WarnOptions {
  /** Stable de-duplication key so the same warning doesn't spam the console. */
  key: string;
  /** Component name shown in the warning header. */
  component: string;
  /** What the developer did wrong, in human terms. */
  message: string;
  /** Optional WCAG criterion this violates (e.g. "1.1.1"). */
  wcag?: string;
  /** Optional DOM node to outline so the offending element is visible on the page. */
  element?: Element | null;
}

export function devWarn({ key, component, message, wcag, element }: WarnOptions): void {
  if (!isDev) return;
  if (warned.has(key)) return;
  warned.add(key);

  const wcagSuffix = wcag ? ` [WCAG ${wcag}]` : '';
  // biome-ignore lint/suspicious/noConsole: dev-only diagnostic
  console.warn(`[artui] <${component}>${wcagSuffix}: ${message}`);

  if (element instanceof HTMLElement) {
    element.style.outline = '3px solid #e11d48';
    element.style.outlineOffset = '2px';
    element.setAttribute('data-artui-a11y-violation', key);
  }
}

/** Reset the de-duplication cache (test-only). */
export function __resetDevWarnCache(): void {
  warned.clear();
}
