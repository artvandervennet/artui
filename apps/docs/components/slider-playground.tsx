'use client';

import { Slider } from '@artui/registry';
import { useState } from 'react';

import { Playground, PlaygroundToggle } from '@/components/playground';

type SliderMode = 'single' | 'range';
type SliderOrientation = 'horizontal' | 'vertical';
type SliderDomain = 'numeric' | 'weekday';
type DisabledState = 'off' | 'on';

const MODES: SliderMode[] = ['single', 'range'];
const ORIENTATIONS: SliderOrientation[] = ['horizontal', 'vertical'];
const DOMAINS: SliderDomain[] = ['numeric', 'weekday'];
const DISABLED_STATES: DisabledState[] = ['off', 'on'];

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function SliderPlayground() {
  const [mode, setMode] = useState<SliderMode>('single');
  const [orientation, setOrientation] = useState<SliderOrientation>('horizontal');
  const [domain, setDomain] = useState<SliderDomain>('numeric');
  const [disabled, setDisabled] = useState<DisabledState>('off');

  const [singleValue, setSingleValue] = useState(250);
  const [rangeValue, setRangeValue] = useState<readonly [number, number]>([100, 750]);

  const isWeekday = domain === 'weekday';
  const isDisabled = disabled === 'on';

  const min = 0;
  const max = isWeekday ? 6 : 1000;
  const step = isWeekday ? 1 : 10;

  function formatSingle(v: number): string {
    return isWeekday ? (WEEKDAYS[v] ?? String(v)) : `€${v}`;
  }

  function buildCode(): string {
    if (mode === 'range') {
      const lines: string[] = [];
      lines.push('<Slider');
      lines.push('  min={0}');
      lines.push('  max={1000}');
      lines.push('  step={10}');
      lines.push('  defaultValue={[100, 750]}');
      lines.push('  aria-label="Price range"');
      lines.push(`  formatValue={(v) => \`€\${v}\`}`);
      if (orientation === 'vertical') lines.push('  orientation="vertical"');
      if (isDisabled) lines.push('  disabled');
      lines.push('  thumbs={[');
      lines.push("    { 'aria-label': 'Minimum price' },");
      lines.push("    { 'aria-label': 'Maximum price' },");
      lines.push('  ]}');
      lines.push('/>');
      return lines.join('\n');
    }

    const lines: string[] = [];
    // Weekday domain needs the lookup array in scope for formatValue.
    if (isWeekday) {
      lines.push(
        `const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];`,
      );
      lines.push('');
    }
    lines.push('<Slider');
    lines.push(`  min={${min}}`);
    lines.push(`  max={${max}}`);
    lines.push(`  step={${step}}`);
    lines.push(`  defaultValue={${isWeekday ? 1 : 250}}`);
    lines.push(`  aria-label="${isWeekday ? 'Pickup day' : 'Maximum price'}"`);
    if (isWeekday) {
      lines.push('  formatValue={(v) => WEEKDAYS[v]}');
    } else {
      lines.push(`  formatValue={(v) => \`€\${v}\`}`);
    }
    if (orientation === 'vertical') lines.push('  orientation="vertical"');
    if (isDisabled) lines.push('  disabled');
    lines.push('/>');
    return lines.join('\n');
  }

  return (
    <Playground
      previewClass={
        orientation === 'vertical'
          ? 'bg-fd-card p-8 min-h-[280px] flex items-center justify-center'
          : 'bg-fd-card p-8 min-h-[180px] flex items-center justify-center'
      }
      preview={
        mode === 'single' ? (
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
            disabled={isDisabled}
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
            disabled={isDisabled}
            thumbs={[{ 'aria-label': 'Minimum price' }, { 'aria-label': 'Maximum price' }]}
          />
        )
      }
      code={buildCode()}
      codeNote={
        <p className="mt-2 text-xs text-fd-muted-foreground">
          The preview above is controlled (<code>value</code> / <code>onValueChange</code>) so it
          stays live. The snippet shows the simpler uncontrolled <code>defaultValue</code> form —
          production usage can use either.
        </p>
      }
      controls={
        <>
          <PlaygroundToggle label="mode" options={MODES} value={mode} onChange={setMode} />
          <PlaygroundToggle
            label="orientation"
            options={ORIENTATIONS}
            value={orientation}
            onChange={setOrientation}
          />
          {mode === 'single' && (
            <PlaygroundToggle
              label="domain"
              options={DOMAINS}
              value={domain}
              onChange={setDomain}
            />
          )}
          <PlaygroundToggle
            label="disabled"
            options={DISABLED_STATES}
            value={disabled}
            onChange={setDisabled}
          />
        </>
      }
    />
  );
}
