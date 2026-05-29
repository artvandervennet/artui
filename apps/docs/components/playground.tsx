'use client';

import { type ReactNode, useState } from 'react';

// --- Syntax highlighter -------------------------------------------------------

type TokenKind =
  | 'keyword'
  | 'component'
  | 'element'
  | 'punct'
  | 'string'
  | 'comment'
  | 'number'
  | 'plain';

interface Token {
  kind: TokenKind;
  text: string;
}

const KEYWORDS = new Set([
  'import',
  'from',
  'export',
  'default',
  'const',
  'let',
  'var',
  'function',
  'return',
  'class',
  'type',
  'interface',
  'extends',
  'implements',
  'if',
  'else',
  'for',
  'of',
  'in',
  'while',
  'new',
  'true',
  'false',
  'null',
  'undefined',
  'async',
  'await',
  'try',
  'catch',
  'throw',
]);

const TOKEN_CLASS: Record<TokenKind, string> = {
  keyword: 'text-violet-500 dark:text-violet-400',
  component: 'text-teal-600 dark:text-teal-400',
  element: 'text-sky-600 dark:text-sky-400',
  punct: 'text-fd-muted-foreground',
  string: 'text-orange-500 dark:text-orange-400',
  comment: 'text-green-600 dark:text-green-500 italic',
  number: 'text-amber-500 dark:text-amber-400',
  plain: 'text-fd-foreground',
};

function tokenize(code: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < code.length) {
    // Single-line comment
    if (code[i] === '/' && code[i + 1] === '/') {
      const end = code.indexOf('\n', i);
      const text = end === -1 ? code.slice(i) : code.slice(i, end);
      tokens.push({ kind: 'comment', text });
      i = end === -1 ? code.length : end;
      continue;
    }

    // Block comment
    if (code[i] === '/' && code[i + 1] === '*') {
      const end = code.indexOf('*/', i + 2);
      const text = end === -1 ? code.slice(i) : code.slice(i, end + 2);
      tokens.push({ kind: 'comment', text });
      i = end === -1 ? code.length : end + 2;
      continue;
    }

    // Double-quoted string
    if (code[i] === '"') {
      let j = i + 1;
      while (j < code.length && code[j] !== '"') {
        if (code[j] === '\\') j++;
        j++;
      }
      tokens.push({ kind: 'string', text: code.slice(i, j + 1) });
      i = j + 1;
      continue;
    }

    // Single-quoted string
    if (code[i] === "'") {
      let j = i + 1;
      while (j < code.length && code[j] !== "'") {
        if (code[j] === '\\') j++;
        j++;
      }
      tokens.push({ kind: 'string', text: code.slice(i, j + 1) });
      i = j + 1;
      continue;
    }

    // Template literal
    if (code[i] === '`') {
      let j = i + 1;
      while (j < code.length && code[j] !== '`') {
        if (code[j] === '\\') j++;
        j++;
      }
      tokens.push({ kind: 'string', text: code.slice(i, j + 1) });
      i = j + 1;
      continue;
    }

    // JSX tag: </TagName or <TagName
    if (code[i] === '<') {
      const next = code[i + 1];
      if (next === '/' || (next !== undefined && /[A-Za-z]/.test(next))) {
        let j = i + 1;
        if (code[j] === '/') j++;
        const nameStart = j;
        while (j < code.length && /[A-Za-z0-9._-]/.test(code.charAt(j))) j++;
        const tagName = code.slice(nameStart, j);
        const isPascal = tagName.length > 0 && /^[A-Z]/.test(tagName);
        tokens.push({
          kind: isPascal ? 'component' : 'element',
          text: code.slice(i, j),
        });
        i = j;
        continue;
      }
      tokens.push({ kind: 'punct', text: '<' });
      i++;
      continue;
    }

    // Self-closing />
    if (code[i] === '/' && code[i + 1] === '>') {
      tokens.push({ kind: 'punct', text: '/>' });
      i += 2;
      continue;
    }

    // >
    if (code[i] === '>') {
      tokens.push({ kind: 'punct', text: '>' });
      i++;
      continue;
    }

    // Number (not preceded by identifier chars)
    if (/[0-9]/.test(code.charAt(i)) && (i === 0 || !/[A-Za-z_$]/.test(code.charAt(i - 1)))) {
      let j = i;
      while (j < code.length && /[0-9._]/.test(code.charAt(j))) j++;
      tokens.push({ kind: 'number', text: code.slice(i, j) });
      i = j;
      continue;
    }

    // Identifier or keyword
    if (/[A-Za-z_$]/.test(code.charAt(i))) {
      let j = i;
      while (j < code.length && /[A-Za-z0-9_$]/.test(code.charAt(j))) j++;
      const word = code.slice(i, j);
      tokens.push({
        kind: KEYWORDS.has(word) ? 'keyword' : 'plain',
        text: word,
      });
      i = j;
      continue;
    }

    // Everything else (whitespace, punctuation, operators)
    tokens.push({ kind: 'plain', text: code.charAt(i) });
    i++;
  }

  return tokens;
}

function highlightCode(code: string): ReactNode {
  return tokenize(code).map((token, idx) => (
    // biome-ignore lint/suspicious/noArrayIndexKey: stable index-keyed spans for static highlight output
    <span key={idx} className={TOKEN_CLASS[token.kind]}>
      {token.text}
    </span>
  ));
}

// --- Playground shell ---------------------------------------------------------

