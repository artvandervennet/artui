'use client';

import { useState } from 'react';

export function PageActions({ markdown, sourceUrl }: { markdown: string; sourceUrl?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="not-prose flex shrink-0 flex-wrap gap-2 pt-1">
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center gap-1.5 rounded-md border border-fd-border bg-fd-card px-3 py-1.5 text-xs font-medium text-fd-foreground transition-colors hover:bg-fd-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fd-ring"
      >
        <span aria-hidden="true">{copied ? '✓' : '⧉'}</span>
        {copied ? 'Copied' : 'Copy as Markdown'}
      </button>
      {sourceUrl ? (
        <a
          href={sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md border border-fd-border bg-fd-card px-3 py-1.5 text-xs font-medium text-fd-foreground no-underline transition-colors hover:bg-fd-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fd-ring"
        >
          <span aria-hidden="true">↗</span>
          View source
        </a>
      ) : null}
    </div>
  );
}
