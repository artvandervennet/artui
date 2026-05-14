/**
 * Focus trap utility. Used by Modal and any component that takes over the
 * viewport. Built without dependencies — the thesis chose to implement
 * focus management ourselves rather than inherit Radix's.
 *
 * Usage:
 *   const release = trapFocus(modalElement);
 *   // ... when closing:
 *   release();
 */

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
].join(',');

function getFocusable(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => !el.hasAttribute('inert') && !el.closest('[inert]'),
  );
}

export interface TrapFocusOptions {
  /** Element to focus first. Defaults to the first focusable inside root. */
  initialFocus?: HTMLElement;
  /** Element to restore focus to on release. Defaults to document.activeElement at call time. */
  returnFocus?: HTMLElement | null;
}

export function trapFocus(root: HTMLElement, options: TrapFocusOptions = {}): () => void {
  const previouslyFocused =
    options.returnFocus !== undefined
      ? options.returnFocus
      : (document.activeElement as HTMLElement | null);

  const initial = options.initialFocus ?? getFocusable(root)[0] ?? root;
  initial.focus();

  function handleKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Tab') return;
    const focusable = getFocusable(root);
    if (focusable.length === 0) {
      event.preventDefault();
      return;
    }
    const first = focusable[0]!;
    const last = focusable[focusable.length - 1]!;
    const active = document.activeElement as HTMLElement | null;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  document.addEventListener('keydown', handleKeydown);

  return function release(): void {
    document.removeEventListener('keydown', handleKeydown);
    previouslyFocused?.focus();
  };
}
