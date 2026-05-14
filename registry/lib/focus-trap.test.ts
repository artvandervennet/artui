import { describe, expect, it } from 'vitest';

import { trapFocus } from './focus-trap';

describe('trapFocus', () => {
  function setup(): { root: HTMLDivElement; trigger: HTMLButtonElement } {
    const trigger = document.createElement('button');
    trigger.textContent = 'open';
    document.body.appendChild(trigger);
    trigger.focus();

    const root = document.createElement('div');
    root.innerHTML = `
      <button data-testid="first">first</button>
      <input data-testid="middle" />
      <button data-testid="last">last</button>
    `;
    document.body.appendChild(root);
    return { root, trigger };
  }

  function tab(shift = false): void {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: shift }));
  }

  it('focuses the first focusable element on activation', () => {
    const { root } = setup();
    trapFocus(root);
    expect(document.activeElement).toBe(root.querySelector('[data-testid="first"]'));
  });

  it('wraps from last to first on forward tab', () => {
    const { root } = setup();
    trapFocus(root);
    (root.querySelector('[data-testid="last"]') as HTMLElement).focus();
    tab();
    expect(document.activeElement).toBe(root.querySelector('[data-testid="first"]'));
  });

  it('wraps from first to last on shift+tab', () => {
    const { root } = setup();
    trapFocus(root);
    tab(true);
    expect(document.activeElement).toBe(root.querySelector('[data-testid="last"]'));
  });

  it('restores focus to the trigger on release', () => {
    const { root, trigger } = setup();
    const release = trapFocus(root);
    expect(document.activeElement).not.toBe(trigger);
    release();
    expect(document.activeElement).toBe(trigger);
  });
});
