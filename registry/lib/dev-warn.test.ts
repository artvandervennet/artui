import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { __resetDevWarnCache, devWarn } from './dev-warn';

describe('devWarn', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    __resetDevWarnCache();
    consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('logs the warning with component name and message', () => {
    devWarn({ key: 't1', component: 'Image', message: 'Missing alt' });
    expect(consoleSpy).toHaveBeenCalledOnce();
    expect(consoleSpy.mock.calls[0]?.[0]).toContain('<Image>');
    expect(consoleSpy.mock.calls[0]?.[0]).toContain('Missing alt');
  });

  it('includes the WCAG criterion when provided', () => {
    devWarn({ key: 't2', component: 'Image', wcag: '1.1.1', message: 'placeholder alt' });
    expect(consoleSpy.mock.calls[0]?.[0]).toContain('[WCAG 1.1.1]');
  });

  it('de-duplicates by key — second warning with same key is silent', () => {
    devWarn({ key: 'dup', component: 'Image', message: 'first' });
    devWarn({ key: 'dup', component: 'Image', message: 'second' });
    expect(consoleSpy).toHaveBeenCalledOnce();
  });

  it('outlines the offending DOM element when one is provided', () => {
    const img = document.createElement('img');
    document.body.appendChild(img);
    devWarn({ key: 't4', component: 'Image', message: 'x', element: img });
    expect(img.style.outline).toBe('3px solid #e11d48');
    expect(img.getAttribute('data-artui-a11y-violation')).toBe('t4');
  });
});
