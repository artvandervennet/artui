// Gesso's components are native custom elements. This tells TypeScript the tags exist.
import type { DetailedHTMLProps, HTMLAttributes } from 'react';

type GessoElement = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
  [attribute: string]: unknown;
};

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'art-header': GessoElement;
      'art-button': GessoElement;
      'art-stroke': GessoElement;
      'art-drip': GessoElement;
      'art-signature': GessoElement;
      'art-tape': GessoElement;
      'art-canvas': GessoElement;
      'art-scheme': GessoElement;
    }
  }
}
