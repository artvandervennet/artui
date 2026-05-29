'use client';

import { Slider } from '@artui/registry';
import { useState } from 'react';

import { Playground, PlaygroundSlider, PlaygroundToggle } from '@/components/playground';

type SliderMode = 'single' | 'range';
type SliderOrientation = 'horizontal' | 'vertical';
type SliderDomain = 'numeric' | 'weekday';
type DisabledState = 'off' | 'on';
type ValuesState = 'off' | 'on';

const MODES: SliderMode[] = ['single', 'range'];
const ORIENTATIONS: SliderOrientation[] = ['horizontal', 'vertical'];
const DOMAINS: SliderDomain[] = ['numeric', 'weekday'];
const DISABLED_STATES: DisabledState[] = ['off', 'on'];
const VALUES_STATES: ValuesState[] = ['off', 'on'];

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function SliderPlayground() {
  const [mode, setMode] = useState<SliderMode>('single');
  const [orientation, setOrientation] = useState<SliderOrientation>('horizontal');
  const [domain, setDomain] = useState<SliderDomain>('numeric');
  const [disabled, setDisabled] = useState<DisabledState>('off');
  const [values, setValues] = useState<ValuesState>('off');

  const [singleValue, setSingleValue] = useState(250);
  const [rangeValue, setRangeValue] = useState<readonly [number, number]>([100, 750]);

  const [minValue, setMinValue] = useState(0);
  const [maxValue, setMaxValue] = useState(1000);
  const [stepValue, setStepValue] = useState(10);

  const isWeekday = domain === 'weekday';
  const isDisabled = disabled === 'on';
  const showValues = values === 'on';

  // Weekday domain (single mode only) stays a small 0-6 integer range so the WEEKDAYS lookup
  // stays valid; every other case is driven by the min/max/step controls.
  const min = mode === 'single' && isWeekday ? 0 : minValue;
  const max = mode === 'single' && isWeekday ? 6 : maxValue;
  const step = mode === 'single' && isWeekday ? 1 : stepValue;

  function formatSingle(v: number): string {
    return isWeekday ? (WEEKDAYS[v] ?? String(v)) : `€${v}`;
  }

  function buildCode(): string {
    if (mode === 'range') {
      const lines: string[] = [];
      lines.push('<Slider');
      lines.push(`  min={${min}}`);
      lines.push(`  max={${max}}`);
      lines.push(`  step={${step}}`);
      lines.push('  defaultValue={[100, 750]}');
      lines.push('  aria-label="Price range"');
      lines.push(`  formatValue={(v) => \`€\${v}\`}`);
      if (orientation === 'vertical') lines.push('  orientation="vertical"');
      if (isDisabled) lines.push('  disabled');
      if (showValues) lines.push('  showValues');
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
    lines.push(`  defaultValue={${isWeekday ? 1 : Math.min(Math.max(250, min), max)}}`);
    lines.push(`  aria-label="${isWeekday ? 'Pickup day' : 'Maximum price'}"`);
    if (isWeekday) {
      lines.push('  formatValue={(v) => WEEKDAYS[v]}');
    } else {
      lines.push(`  formatValue={(v) => \`€\${v}\`}`);
    }
    if (orientation === 'vertical') lines.push('  orientation="vertical"');
    if (isDisabled) lines.push('  disabled');
    if (showValues) lines.push('  showValues');
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
            value={Math.min(Math.max(singleValue, min), max)}
            onValueChange={(v) => setSingleValue(v)}
            aria-label={isWeekday ? 'Pickup day' : 'Maximum price'}
            formatValue={formatSingle}
            orientation={orientation}
            disabled={isDisabled}
            showValues={showValues}
          />
        ) : (
          <Slider
            key={`range-${orientation}`}
            min={min}
            max={max}
            step={step}
            value={[
              Math.min(Math.max(rangeValue[0], min), max),
              Math.min(Math.max(rangeValue[1], min), max),
            ]}
            onValueChange={(v: readonly [number, number]) => setRangeValue(v)}
            aria-label="Price range"
            formatValue={(v) => `€${v}`}
            orientation={orientation}
            disabled={isDisabled}
            showValues={showValues}
            thumbs={[{ 'aria-label': 'Minimum price' }, { 'aria-label': 'Maximum price' }]}
          />
        )
      }
      code={buildCode()}
      codeNote={
        <p className="mt-2 text-xs text-fd-muted-foreground">
          The preview above is controlled (<code>value</code> / <code>onValueChange</code>) so it
          stays live. The snippet shows the simpler uncontrolled <code>defaultValue</code> form;
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
          {(mode === 'range' || (mode === 'single' && domain === 'numeric')) && (
            <>
              <PlaygroundSlider
                label="min"
                min={0}
                max={500}
                step={10}
                value={minValue}
                onChange={setMinValue}
              />
              <PlaygroundSlider
                label="max"
                min={100}
                max={1000}
                step={10}
                value={maxValue}
                onChange={setMaxValue}
              />
              <PlaygroundSlider
                label="step"
                min={1}
                max={100}
                step={1}
                value={stepValue}
                onChange={setStepValue}
              />
            </>
          )}
          <PlaygroundToggle
            label="disabled"
            options={DISABLED_STATES}
            value={disabled}
            onChange={setDisabled}
          />
          <PlaygroundToggle
            label="values"
            options={VALUES_STATES}
            value={values}
            onChange={setValues}
          />
        </>
      }
    />
  );
}
