'use client';

import { Image } from '@artui/registry';
import { useState } from 'react';

const SRC = 'https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?w=640&h=360&fit=crop';

const FORBIDDEN = ['', 'img', 'image', 'photo', 'picture', 'icon'] as const;

function isForbidden(value: string): boolean {
  return (FORBIDDEN as readonly string[]).includes(value.trim().toLowerCase());
}

const IMG_STYLE: React.CSSProperties = {
  borderRadius: '0.5rem',
  maxWidth: '100%',
  display: 'block',
};

function Toggle<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex rounded-md border border-fd-border overflow-hidden text-xs">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={[
            'px-3 py-1.5 transition-colors',
            value === opt
              ? 'bg-fd-primary text-fd-primary-foreground font-medium'
              : 'bg-fd-card text-fd-muted-foreground hover:bg-fd-accent',
          ].join(' ')}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export function ImagePlayground() {
  const [decorative, setDecorative] = useState(false);
  const [alt, setAlt] = useState('A mountain lake at dawn with mist rising off the still water');
  const [loading, setLoading] = useState<'lazy' | 'eager'>('lazy');

  const isInvalidAlt = !decorative && isForbidden(alt);

  const consoleError =
    alt.trim() === ''
      ? 'Alt text is empty or contains only whitespace.'
      : `'${alt}' is not meaningful alt text. Describe what the image shows.`;

  // Build live code string
  const codeLines = ['<Image', `  src="…"`];
  if (decorative) {
    codeLines.push('  decorative');
  } else {
    codeLines.push(`  alt="${alt}"`);
  }
  if (loading === 'eager') codeLines.push('  loading="eager"');
  codeLines.push('/>');
  const code = codeLines.join('\n');

  return (
    <div className="not-prose rounded-xl border border-fd-border overflow-hidden">
      {/* Preview */}
      <div className="flex items-center justify-center bg-fd-card p-8 min-h-[240px]">
        {decorative ? (
          <Image
            src={SRC}
            decorative
            loading={loading}
            width={480}
            height={270}
            style={IMG_STYLE}
          />
        ) : isInvalidAlt ? (
          // Replicates withErrorOverlay DOM output without firing console.error
          <span aria-hidden="true" style={{ position: 'relative', display: 'inline-block' }}>
            {/* biome-ignore lint/performance/noImgElement: intentional raw <img> to replicate error-overlay DOM without Next.js optimization */}
            <img src={SRC} alt="" width={480} height={270} loading={loading} style={IMG_STYLE} />
            <span
              style={{
                position: 'absolute',
                inset: 0,
                background: '#d62828',
                pointerEvents: 'none',
                borderRadius: '0.5rem',
              }}
            />
          </span>
        ) : (
          <Image src={SRC} alt={alt} loading={loading} width={480} height={270} style={IMG_STYLE} />
        )}
      </div>

      {/* Controls */}
      <div className="border-t bg-fd-background divide-y divide-fd-border">
        {/* decorative */}
        <div className="flex items-center gap-4 px-4 py-3">
          <span className="w-24 shrink-0 font-mono text-xs text-fd-muted-foreground">
            decorative
          </span>
          <Toggle
            options={['false', 'true'] as const}
            value={decorative ? 'true' : 'false'}
            onChange={(v) => setDecorative(v === 'true')}
          />
        </div>

        {/* alt */}
        <div
          className={[
            'flex items-start gap-4 px-4 py-3',
            decorative ? 'opacity-40 pointer-events-none select-none' : '',
          ].join(' ')}
        >
          <span className="w-24 shrink-0 font-mono text-xs text-fd-muted-foreground pt-1.5">
            alt
          </span>
          <div className="flex-1 flex flex-col gap-1.5">
            <input
              type="text"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              disabled={decorative}
              className="w-full rounded-md border border-fd-border bg-fd-card px-3 py-1.5 font-mono text-xs text-fd-foreground focus:outline-none focus:ring-2 focus:ring-fd-primary disabled:cursor-not-allowed"
              placeholder="Describe what the image shows…"
            />
            {isInvalidAlt && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                &#9888; Forbidden alt — the error overlay appears in development
              </p>
            )}
          </div>
        </div>

        {/* loading */}
        <div className="flex items-center gap-4 px-4 py-3">
          <span className="w-24 shrink-0 font-mono text-xs text-fd-muted-foreground">loading</span>
          <Toggle options={['lazy', 'eager'] as const} value={loading} onChange={setLoading} />
        </div>

        {/* Simulated console.error */}
        {isInvalidAlt && (
          <div className="px-4 py-3">
            <div className="rounded-md border border-red-900/40 bg-red-950/20 px-3 py-2 font-mono text-xs text-red-400">
              &#x2715;&nbsp;[artui] &lt;Image&gt; [WCAG&nbsp;1.1.1]:&nbsp;{consoleError}
            </div>
          </div>
        )}

        {/* Code */}
        <div className="px-4 py-3">
          <pre className="rounded-md bg-fd-muted p-4 text-xs font-mono text-fd-foreground overflow-x-auto whitespace-pre">
            {code}
          </pre>
        </div>
      </div>
    </div>
  );
}
