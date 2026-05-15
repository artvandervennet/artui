import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { __resetDevOverlayCache } from '../../lib/dev-overlay';

import { Image } from './image';

describe('Image', () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    __resetDevOverlayCache();
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  it('renders the provided alt verbatim', () => {
    render(<Image src="/x.jpg" alt="A team photo from May 2026" />);
    expect(screen.getByAltText('A team photo from May 2026')).toBeInTheDocument();
  });

  it('renders decorative images with empty alt and role="presentation"', () => {
    render(<Image src="/x.jpg" decorative data-testid="img" />);
    const img = screen.getByTestId('img');
    expect(img).toHaveAttribute('alt', '');
    expect(img).toHaveAttribute('role', 'presentation');
  });

  it('does NOT set role="presentation" on meaningful images', () => {
    render(<Image src="/x.jpg" alt="meaningful" data-testid="img" />);
    expect(screen.getByTestId('img')).not.toHaveAttribute('role');
  });

  it('errors at runtime when alt evaluates to a placeholder', () => {
    // TypeScript would normally reject "image" as alt; we cast to bypass for
    // the runtime path that catches dynamic strings TS can't see.
    const placeholder = 'image' as never;
    render(<Image src="/x.jpg" alt={placeholder} />);
    expect(errorSpy).toHaveBeenCalled();
    const message = String(errorSpy.mock.calls[0]?.[0] ?? '');
    expect(message).toContain('<Image>');
    expect(message).toContain('[WCAG 1.1.1]');
  });

  it('does not error for valid alt text', () => {
    render(<Image src="/x.jpg" alt="Engineering team in the Ghent office" />);
    expect(errorSpy).not.toHaveBeenCalled();
  });
});
