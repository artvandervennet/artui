'use client';

import { Accordion } from '@artui/registry';
import { useState } from 'react';

type AccordionMode = 'single' | 'multiple';

const ACCORDION_MODES: AccordionMode[] = ['single', 'multiple'];

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

  const codeLines: string[] = [];
  codeLines.push(`<Accordion${mode === 'multiple' ? ' type="multiple"' : ''} headingLevel={3}>`);
  for (const item of ITEMS) {
    codeLines.push(`  <Accordion.Item value="${item.value}">`);
    codeLines.push('    <Accordion.Header>');
    codeLines.push(`      <Accordion.Trigger>${item.label}</Accordion.Trigger>`);
    codeLines.push('    </Accordion.Header>');
    codeLines.push(`    <Accordion.Panel>`);
    codeLines.push(`      <p>${item.content}</p>`);
    codeLines.push('    </Accordion.Panel>');
    codeLines.push('  </Accordion.Item>');
  }
  codeLines.push('</Accordion>');
  const code = codeLines.join('\n');

  return (
    <div className="not-prose rounded-xl border border-fd-border overflow-hidden">
      <div className="bg-fd-card p-6 min-h-[180px]">
        {mode === 'single' ? (
          <Accordion headingLevel={3}>
            {ITEMS.map((item) => (
              <Accordion.Item key={item.value} value={item.value}>
                <Accordion.Header>
                  <Accordion.Trigger>{item.label}</Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Panel>
                  <p>{item.content}</p>
                </Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion>
        ) : (
          <Accordion type="multiple" headingLevel={3}>
            {ITEMS.map((item) => (
              <Accordion.Item key={item.value} value={item.value}>
                <Accordion.Header>
                  <Accordion.Trigger>{item.label}</Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Panel>
                  <p>{item.content}</p>
                </Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion>
        )}
      </div>

      <div className="border-t bg-fd-background divide-y divide-fd-border">
        <div className="flex items-center gap-4 px-4 py-3">
          <span className="w-36 shrink-0 font-mono text-xs text-fd-muted-foreground">type</span>
          <Toggle options={ACCORDION_MODES} value={mode} onChange={setMode} />
        </div>

        <div className="px-4 py-3">
          <pre className="rounded-md bg-fd-muted p-4 text-xs font-mono text-fd-foreground overflow-x-auto whitespace-pre">
            {code}
          </pre>
        </div>
      </div>
    </div>
  );
}
