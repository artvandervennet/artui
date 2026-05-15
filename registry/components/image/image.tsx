import { type ImgHTMLAttributes, useMemo } from 'react';

import { withErrorOverlay } from '../../lib/dev-overlay';

const FORBIDDEN_ALTS = ['', 'img', 'image', 'photo', 'picture', 'icon'] as const;
type ForbiddenAlt = (typeof FORBIDDEN_ALTS)[number];

type SafeAlt<T extends string> =
  Lowercase<T> extends ForbiddenAlt
    ? `'${T}' is not meaningful alt text. Describe what the image shows`
    : T;

type BaseImgProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'alt' | 'role'>;

type DecorativeProps = BaseImgProps & {
  decorative: true;
  alt?: never;
};

type AccessibleProps<T extends string> = BaseImgProps & {
  decorative?: false;
  alt: SafeAlt<T>;
};

export type ImageProps<T extends string> = DecorativeProps | AccessibleProps<T>;

export function Image<const T extends string>(props: ImageProps<T>) {
  const { decorative, alt, style, loading, ...rest } = props as
    | (DecorativeProps & { alt?: undefined })
    | (AccessibleProps<string> & { decorative?: false });

  const runtimeError = useMemo(() => {
    if (decorative) return null;
    const value = typeof alt === 'string' ? alt.trim() : '';
    if (value === '') {
      return 'Alt text is empty or contains only whitespace.';
    }
    if ((FORBIDDEN_ALTS as readonly string[]).includes(value.toLowerCase())) {
      return `'${alt}' is not meaningful alt text. Describe what the image shows.`;
    }
    return null;
  }, [decorative, alt]);

  if (decorative) {
    return <img {...rest} alt="" role="presentation" loading={loading ?? 'lazy'} style={style} />;
  }

  const img = <img {...rest} alt={alt as string} loading={loading ?? 'lazy'} style={style} />;

  if (!runtimeError) return img;

  return withErrorOverlay(img, {
    key: `Image:placeholder-alt:${String(alt)}`,
    component: 'Image',
    wcag: '1.1.1',
    message: runtimeError,
  });
}
