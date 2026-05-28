'use client';

import { Select } from '@artui/registry';
import { useState } from 'react';

import { Playground, PlaygroundToggle } from '@/components/playground';

type SelectMode = 'single' | 'multi';
type GroupMode = 'flat' | 'grouped';
type ClearAll = 'off' | 'on';
type Disabled = 'off' | 'on';

const SELECT_MODES: SelectMode[] = ['single', 'multi'];
const GROUP_MODES: GroupMode[] = ['flat', 'grouped'];
const CLEAR_ALL_MODES: ClearAll[] = ['off', 'on'];
const DISABLED_MODES: Disabled[] = ['off', 'on'];

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

      const controlAttrs = ['aria-label="Frameworks"', 'placeholder="Select frameworks"'];
      if (hasClearAll) controlAttrs.push('showClearAll', 'clearAllLabel="Clear all"');
      lines.push(`  <Select.Control ${controlAttrs.join(' ')} />`);

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
    <Playground
      previewClass="bg-fd-card p-8 min-h-[220px] flex flex-col items-start justify-center gap-4"
      preview={
        <>
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
        </>
      }
      code={buildCode()}
      controls={
        <>
          <PlaygroundToggle
            label="mode"
            options={SELECT_MODES}
            value={selectMode}
            onChange={setSelectMode}
          />
          <PlaygroundToggle
            label="groups"
            options={GROUP_MODES}
            value={groupMode}
            onChange={setGroupMode}
          />
          <PlaygroundToggle
            label="clear-all"
            options={CLEAR_ALL_MODES}
            value={clearAll}
            onChange={setClearAll}
            disabled={!isMulti}
          />
          <PlaygroundToggle
            label="disabled"
            options={DISABLED_MODES}
            value={disabled}
            onChange={setDisabled}
          />
        </>
      }
    />
  );
}
