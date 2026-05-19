import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';

import { DatepickerPlayground } from '@/components/datepicker-playground';
import { DialogPlayground } from '@/components/dialog-playground';
import { ImagePlayground } from '@/components/image-playground';
import { InstallBanner } from '@/components/install-banner';
import { RegistryVersionBadge } from '@/components/registry-version-badge';

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    DatepickerPlayground,
    DialogPlayground,
    ImagePlayground,
    InstallBanner,
    RegistryVersionBadge,
    ...components,
  };
}
