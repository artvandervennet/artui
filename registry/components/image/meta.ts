import type { ComponentMeta } from '../../lib/meta-types';

export const meta: ComponentMeta = {
  name: 'Image',
  description:
    'An <img> wrapper that refuses to render without a meaningful alt or an explicit `decorative` flag.',
  status: 'stable',
  files: ['image.tsx'],
  registryDependencies: ['lib/a11y-types.ts', 'lib/dev-overlay.tsx'],
  props: [
    {
      name: 'alt',
      type: 'string',
      required: true,
      description:
        'Description of what the image communicates. Required unless `decorative` is set. Rejects placeholder strings like "image" or "photo" at compile time.',
    },
    {
      name: 'decorative',
      type: 'true',
      required: false,
      description:
        'Marks the image as purely decorative. Renders an empty alt and role="presentation". Mutually exclusive with `alt`.',
    },
  ],
  accessibility: [
    {
      wcag: '1.1.1',
      description:
        'Every <img> has either a meaningful text alternative or is explicitly marked decorative. Those are the two valid choices under WCAG Non-text Content.',
    },
    {
      wcag: '4.1.2',
      description:
        'Decorative images are exposed with role="presentation" so assistive technology can skip them.',
    },
  ],
  examples: [
    {
      name: 'Meaningful image',
      description: 'Standard case: describe what the image shows.',
      code: `<Image src="/team.jpg" alt="The engineering team in the Ghent office, May 2026" />`,
    },
    {
      name: 'Decorative image',
      description: 'Background photo that adds no information; opt out explicitly.',
      code: `<Image src="/hero-pattern.svg" decorative />`,
    },
  ],
  related: ['Avatar', 'Icon'],
  donts: [
    {
      code: `<Image src="/team.jpg" alt="image" />`,
      reason:
        '"image" tells a screenreader nothing the user couldn\'t already infer from the element role. Use real description text, or mark the image `decorative`.',
    },
    {
      code: `<Image src="/team.jpg" alt="" />`,
      reason:
        'An empty alt without `decorative` is ambiguous: was it left empty on purpose or forgotten? Pass `decorative` to make the intent explicit.',
    },
  ],
};
