'use client';

import { Select } from '@artui/registry';
import { useState } from 'react';

type SelectMode = 'single' | 'multi';
type GroupMode = 'flat' | 'grouped';
type ClearAll = 'off' | 'on';
type Disabled = 'off' | 'on';

const SELECT_MODES: SelectMode[] = ['single', 'multi'];
const GROUP_MODES: GroupMode[] = ['flat', 'grouped'];
const CLEAR_ALL_MODES: ClearAll[] = ['off', 'on'];
const DISABLED_MODES: Disabled[] = ['off', 'on'];

function Toggle<T extends string>({
  options,
  value,
  onChange,
  disabled,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  disabled?: boolean;
}) {
  return (
    <div
      className={[
        'flex rounded-md border border-fd-border overflow-hidden text-xs',
        disabled ? 'opacity-50 pointer-events-none' : '',
      ]
        .join(' ')
        .trim()}
    >
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

const FLAT_OPTIONS = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'angular', label: 'Angular' },
  { value: 'solid', label: 'Solid' },
];

const GROUPED_OPTIONS = {
  'Component-based': [
    { value: 'react', label: 'React' },
    { value: 'vue', label: 'Vue' },
    { value: 'svelte', label: 'Svelte' },
  ],
  'Full-featured': [
    { value: 'angular', label: 'Angular' },
    { value: 'solid', label: 'Solid' },
  ],
};

export function SelectPlayground() {
  const [selectMode, setSelectMode] = useState<SelectMode>('multi');
  const [groupMode, setGroupMode] = useState<GroupMode>('flat');
  const [clearAll, setClearAll] = useState<ClearAll>('off');
  const [disabled, setDisabled] = useState<Disabled>('off');

  const [multiValue, setMultiValue] = useState<readonly string[]>(['react']);
  const [singleValue, setSingleValue] = useState('react');

  const isMulti = selectMode === 'multi';
  const isGrouped = groupMode === 'grouped';
  const hasClearAll = clearAll === 'on';
  const isDisabled = disabled === 'on';

  function buildCode(): string {
    const lines: string[] = [];

    if (isMulti) {
      const attrs = ['multiple', 'defaultValue={["react"]}', 'onValueChange={setFrameworks}'];
      if (isDisabled) attrs.push('disabled');

      lines.push('<Select');
      for (const attr of attrs) lines.push(`  ${attr}`);
      lines.push('>');
      lines.push(
        hasClearAll
          ? '  <Select.Control aria-label="Frameworks" showClearAll clearAllLabel="Clear all" />'
          : '  <Select.Control aria-label="Frameworks" />',
      );
      lines.push('  <Select.Content>');
      pushOptions(lines, '    ');
      lines.push('  </Select.Content>');
      lines.push('</Select>');
      return lines.join('\n');
    }

    const attrs = [
      'aria-label="Framework"',
      'defaultValue="react"',
      'onValueChange={setFramework}',
    ];
    if (isDisabled) attrs.push('disabled');

    lines.push('<Select');
    for (const attr of attrs) lines.push(`  ${attr}`);
    lines.push('>');
    pushOptions(lines, '  ');
    lines.push('</Select>');
    return lines.join('\n');
  }

  function pushOptions(lines: string[], indent: string) {
    if (isGrouped) {
      for (const [group, opts] of Object.entries(GROUPED_OPTIONS)) {
        lines.push(`${indent}<Select.Group label="${group}">`);
        for (const opt of opts) {
          lines.push(`${indent}  <Select.Option value="${opt.value}">${opt.label}</Select.Option>`);
        }
        lines.push(`${indent}</Select.Group>`);
      }
      return;
    }
    for (const opt of FLAT_OPTIONS) {
      lines.push(`${indent}<Select.Option value="${opt.value}">${opt.label}</Select.Option>`);
    }
  }

  function renderOptions() {
    if (isGrouped) {
      return Object.entries(GROUPED_OPTIONS).map(([group, opts]) => (
        <Select.Group key={group} label={group}>
          {opts.map((opt) => (
            <Select.Option key={opt.value} value={opt.value}>
              {opt.label}
            </Select.Option>
          ))}
        </Select.Group>
      ));
    }
    return FLAT_OPTIONS.map((opt) => (
      <Select.Option key={opt.value} value={opt.value}>
        {opt.label}
      </Select.Option>
    ));
  }

  return (
    <div className="not-prose rounded-xl border border-fd-border overflow-hidden">
      <div className="flex flex-col items-start justify-center bg-fd-card p-8 min-h-[220px] gap-4">
        {isMulti ? (
          <Select multiple value={multiValue} onValueChange={setMultiValue} disabled={isDisabled}>
            <Select.Control
              aria-label="Frameworks"
              placeholder="Select frameworks"
              showClearAll={hasClearAll}
              clearAllLabel="Clear all"
            />
            <Select.Content>{renderOptions()}</Select.Content>
          </Select>
        ) : (
          <Select
            aria-label="Framework"
            value={singleValue}
            onValueChange={setSingleValue}
            disabled={isDisabled}
          >
            {renderOptions()}
          </Select>
        )}

        {isMulti && (
          <p className="text-xs text-fd-muted-foreground">
            Try <kbd className="font-mono">Space</kbd> / <kbd className="font-mono">Enter</kbd> to
            toggle, <kbd className="font-mono">Backspace</kbd> on the trigger to remove the last
            tag, <kbd className="font-mono">Escape</kbd> to close.
          </p>
        )}
      </div>

      <div className="border-t bg-fd-muted/50 divide-y divide-fd-border">
        <div className="flex items-center gap-4 px-4 py-3">
          <span className="w-36 shrink-0 font-mono text-xs text-fd-muted-foreground">mode</span>
          <Toggle options={SELECT_MODES} value={selectMode} onChange={setSelectMode} />
        </div>

        <div className="flex items-center gap-4 px-4 py-3">
          <span className="w-36 shrink-0 font-mono text-xs text-fd-muted-foreground">groups</span>
          <Toggle options={GROUP_MODES} value={groupMode} onChange={setGroupMode} />
        </div>

        <div className="flex items-center gap-4 px-4 py-3">
          <span className="w-36 shrink-0 font-mono text-xs text-fd-muted-foreground">
            clear-all
          </span>
          <Toggle
            options={CLEAR_ALL_MODES}
            value={clearAll}
            onChange={setClearAll}
            disabled={!isMulti}
          />
        </div>

        <div className="flex items-center gap-4 px-4 py-3">
          <span className="w-36 shrink-0 font-mono text-xs text-fd-muted-foreground">disabled</span>
          <Toggle options={DISABLED_MODES} value={disabled} onChange={setDisabled} />
        </div>

        <div className="px-4 py-3">
          <pre className="rounded-md bg-fd-muted p-4 text-xs font-mono text-fd-foreground overflow-x-auto whitespace-pre">
            {buildCode()}
          </pre>
        </div>
      </div>
    </div>
  );
}