interface PlaygroundProps {
  /** Always-visible live component preview */
  preview: ReactNode;
  /** Generated JSX/TS code string, shown in the Code tab with syntax highlighting */
  code: string;
  /** Control rows rendered in the Controls tab (PlaygroundToggle, PlaygroundTextField, etc.) */
  controls: ReactNode;
  /** Full className for the preview pane; replaces the default when provided */
  previewClass?: string;
  /** Optional note rendered below the code block in the Code tab */
  codeNote?: ReactNode;
}

export function Playground({ preview, code, controls, previewClass, codeNote }: PlaygroundProps) {
  const [tab, setTab] = useState<'controls' | 'code'>('controls');
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  // No overflow-hidden on the shell: preview content (e.g. slider value bubbles)
  // may legitimately extend past the panels. The rounded-card look is preserved
  // by rounding each inner panel's outer corners to match the shell radius.
  return (
    <div className="not-prose rounded-xl border border-fd-border">
      <div className="flex flex-col md:flex-row">
        {/* Preview: always visible, grows to fill its half.
         * Stacked (mobile) → top corners; side-by-side (desktop) → left corners. */}
        <div
          className={`rounded-t-xl md:rounded-t-none md:rounded-l-xl md:flex-1 ${previewClass ?? 'bg-fd-card p-8 min-h-[200px] flex items-center justify-center'}`}
        >
          {preview}
        </div>

        {/* Controls / Code panel.
         * Stacked (mobile) → bottom corners; side-by-side (desktop) → right corners. */}
        <div className="rounded-b-xl md:rounded-b-none md:rounded-r-xl border-t md:border-t-0 md:border-l md:flex-1 md:min-w-0 bg-fd-muted/50 flex flex-col">
          {/* Tab bar: bg-fd-card header, visually distinct from the control rows below.
           * Without shell clipping, round the bar's top-right corner on desktop so
           * its background doesn't bleed past the panel's rounded outer corner. */}
          <div className="flex shrink-0 items-center bg-fd-card border-b border-fd-border px-4 gap-2 md:rounded-tr-xl">
            {(['controls', 'code'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={[
                  'py-2.5 px-1 text-xs font-medium border-b-2 -mb-px transition-colors focus-visible:outline-none focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-fd-primary focus-visible:ring-offset-1',
                  tab === t
                    ? 'border-fd-primary text-fd-foreground'
                    : 'border-transparent text-fd-muted-foreground hover:text-fd-foreground',
                ].join(' ')}
              >
                {t === 'controls' ? 'Controls' : 'Code'}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {tab === 'controls' ? (
            <div className="divide-y divide-fd-border">{controls}</div>
          ) : (
            <div className="px-4 py-3">
              <div className="relative">
                <pre className="rounded-md bg-fd-muted p-4 pr-20 text-xs font-mono overflow-x-auto whitespace-pre">
                  {highlightCode(code)}
                </pre>
                <button
                  type="button"
                  onClick={handleCopy}
                  aria-label="Copy code"
                  className="absolute right-2 top-2 rounded px-2 py-1 text-xs font-medium transition-colors bg-fd-muted-foreground/10 text-fd-muted-foreground hover:bg-fd-muted-foreground/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-primary"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              {codeNote}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Control primitives -------------------------------------------------------

/**
 * Stacked control row: label on its own line, control on the line below,
 * spanning the full panel width. Shared by every playground control so the
 * label styling and row padding stay identical across primitives and any
 * embedded non-primitive control (e.g. the registry Slider in the toast playground).
 */
export function PlaygroundField({
  label,
  children,
  disabled,
}: {
  label: string;
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <div
      className={['px-4 py-3', disabled ? 'opacity-50 pointer-events-none select-none' : '']
        .join(' ')
        .trim()}
    >
      <span className="mb-2 block font-mono text-xs text-fd-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

export function PlaygroundToggle<T extends string>({
  label,
  options,
  value,
  onChange,
  disabled,
}: {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  disabled?: boolean;
}) {
  return (
    <PlaygroundField label={label} disabled={disabled}>
      <div className="inline-flex flex-wrap rounded-md border border-fd-border text-xs">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={[
              'px-3 py-1.5 transition-colors relative first:rounded-l-[5px] last:rounded-r-[5px] focus-visible:outline-none focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-fd-primary focus-visible:ring-offset-1',
              value === opt
                ? 'bg-fd-primary text-fd-primary-foreground font-medium'
                : 'bg-fd-card text-fd-muted-foreground hover:bg-fd-accent',
            ].join(' ')}
          >
            {opt}
          </button>
        ))}
      </div>
    </PlaygroundField>
  );
}

export function PlaygroundTextField({
  label,
  value,
  onChange,
  disabled,
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  placeholder?: string;
  hint?: ReactNode;
}) {
  return (
    <PlaygroundField label={label} disabled={disabled}>
      <div className="flex flex-col gap-1.5">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          className="w-full rounded-md border border-fd-border bg-fd-card px-3 py-1.5 font-mono text-xs text-fd-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-primary disabled:cursor-not-allowed"
        />
        {hint}
      </div>
    </PlaygroundField>
  );
}

export function PlaygroundSlider({
  label,
  min,
  max,
  step = 1,
  value,
  onChange,
  disabled,
  format,
}: {
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
  format?: (v: number) => string;
}) {
  return (
    <PlaygroundField label={label} disabled={disabled}>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={disabled}
          className="flex-1 h-5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-primary focus-visible:ring-offset-1"
          style={{ accentColor: 'var(--color-fd-primary)' }}
        />
        <span className="w-16 shrink-0 text-right font-mono text-xs text-fd-foreground">
          {format ? format(value) : String(value)}
        </span>
      </div>
    </PlaygroundField>
  );
}
