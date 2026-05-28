'use client';

import { DropdownMenu } from '@artui/registry';
import { useState } from 'react';

import { Playground, PlaygroundToggle } from '@/components/playground';

type OpenMode = 'uncontrolled' | 'controlled';
type DisabledItem = 'shown' | 'hidden';

const OPEN_MODES: OpenMode[] = ['uncontrolled', 'controlled'];
const DISABLED_ITEM: DisabledItem[] = ['shown', 'hidden'];

export function DropdownMenuPlayground() {
  const [openMode, setOpenMode] = useState<OpenMode>('uncontrolled');
  const [disabledItem, setDisabledItem] = useState<DisabledItem>('shown');
  const [controlledOpen, setControlledOpen] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const isControlled = openMode === 'controlled';
  const showDisabled = disabledItem === 'shown';

  const rootProps = isControlled ? { open: controlledOpen, onOpenChange: setControlledOpen } : {};

  const codeLines: string[] = [];
  codeLines.push("import { useState } from 'react';");
  codeLines.push("import { useRouter } from 'next/navigation';");
  codeLines.push("import { DropdownMenu } from '@/components/ui/dropdown-menu';");
  codeLines.push('');
  codeLines.push('function AccountMenu() {');
  codeLines.push('  const router = useRouter();');
  if (isControlled) {
    codeLines.push('  const [open, setOpen] = useState(false);');
  }
  codeLines.push('  const [theme, setTheme] = useState<"light" | "dark">("light");');
  codeLines.push('');
  codeLines.push('  const signOut = () => {');
  codeLines.push("    document.cookie = 'session=; Max-Age=0; path=/';");
  codeLines.push("    router.push('/login');");
  codeLines.push('  };');
  codeLines.push('');
  codeLines.push('  return (');
  if (isControlled) {
    codeLines.push('    <>');
    codeLines.push('      <button type="button" onClick={() => setOpen(true)}>');
    codeLines.push('        Open from outside');
    codeLines.push('      </button>');
    codeLines.push('      <DropdownMenu open={open} onOpenChange={setOpen}>');
  } else {
    codeLines.push('    <DropdownMenu>');
  }
  const ind = isControlled ? '        ' : '      ';
  codeLines.push(`${ind}<DropdownMenu.Trigger>Account</DropdownMenu.Trigger>`);
  codeLines.push(`${ind}<DropdownMenu.Content>`);
  codeLines.push(`${ind}  <DropdownMenu.Item onSelect={() => router.push('/profile')}>`);
  codeLines.push(`${ind}    Profile`);
  codeLines.push(`${ind}  </DropdownMenu.Item>`);
  codeLines.push(`${ind}  <DropdownMenu.Item onSelect={() => router.push('/settings')}>`);
  codeLines.push(`${ind}    Settings`);
  codeLines.push(`${ind}  </DropdownMenu.Item>`);
  if (showDisabled) {
    codeLines.push(
      `${ind}  <DropdownMenu.Item onSelect={() => router.push('/account/delete')} disabled>`,
    );
    codeLines.push(`${ind}    Delete account (unavailable)`);
    codeLines.push(`${ind}  </DropdownMenu.Item>`);
  }
  codeLines.push(`${ind}  <DropdownMenu.Separator />`);
  codeLines.push(`${ind}  <DropdownMenu.Sub>`);
  codeLines.push(`${ind}    <DropdownMenu.SubTrigger>Preferences</DropdownMenu.SubTrigger>`);
  codeLines.push(`${ind}    <DropdownMenu.SubContent>`);
  codeLines.push(`${ind}      <DropdownMenu.Item onSelect={() => setTheme('light')}>`);
  codeLines.push(`${ind}        Light theme`);
  codeLines.push(`${ind}      </DropdownMenu.Item>`);
  codeLines.push(`${ind}      <DropdownMenu.Item onSelect={() => setTheme('dark')}>`);
  codeLines.push(`${ind}        Dark theme`);
  codeLines.push(`${ind}      </DropdownMenu.Item>`);
  codeLines.push(`${ind}    </DropdownMenu.SubContent>`);
  codeLines.push(`${ind}  </DropdownMenu.Sub>`);
  codeLines.push(`${ind}  <DropdownMenu.Separator />`);
  codeLines.push(`${ind}  <DropdownMenu.Item onSelect={signOut}>Sign out</DropdownMenu.Item>`);
  codeLines.push(`${ind}</DropdownMenu.Content>`);
  if (isControlled) {
    codeLines.push('      </DropdownMenu>');
    codeLines.push('    </>');
  } else {
    codeLines.push('    </DropdownMenu>');
  }
  codeLines.push('  );');
  codeLines.push('}');
  const code = codeLines.join('\n');

  return (
    <Playground
      previewClass="bg-fd-card p-8 min-h-[220px] flex flex-col items-center justify-center gap-4"
      preview={
        <>
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
            <kbd className="font-mono">Escape</kbd>, and{' '}
            <kbd className="font-mono">Arrow Right</kbd> on Preferences.
          </p>

          {lastAction && (
            <p className="text-xs text-fd-muted-foreground">
              Last action: <span className="font-mono">{lastAction}</span>
            </p>
          )}
        </>
      }
      code={code}
      controls={
        <>
          <PlaygroundToggle
            label="open mode"
            options={OPEN_MODES}
            value={openMode}
            onChange={setOpenMode}
          />
          <PlaygroundToggle
            label="disabled item"
            options={DISABLED_ITEM}
            value={disabledItem}
            onChange={setDisabledItem}
          />
        </>
      }
    />
  );
}
