'use client';

import { useEffect, useRef } from 'react';
import type { ImgHTMLAttributes } from 'react';

import type { AccessibleText } from '../../lib/a11y-types';
import { devWarn } from '../../lib/dev-warn';

type NativeImgProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'alt'>;

/**
 * Decorative images contribute nothing to comprehension — a screenreader
 * should skip over them. WCAG 1.1.1 explicitly allows an empty alt for these.
 * The `decorative` discriminator forces authors to make this choice consciously.
 */
type DecorativeProps = NativeImgProps & {
  decorative: true;
  alt?: never;
};

/**
 * Meaningful images must have meaningful alt text. `AccessibleText` rejects
 * empty strings and placeholder values like "image" / "photo" / "icon" at
 * the type level (§1.4.2 exclude-types pattern).
 */
type DescriptiveProps<T extends string> = NativeImgProps & {
  decorative?: false;
  alt: AccessibleText<T>;
};

export type ImageProps<T extends string = string> = DecorativeProps | DescriptiveProps<T>;

/**
 * An <img> that cannot be used inaccessibly.
 *
 * - Authors must either pass `decorative` (empty alt, role="presentation")
 *   or pass real `alt` text. There is no third option.
 * - Placeholder alt values are a compile error.
 * - At runtime in development, dynamic alt strings that happen to evaluate
 *   to a placeholder produce a console warning and outline the <img>.
 */
export function Image<T extends string>(props: ImageProps<T>): React.ReactElement {
  const ref = useRef<HTMLImageElement>(null);

  const decorative = 'decorative' in props && props.decorative === true;
  const alt = decorative ? '' : props.alt;

  useEffect(() => {
    if (decorative) return;
    const value = String(alt).trim().toLowerCase();
    const placeholders = ['', 'image', 'img', 'photo', 'picture', 'icon', 'logo'];
    if (placeholders.includes(value)) {
      devWarn({
        key: `Image:placeholder-alt:${ref.current?.src ?? alt}`,
        component: 'Image',
        wcag: '1.1.1',
        message: `alt="${alt}" is a placeholder — write text that describes what the image communicates, or pass \`decorative\` if it conveys nothing.`,
        element: ref.current,
      });
    }
  }, [alt, decorative]);

  const rest = (decorative
    ? (() => {
        const { decorative: _d, ...r } = props;
        return r;
      })()
    : (() => {
        const { decorative: _d, alt: _a, ...r } = props;
        return r;
      })()) as NativeImgProps;

  return (
    <img
      ref={ref}
      alt={alt}
      role={decorative ? 'presentation' : undefined}
      {...rest}
    />
  );
}
