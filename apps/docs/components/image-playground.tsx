'use client';

import { Image } from '@artui/registry';
import { useState } from 'react';

import { Playground, PlaygroundTextField, PlaygroundToggle } from '@/components/playground';

const SRC = 'https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?w=640&h=360&fit=crop';

// Mirrors the (unexported) FORBIDDEN_ALTS constant in the Image component so the
// playground can detect invalid alt text without importing internals.
const FORBIDDEN = ['', 'img', 'image', 'photo', 'picture', 'icon'] as const;

function isForbidden(value: string): boolean {
  return (FORBIDDEN as readonly string[]).includes(value.trim().toLowerCase());
}

const IMG_STYLE: React.CSSProperties = {
  borderRadius: '0.5rem',
  maxWidth: '100%',
  display: 'block',
};

export function ImagePlayground() {
  const [decorative, setDecorative] = useState(false);
  const [alt, setAlt] = useState('A mountain lake at dawn with mist rising off the still water');
  const [loading, setLoading] = useState<'lazy' | 'eager'>('lazy');

  const isInvalidAlt = !decorative && isForbidden(alt);

  const consoleError =
    alt.trim() === ''
      ? 'Alt text is empty or contains only whitespace.'
      : `'${alt}' is not meaningful alt text. Describe what the image shows.`;

  const codeLines = ['<Image', `  src="${SRC}"`];
  if (decorative) {
    codeLines.push('  decorative');
  } else {
    codeLines.push(`  alt="${alt}"`);
  }
  if (loading === 'eager') codeLines.push('  loading="eager"');
  codeLines.push('  width={480}');
  codeLines.push('  height={270}');
  codeLines.push('/>');
  const code = codeLines.join('\n');

  return (
    <Playground
      previewClass="bg-fd-card p-8 min-h-[240px] flex items-center justify-center"
      preview={
        decorative ? (
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
          <span style={{ position: 'relative', display: 'inline-block' }}>
            {/* biome-ignore lint/performance/noImgElement: intentional raw <img> to replicate error-overlay DOM without Next.js optimization */}
            <img src={SRC} alt="" width={480} height={270} loading={loading} style={IMG_STYLE} />
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                inset: 0,
                background: '#d62828',
                pointerEvents: 'none',
              }}
            />
          </span>
        ) : (
          <Image src={SRC} alt={alt} loading={loading} width={480} height={270} style={IMG_STYLE} />
        )
      }
      code={code}
      controls={
        <>
          <PlaygroundToggle
            label="decorative"
            options={['false', 'true'] as const}
            value={decorative ? 'true' : 'false'}
            onChange={(v) => setDecorative(v === 'true')}
          />
          <PlaygroundTextField
            label="alt"
            value={alt}
            onChange={setAlt}
            disabled={decorative}
            placeholder="Describe what the image shows…"
            hint={
              isInvalidAlt ? (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  &#9888; Forbidden alt: the error overlay appears in development
                </p>
              ) : undefined
            }
          />
          <PlaygroundToggle
            label="loading"
            options={['lazy', 'eager'] as const}
            value={loading}
            onChange={setLoading}
          />
          {isInvalidAlt && (
            <div className="px-4 py-3">
              <div className="rounded-md border border-red-900/40 bg-red-950/20 px-3 py-2 font-mono text-xs text-red-400">
                &#x2715;&nbsp;[artui] &lt;Image&gt; [WCAG&nbsp;1.1.1]:&nbsp;{consoleError}
              </div>
            </div>
          )}
        </>
      }
    />
  );
}
