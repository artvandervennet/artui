import type { ReactNode } from 'react';

export function FeatureGrid({ children }: { children: ReactNode }) {
  return <div className="not-prose my-6 grid gap-3 sm:grid-cols-2">{children}</div>;
}
