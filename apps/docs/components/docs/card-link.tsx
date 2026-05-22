import Link from 'next/link';
import type { ReactNode } from 'react';

export function CardLink({
  href,
  title,
  description,
  icon,
}: {
  href: string;
  title: string;
  description?: ReactNode;
  icon?: ReactNode;
}) {
  const isExternal = /^https?:/.test(href);
  const Anchor = isExternal ? 'a' : Link;

  return (
    <Anchor
      data-card
      href={href}
      {...(isExternal ? { target: '_blank', rel: 'noreferrer' } : {})}
      className="group relative flex flex-col gap-1.5 rounded-lg border border-fd-border bg-fd-card p-4 no-underline transition-colors hover:border-fd-primary/50 hover:bg-fd-accent/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fd-ring"
    >
      <div className="flex items-center gap-2">
        {icon ? (
          <span className="flex h-6 w-6 items-center justify-center text-fd-primary">{icon}</span>
        ) : null}
        <span className="font-medium text-fd-foreground">{title}</span>
        <span
          aria-hidden="true"
          className="ml-auto text-fd-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-fd-primary"
        >
          →
        </span>
      </div>
      {description ? <p className="m-0 text-sm text-fd-muted-foreground">{description}</p> : null}
    </Anchor>
  );
}
