'use client';

import { Accordion } from '@artui/registry';
import { useState } from 'react';

import { Playground, PlaygroundToggle } from '@/components/playground';

type AccordionMode = 'single' | 'multiple';
type HeadingLevelOption = '2' | '3' | '4' | '5' | '6';

const ACCORDION_MODES: AccordionMode[] = ['single', 'multiple'];
const HEADING_LEVELS: HeadingLevelOption[] = ['2', '3', '4', '5', '6'];

const ITEMS = [
  {
    value: 'keyboard',
    label: 'Keyboard navigation',
    content:
      'Arrow Down and Arrow Up move focus between headers. Home jumps to the first header, End to the last. Enter and Space toggle the focused panel.',
  },
  {
    value: 'focus',
    label: 'Focus management on expand',
    content:
      'When you expand a panel with Enter, Space, or a click, focus moves into the panel. Screen readers announce the panel name and then read the newly visible content immediately.',
  },
  {
    value: 'native',
    label: 'Built on native <details>',
    content:
      'The trigger-to-panel relationship, hidden-when-closed behaviour, and Enter/Space toggle are all provided by the browser for free. artui adds the coordination and keyboard patterns on top.',
  },
];

export function AccordionPlayground() {
  const [mode, setMode] = useState<AccordionMode>('single');
  const [headingLevel, setHeadingLevel] = useState<HeadingLevelOption>('3');
  const [disableLast, setDisableLast] = useState(false);

  const level = Number(headingLevel) as 2 | 3 | 4 | 5 | 6;
  const lastValue = ITEMS[ITEMS.length - 1]?.value;

  const codeLines: string[] = [];
  codeLines.push(
    `<Accordion${mode === 'multiple' ? ' type="multiple"' : ''} headingLevel={${level}}>`,
  );
  for (const item of ITEMS) {
    const isDisabled = disableLast && item.value === lastValue;
    codeLines.push(`  <Accordion.Item value="${item.value}"${isDisabled ? ' disabled' : ''}>`);
    codeLines.push('    <Accordion.Header>');
    codeLines.push(`      <Accordion.Trigger>${item.label}</Accordion.Trigger>`);
    codeLines.push('    </Accordion.Header>');
    codeLines.push('    <Accordion.Panel>');
    codeLines.push(`      <p>${item.content}</p>`);
    codeLines.push('    </Accordion.Panel>');
    codeLines.push('  </Accordion.Item>');
  }
  codeLines.push('</Accordion>');
  const code = codeLines.join('\n');

  const items = ITEMS.map((item) => (
    <Accordion.Item
      key={item.value}
      value={item.value}
      disabled={disableLast && item.value === lastValue}
    >
      <Accordion.Header>
        <Accordion.Trigger>{item.label}</Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Panel>
        <p>{item.content}</p>
      </Accordion.Panel>
    </Accordion.Item>
  ));

  return (
    <Playground
      previewClass="bg-fd-card p-6 min-h-[180px]"
      preview={
        mode === 'single' ? (
          <Accordion headingLevel={level}>{items}</Accordion>
        ) : (
          <Accordion type="multiple" headingLevel={level}>
            {items}
          </Accordion>
        )
      }
      code={code}
      controls={
        <>
          <PlaygroundToggle
            label="type"
            options={ACCORDION_MODES}
            value={mode}
            onChange={setMode}
          />
          <PlaygroundToggle
            label="headingLevel"
            options={HEADING_LEVELS}
            value={headingLevel}
            onChange={setHeadingLevel}
          />
          <PlaygroundToggle
            label="disabled item"
            options={['off', 'on'] as const}
            value={disableLast ? 'on' : 'off'}
            onChange={(v) => setDisableLast(v === 'on')}
          />
        </>
      }
    />
  );
}
