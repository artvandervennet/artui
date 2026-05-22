import type { ReactNode } from 'react';

export function Dont({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="not-prose my-5">
      <p className="m-0 mb-2 text-sm font-medium text-fd-foreground">{title}</p>
      <div className="[&_pre]:my-0">{children}</div>
    </section>
  );
}
