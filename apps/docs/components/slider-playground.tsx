'use client';

import { Slider } from '@artui/registry';
import { useState } from 'react';

type SliderMode = 'single' | 'range';
type SliderOrientation = 'horizontal' | 'vertical';
type SliderDomain = 'numeric' | 'weekday';

const MODES: SliderMode[] = ['single', 'range'];
const ORIENTATIONS: SliderOrientation[] = ['horizontal', 'vertical'];
const DOMAINS: SliderDomain[] = ['numeric', 'weekday'];

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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

export function SliderPlayground() {
  const [mode, setMode] = useState<SliderMode>('single');
  const [orientation, setOrientation] = useState<SliderOrientation>('horizontal');
  const [domain, setDomain] = useState<SliderDomain>('numeric');

  const [singleValue, setSingleValue] = useState(250);
  const [rangeValue, setRangeValue] = useState<readonly [number, number]>([100, 750]);

  const isWeekday = domain === 'weekday';

  const min = 0;
  const max = isWeekday ? 6 : 1000;
  const step = isWeekday ? 1 : 10;

  function formatSingle(v: number): string {
    return isWeekday ? (WEEKDAYS[v] ?? String(v)) : `€${v}`;
  }

  function buildCode(): string {
    if (mode === 'range') {
      const lines: string[] = [];
      lines.push(`<Slider`);
      lines.push(`  min={0}`);
      lines.push(`  max={1000}`);
      lines.push(`  step={10}`);
      lines.push(`  defaultValue={[100, 750]}`);
      lines.push(`  aria-label="Price range"`);
      lines.push(`  formatValue={(v) => \`€\${v}\`}`);
      if (orientation === 'vertical') lines.push(`  orientation="vertical"`);
      lines.push(`  thumbs={[`);
      lines.push(`    { 'aria-label': 'Minimum price' },`);
      lines.push(`    { 'aria-label': 'Maximum price' },`);
      lines.push(`  ]}`);
      lines.push(`/>`);
      return lines.join('\n');
    }

    const lines: string[] = [];
    lines.push(`<Slider`);
    lines.push(`  min={${min}}`);
    lines.push(`  max={${max}}`);
    lines.push(`  step={${step}}`);
    lines.push(`  defaultValue={${isWeekday ? 1 : 250}}`);
    lines.push(`  aria-label="${isWeekday ? 'Pickup day' : 'Maximum price'}"`);
    if (isWeekday) {
      lines.push(`  formatValue={(v) => WEEKDAYS[v]}`);
    } else {
      lines.push(`  formatValue={(v) => \`€\${v}\`}`);
    }
    if (orientation === 'vertical') lines.push(`  orientation="vertical"`);
    lines.push(`/>`);
    return lines.join('\n');
  }

  const previewStyle =
    orientation === 'vertical'
      ? { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '280px' }
      : {};

  return (
    <div className="not-prose rounded-xl border border-fd-border overflow-hidden">
      <div
        className="bg-fd-card p-8 min-h-[180px] flex items-center justify-center"
        style={previewStyle}
      >
        {mode === 'single' ? (
          <Slider
            key={`single-${orientation}-${domain}`}
            min={min}
            max={max}
            step={step}
            value={singleValue}
            onValueChange={(v) => setSingleValue(v)}
            aria-label={isWeekday ? 'Pickup day' : 'Maximum price'}
            formatValue={formatSingle}
            orientation={orientation}
          />
        ) : (
          <Slider
            key={`range-${orientation}`}
            min={0}
            max={1000}
            step={10}
            value={rangeValue}
            onValueChange={(v: readonly [number, number]) => setRangeValue(v)}
            aria-label="Price range"
            formatValue={(v) => `€${v}`}
            orientation={orientation}
            thumbs={[{ 'aria-label': 'Minimum price' }, { 'aria-label': 'Maximum price' }]}
          />
        )}
      </div>

      <div className="border-t bg-fd-muted/50 divide-y divide-fd-border">
        <div className="flex items-center gap-4 px-4 py-3">
          <span className="w-36 shrink-0 font-mono text-xs text-fd-muted-foreground">mode</span>
          <Toggle options={MODES} value={mode} onChange={setMode} />
        </div>

        <div className="flex items-center gap-4 px-4 py-3">
          <span className="w-36 shrink-0 font-mono text-xs text-fd-muted-foreground">
            orientation
          </span>
          <Toggle options={ORIENTATIONS} value={orientation} onChange={setOrientation} />
        </div>

        {mode === 'single' && (
          <div className="flex items-center gap-4 px-4 py-3">
            <span className="w-36 shrink-0 font-mono text-xs text-fd-muted-foreground">domain</span>
            <Toggle options={DOMAINS} value={domain} onChange={setDomain} />
          </div>
        )}

        <div className="px-4 py-3">
          <pre className="rounded-md bg-fd-muted p-4 text-xs font-mono text-fd-foreground overflow-x-auto whitespace-pre">
            {buildCode()}
          </pre>
        </div>
      </div>
    </div>
  );
}
