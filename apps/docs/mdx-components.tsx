import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';

import { DatepickerPlayground } from '@/components/datepicker-playground';
import { ImagePlayground } from '@/components/image-playground';

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    DatepickerPlayground,
    ImagePlayground,
    ...components,
  };
}
