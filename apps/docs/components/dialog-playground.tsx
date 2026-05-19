'use client';

import { Dialog } from '@artui/registry';
import { useRef, useState } from 'react';

type LabelMode = 'title' | 'aria-labelledby';
type DescriptionOption = 'none' | 'short' | 'long';
type InitialFocusOption = 'default' | 'cancel-button';

const LABEL_MODES: LabelMode[] = ['title', 'aria-labelledby'];
const DESCRIPTIONS: DescriptionOption[] = ['none', 'short', 'long'];
const INITIAL_FOCUS: InitialFocusOption[] = ['default', 'cancel-button'];

const DESCRIPTION_TEXT: Record<DescriptionOption, string | undefined> = {
  none: undefined,
  short: 'This action cannot be undone.',
  long: 'Your account and all associated data will be permanently removed after a 30-day grace period.',
};

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

export function DialogPlayground() {
  const [open, setOpen] = useState(false);
  const [labelMode, setLabelMode] = useState<LabelMode>('title');
  const [description, setDescription] = useState<DescriptionOption>('short');
  const [initialFocus, setInitialFocus] = useState<InitialFocusOption>('default');
  const [closeOnBackdrop, setCloseOnBackdrop] = useState(true);

  const cancelRef = useRef<HTMLButtonElement>(null);
  const initialFocusRef = initialFocus === 'cancel-button' ? cancelRef : undefined;
  const descriptionValue = DESCRIPTION_TEXT[description];

  const codeLines: string[] = [];
  if (labelMode === 'aria-labelledby') {
    codeLines.push('<h2 id="dialog-heading">Delete account</h2>');
    codeLines.push('');
  }
  codeLines.push('<Dialog');
  codeLines.push('  open={open}');
  codeLines.push('  onClose={() => setOpen(false)}');
  if (labelMode === 'title') {
    codeLines.push('  title="Delete account"');
  } else {
    codeLines.push('  aria-labelledby="dialog-heading"');
  }
  if (descriptionValue) {
    codeLines.push(`  description="${descriptionValue}"`);
  }
  if (initialFocus === 'cancel-button') {
    codeLines.push('  initialFocusRef={cancelRef}');
  }
  if (!closeOnBackdrop) {
    codeLines.push('  closeOnBackdropClick={false}');
  }
  codeLines.push('>');
  codeLines.push('  <button ref={cancelRef} onClick={() => setOpen(false)}>Cancel</button>');
  codeLines.push('  <button onClick={handleDelete}>Delete</button>');
  codeLines.push('</Dialog>');
  const code = codeLines.join('\n');

  const dialogProps =
    labelMode === 'title'
      ? { title: 'Delete account' as const }
      : { 'aria-labelledby': 'dialog-playground-heading' as const };

  return (
    <div className="not-prose rounded-xl border border-fd-border overflow-hidden">
      {labelMode === 'aria-labelledby' && (
        <h2 id="dialog-playground-heading" className="sr-only">
          Delete account
        </h2>
      )}

      <div className="flex flex-col items-center justify-center bg-fd-card p-8 min-h-[220px] gap-4">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="px-4 py-2 rounded-md bg-fd-primary text-fd-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
        >
          Open dialog
        </button>
        <p className="text-xs text-fd-muted-foreground">
          Try <kbd className="font-mono">Esc</kbd>, <kbd className="font-mono">Tab</kbd>, and
          clicking the backdrop.
        </p>

        <Dialog
          {...dialogProps}
          open={open}
          onClose={() => setOpen(false)}
          description={descriptionValue}
          initialFocusRef={initialFocusRef}
          closeOnBackdropClick={closeOnBackdrop}
        >
          <p className="m-0">
            You are about to delete your account. This is a playground — no real action is
            performed.
          </p>
          <div className="flex justify-end gap-2 mt-4">
            <button
              ref={cancelRef}
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-2 rounded-md border border-current bg-transparent cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-2 rounded-md border-none bg-[crimson] text-white cursor-pointer"
            >
              Delete
            </button>
          </div>
        </Dialog>
      </div>

      <div className="border-t bg-fd-background divide-y divide-fd-border">
        <div className="flex items-center gap-4 px-4 py-3">
          <span className="w-36 shrink-0 font-mono text-xs text-fd-muted-foreground">
            label source
          </span>
          <Toggle options={LABEL_MODES} value={labelMode} onChange={setLabelMode} />
        </div>

        <div className="flex items-center gap-4 px-4 py-3">
          <span className="w-36 shrink-0 font-mono text-xs text-fd-muted-foreground">
            description
          </span>
          <Toggle options={DESCRIPTIONS} value={description} onChange={setDescription} />
        </div>

        <div className="flex items-center gap-4 px-4 py-3">
          <span className="w-36 shrink-0 font-mono text-xs text-fd-muted-foreground">
            initialFocusRef
          </span>
          <Toggle options={INITIAL_FOCUS} value={initialFocus} onChange={setInitialFocus} />
        </div>

        <div className="flex items-center gap-4 px-4 py-3">
          <span className="w-36 shrink-0 font-mono text-xs text-fd-muted-foreground">
            closeOnBackdropClick
          </span>
          <Toggle
            options={['true', 'false'] as const}
            value={closeOnBackdrop ? 'true' : 'false'}
            onChange={(v) => setCloseOnBackdrop(v === 'true')}
          />
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
