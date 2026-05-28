import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';

import { AccordionPlayground } from '@/components/accordion-playground';
import { DatepickerPlayground } from '@/components/datepicker-playground';
import { DialogPlayground } from '@/components/dialog-playground';
import { CardLink } from '@/components/docs/card-link';
import { Do } from '@/components/docs/do';
import { Dont } from '@/components/docs/dont';
import { FeatureGrid } from '@/components/docs/feature-grid';
import { KeyTable } from '@/components/docs/key-table';
import { PropsTable } from '@/components/docs/props-table';
import { RegistryAccessibility } from '@/components/docs/registry-accessibility';
import { RegistryPropsTable } from '@/components/docs/registry-props-table';
import { WcagTable } from '@/components/docs/wcag-table';
import { DropdownMenuPlayground } from '@/components/dropdown-menu-playground';
import { ImagePlayground } from '@/components/image-playground';
import { SelectPlayground } from '@/components/select-playground';
import { SliderPlayground } from '@/components/slider-playground';
import { ToastPlayground } from '@/components/toast-playground';

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    AccordionPlayground,
    CardLink,
    DatepickerPlayground,
    DialogPlayground,
    Do,
    Dont,
    DropdownMenuPlayground,
    FeatureGrid,
    ImagePlayground,
    SelectPlayground,
    SliderPlayground,
    ToastPlayground,
    KeyTable,
    PropsTable,
    RegistryAccessibility,
    RegistryPropsTable,
    WcagTable,
    ...components,
  };
}
