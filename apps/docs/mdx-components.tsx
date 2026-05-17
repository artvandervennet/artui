import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';

import { DatepickerPlayground } from '@/components/datepicker-playground';
import { ImagePlayground } from '@/components/image-playground';
import { InstallBanner } from '@/components/install-banner';
import { RegistryVersionBadge } from '@/components/registry-version-badge';

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    DatepickerPlayground,
    ImagePlayground,
    InstallBanner,
    RegistryVersionBadge,
    ...components,
  };
}
