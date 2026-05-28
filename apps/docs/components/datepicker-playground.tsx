'use client';

import { Datepicker } from '@artui/registry';
import { useState } from 'react';

import { Playground, PlaygroundToggle } from '@/components/playground';

type LocaleOption = 'nl-BE' | 'en-US' | 'ja-JP';
type RangeOption = 'none' | 'this-year' | 'future-only';
type DisabledOption = 'none' | 'weekends' | 'odd-days';
type ErrorOption = 'none' | 'shown';
type RequiredOption = 'no' | 'yes';

const LOCALES: LocaleOption[] = ['nl-BE', 'en-US', 'ja-JP'];
const RANGES: RangeOption[] = ['none', 'this-year', 'future-only'];
const DISABLED: DisabledOption[] = ['none', 'weekends', 'odd-days'];
const ERRORS: ErrorOption[] = ['none', 'shown'];
const REQUIREDS: RequiredOption[] = ['no', 'yes'];

const SAMPLE_ERROR = 'Please choose a date.';

export function DatepickerPlayground() {
  const [date, setDate] = useState<Date | null>(null);
  const [locale, setLocale] = useState<LocaleOption>('nl-BE');
  const [range, setRange] = useState<RangeOption>('none');
  const [disabledRule, setDisabledRule] = useState<DisabledOption>('none');
  const [errorRule, setErrorRule] = useState<ErrorOption>('none');
  const [requiredRule, setRequiredRule] = useState<RequiredOption>('no');

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

  const error = errorRule === 'shown' ? SAMPLE_ERROR : undefined;
  const required = requiredRule === 'yes';

  // Build live code string. min/max are emitted as intent-expressing
  // expressions (today / start-of-year) rather than frozen numeric literals,
  // so the snippet stays correct whenever a reader copies it.
  const codeLines = ['<Datepicker', '  label="Appointment date"', `  locale="${locale}"`];
  if (range === 'this-year') {
    codeLines.push('  min={new Date(new Date().getFullYear(), 0, 1)}');
    codeLines.push('  max={new Date(new Date().getFullYear(), 11, 31)}');
  } else if (range === 'future-only') {
    codeLines.push('  min={new Date()}');
  }
  if (disabledRule === 'weekends') {
    codeLines.push('  isDateDisabled={(d) => d.getDay() === 0 || d.getDay() === 6}');
  } else if (disabledRule === 'odd-days') {
    codeLines.push('  isDateDisabled={(d) => d.getDate() % 2 !== 0}');
  }
  if (required) {
    codeLines.push('  required');
  }
  if (error) {
    codeLines.push(`  error="${error}"`);
  }
  codeLines.push('  value={date}');
  codeLines.push('  onChange={setDate}');
  codeLines.push('/>');
  const code = codeLines.join('\n');

  const displayValue = date
    ? new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(date)
    : 'No date selected';

  return (
    <Playground
      previewClass="bg-fd-card p-8 min-h-[220px] flex flex-col items-center justify-center gap-4"
      preview={
        <>
          <Datepicker
            label="Appointment date"
            value={date}
            onChange={setDate}
            locale={locale}
            min={min}
            max={max}
            isDateDisabled={isDateDisabled}
            required={required}
            error={error}
          />
          <p className="text-xs text-fd-muted-foreground mt-2">
            Selected: <span className="font-mono text-fd-foreground">{displayValue}</span>
          </p>
          <p className="text-xs text-fd-muted-foreground">
            The selected day uses the themeable <span className="font-mono">--artui-accent</span>{' '}
            color.
          </p>
        </>
      }
      code={code}
      controls={
        <>
          <PlaygroundToggle label="locale" options={LOCALES} value={locale} onChange={setLocale} />
          <PlaygroundToggle label="min/max" options={RANGES} value={range} onChange={setRange} />
          <PlaygroundToggle
            label="isDateDisabled"
            options={DISABLED}
            value={disabledRule}
            onChange={setDisabledRule}
          />
          <PlaygroundToggle
            label="required"
            options={REQUIREDS}
            value={requiredRule}
            onChange={setRequiredRule}
          />
          <PlaygroundToggle
            label="error"
            options={ERRORS}
            value={errorRule}
            onChange={setErrorRule}
          />
        </>
      }
    />
  );
}
