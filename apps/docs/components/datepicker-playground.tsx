'use client';

import { Datepicker } from '@artui/registry';
import { useState } from 'react';

type LocaleOption = 'nl-BE' | 'en-US' | 'ja-JP';
type RangeOption = 'none' | 'this-year' | 'future-only';
type DisabledOption = 'none' | 'weekends' | 'odd-days';

const LOCALES: LocaleOption[] = ['nl-BE', 'en-US', 'ja-JP'];
const RANGES: RangeOption[] = ['none', 'this-year', 'future-only'];
const DISABLED: DisabledOption[] = ['none', 'weekends', 'odd-days'];

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

export function DatepickerPlayground() {
  const [date, setDate] = useState<Date | null>(null);
  const [locale, setLocale] = useState<LocaleOption>('nl-BE');
  const [range, setRange] = useState<RangeOption>('none');
  const [disabledRule, setDisabledRule] = useState<DisabledOption>('none');

  const now = new Date();
  const min =
    range === 'this-year'
      ? new Date(now.getFullYear(), 0, 1)
      : range === 'future-only'
        ? new Date(now.getFullYear(), now.getMonth(), now.getDate())
        : undefined;
  const max = range === 'this-year' ? new Date(now.getFullYear(), 11, 31) : undefined;

  const isDateDisabled =
    disabledRule === 'weekends'
      ? (d: Date) => d.getDay() === 0 || d.getDay() === 6
      : disabledRule === 'odd-days'
        ? (d: Date) => d.getDate() % 2 !== 0
        : undefined;

  // Build live code string
  const codeLines = ['<Datepicker', '  label="Appointment date"', `  locale="${locale}"`];
  if (range !== 'none') {
    if (min)
      codeLines.push(`  min={new Date(${min.getFullYear()}, ${min.getMonth()}, ${min.getDate()})}`);
    if (max)
      codeLines.push(`  max={new Date(${max.getFullYear()}, ${max.getMonth()}, ${max.getDate()})}`);
  }
  if (disabledRule === 'weekends') {
    codeLines.push('  isDateDisabled={(d) => d.getDay() === 0 || d.getDay() === 6}');
  } else if (disabledRule === 'odd-days') {
    codeLines.push('  isDateDisabled={(d) => d.getDate() % 2 !== 0}');
  }
  codeLines.push('  value={date}');
  codeLines.push('  onChange={setDate}');
  codeLines.push('/>');
  const code = codeLines.join('\n');

  const displayValue = date
    ? new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(date)
    : 'No date selected';

  return (
    <div className="not-prose rounded-xl border border-fd-border overflow-hidden">
      {/* Preview */}
      <div className="flex flex-col items-center justify-center bg-fd-card p-8 min-h-[220px] gap-4">
        <Datepicker
          label="Appointment date"
          value={date}
          onChange={setDate}
          locale={locale}
          min={min}
          max={max}
          isDateDisabled={isDateDisabled}
        />
        <p className="text-xs text-fd-muted-foreground mt-2">
          Selected: <span className="font-mono text-fd-foreground">{displayValue}</span>
        </p>
      </div>

      {/* Controls */}
      <div className="border-t bg-fd-background divide-y divide-fd-border">
        {/* locale */}
        <div className="flex items-center gap-4 px-4 py-3">
          <span className="w-28 shrink-0 font-mono text-xs text-fd-muted-foreground">locale</span>
          <Toggle options={LOCALES} value={locale} onChange={setLocale} />
        </div>

        {/* range */}
        <div className="flex items-center gap-4 px-4 py-3">
          <span className="w-28 shrink-0 font-mono text-xs text-fd-muted-foreground">min/max</span>
          <Toggle options={RANGES} value={range} onChange={setRange} />
        </div>

        {/* isDateDisabled */}
        <div className="flex items-center gap-4 px-4 py-3">
          <span className="w-28 shrink-0 font-mono text-xs text-fd-muted-foreground">
            isDateDisabled
          </span>
          <Toggle options={DISABLED} value={disabledRule} onChange={setDisabledRule} />
        </div>

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
