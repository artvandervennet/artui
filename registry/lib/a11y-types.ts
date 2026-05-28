/**
 * Compile-time accessibility guarantees.
 *
 * These types make missing or placeholder accessibility data a TypeScript
 * error, not a silent runtime mistake. They are the §1.4.2 "fouten onmogelijk
 * maken via TypeScript" layer of the artui enforcement model.
 */

/**
 * Strings that look like alt text but communicate nothing to a screenreader.
 * Authors using these have not actually written alt text; they have written
 * a placeholder. The Image component rejects these at compile time.
 */
export type PlaceholderAltText =
  | 'image'
  | 'Image'
  | 'IMAGE'
  | 'img'
  | 'Img'
  | 'IMG'
  | 'photo'
  | 'Photo'
  | 'picture'
  | 'Picture'
  | 'icon'
  | 'Icon'
  | 'logo'
  | 'Logo'
  | ''
  | ' ';

/**
 * A non-empty, non-placeholder string. Used wherever an accessible name is
 * required (alt, aria-label, ...). Authors trying to pass `""` or `"image"`
 * get a type error.
 */
export type AccessibleText<T extends string = string> = T extends PlaceholderAltText
  ? never
  : T;

/**
 * Discriminated union for any interactive component that requires an
 * accessible name. Exactly one of these three sources MUST be present:
 *
 *  - visible text content (`children: string`)
 *  - `aria-label`
 *  - `aria-labelledby` (pointing at another element)
 *
 * Used by Button, IconButton, Modal close-button, and similar.
 */
export type AccessibleNameProps =
  | { children: AccessibleText; 'aria-label'?: never; 'aria-labelledby'?: never }
  | { children?: never; 'aria-label': AccessibleText; 'aria-labelledby'?: never }
  | { children?: never; 'aria-label'?: never; 'aria-labelledby': string };
