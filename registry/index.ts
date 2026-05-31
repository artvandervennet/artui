/**
 * Public entry point for `@artui/registry` when consumed inside the monorepo
 * (e.g. by the docs site). End users do NOT install this package; they
 * receive copy-pasted source files via `artui add`. This export only exists
 * so the documentation site can render real components in MDX.
 */

export { Image } from './components/image/image';
export type { ImageProps } from './components/image/image';

export { Datepicker } from './components/datepicker/datepicker';
export type { DatepickerProps } from './components/datepicker/datepicker';

export { Dialog, DialogTrigger } from './components/dialog/dialog';
export type { DialogProps, DialogTriggerProps } from './components/dialog/dialog';

export { DropdownMenu } from './components/dropdown-menu/dropdown-menu';

export { Accordion } from './components/accordion/accordion';
export type { AccordionProps, AccordionItemProps, AccordionHeaderProps, AccordionTriggerProps, AccordionPanelProps } from './components/accordion/accordion';

export { Slider } from './components/slider/slider';
export type { SliderProps, SliderThumbDescriptor } from './components/slider/slider';

export { Select } from './components/select/select';

export { ToastProvider, useToast } from './components/toast/toast';
export type {
  ToastAction,
  ToastApi,
  ToastHandle,
  ToastOptions,
  ToastProviderProps,
  ToastShortcutOptions,
  ToastType,
} from './components/toast/toast';
