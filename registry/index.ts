/**
 * Public entry point for `@artui/registry` when consumed inside the monorepo
 * (e.g. by the docs site). End users do NOT install this package — they
 * receive copy-pasted source files via `artui add`. This export only exists
 * so the documentation site can render real components in MDX.
 */

export { Image } from './components/image/image';
export type { ImageProps } from './components/image/image';

export { Datepicker } from './components/datepicker/datepicker';
export type { DatepickerProps } from './components/datepicker/datepicker';

export { Dialog } from './components/dialog/dialog';
export type { DialogProps } from './components/dialog/dialog';
