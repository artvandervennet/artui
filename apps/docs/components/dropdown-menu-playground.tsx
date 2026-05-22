'use client';

import { DropdownMenu } from '@artui/registry';
import { useState } from 'react';

type OpenMode = 'uncontrolled' | 'controlled';
type DisabledItem = 'shown' | 'hidden';

const OPEN_MODES: OpenMode[] = ['uncontrolled', 'controlled'];
const DISABLED_ITEM: DisabledItem[] = ['shown', 'hidden'];

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

export function DropdownMenuPlayground() {
  const [openMode, setOpenMode] = useState<OpenMode>('uncontrolled');
  const [disabledItem, setDisabledItem] = useState<DisabledItem>('shown');
  const [controlledOpen, setControlledOpen] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const isControlled = openMode === 'controlled';
  const showDisabled = disabledItem === 'shown';

  const rootProps = isControlled ? { open: controlledOpen, onOpenChange: setControlledOpen } : {};

  const codeLines: string[] = [];
  if (isControlled) {
    codeLines.push('const [open, setOpen] = useState(false);');
    codeLines.push('');
  }
  codeLines.push(`<DropdownMenu${isControlled ? ' open={open} onOpenChange={setOpen}' : ''}>`);
  codeLines.push('  <DropdownMenu.Trigger>Account</DropdownMenu.Trigger>');
  codeLines.push('  <DropdownMenu.Content>');
  codeLines.push(
    "    <DropdownMenu.Item onSelect={() => navigate('/profile')}>Profile</DropdownMenu.Item>",
  );
  codeLines.push(
    "    <DropdownMenu.Item onSelect={() => navigate('/settings')}>Settings</DropdownMenu.Item>",
  );
  if (showDisabled) {
    codeLines.push('    <DropdownMenu.Item onSelect={deleteAccount} disabled>');
    codeLines.push('      Delete account (unavailable)');
    codeLines.push('    </DropdownMenu.Item>');
  }
  codeLines.push('    <DropdownMenu.Separator />');
  codeLines.push('    <DropdownMenu.Sub>');
  codeLines.push('      <DropdownMenu.SubTrigger>Preferences</DropdownMenu.SubTrigger>');
  codeLines.push('      <DropdownMenu.SubContent>');
  codeLines.push(
    "        <DropdownMenu.Item onSelect={() => setTheme('light')}>Light theme</DropdownMenu.Item>",
  );
  codeLines.push(
    "        <DropdownMenu.Item onSelect={() => setTheme('dark')}>Dark theme</DropdownMenu.Item>",
  );
  codeLines.push('      </DropdownMenu.SubContent>');
  codeLines.push('    </DropdownMenu.Sub>');
  codeLines.push('    <DropdownMenu.Separator />');
  codeLines.push('    <DropdownMenu.Item onSelect={signOut}>Sign out</DropdownMenu.Item>');
  codeLines.push('  </DropdownMenu.Content>');
  codeLines.push('</DropdownMenu>');
  const code = codeLines.join('\n');

  return (
    <div className="not-prose rounded-xl border border-fd-border overflow-hidden">
      <div className="flex flex-col items-center justify-center bg-fd-card p-8 min-h-[220px] gap-4">
        <DropdownMenu {...rootProps}>
          <DropdownMenu.Trigger>Account</DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Item onSelect={() => setLastAction('Navigated to profile')}>
              Profile
            </DropdownMenu.Item>
            <DropdownMenu.Item onSelect={() => setLastAction('Navigated to settings')}>
              Settings
            </DropdownMenu.Item>
            {showDisabled && (
              <DropdownMenu.Item onSelect={() => setLastAction('Delete')} disabled>
                Delete account (unavailable)
              </DropdownMenu.Item>
            )}
            <DropdownMenu.Separator />
            <DropdownMenu.Sub>
              <DropdownMenu.SubTrigger>Preferences</DropdownMenu.SubTrigger>
              <DropdownMenu.SubContent>
                <DropdownMenu.Item onSelect={() => setLastAction('Theme: light')}>
                  Light theme
                </DropdownMenu.Item>
                <DropdownMenu.Item onSelect={() => setLastAction('Theme: dark')}>
                  Dark theme
                </DropdownMenu.Item>
              </DropdownMenu.SubContent>
            </DropdownMenu.Sub>
            <DropdownMenu.Separator />
            <DropdownMenu.Item onSelect={() => setLastAction('Signed out')}>
              Sign out
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu>

        <p className="text-xs text-fd-muted-foreground">
          Try <kbd className="font-mono">Down</kbd> / <kbd className="font-mono">Up</kbd>,
          typeahead, <kbd className="font-mono">Home</kbd> / <kbd className="font-mono">End</kbd>,{' '}
          <kbd className="font-mono">Escape</kbd>, and <kbd className="font-mono">Arrow Right</kbd>{' '}
          on Preferences.
        </p>

        {lastAction && (
          <p className="text-xs text-fd-muted-foreground">
            Last action: <span className="font-mono">{lastAction}</span>
          </p>
        )}
      </div>

      <div className="border-t bg-fd-muted/50 divide-y divide-fd-border">
        <div className="flex items-center gap-4 px-4 py-3">
          <span className="w-36 shrink-0 font-mono text-xs text-fd-muted-foreground">
            open mode
          </span>
          <Toggle options={OPEN_MODES} value={openMode} onChange={setOpenMode} />
        </div>

        <div className="flex items-center gap-4 px-4 py-3">
          <span className="w-36 shrink-0 font-mono text-xs text-fd-muted-foreground">
            disabled item
          </span>
          <Toggle options={DISABLED_ITEM} value={disabledItem} onChange={setDisabledItem} />
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
