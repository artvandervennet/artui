'use client';

import { Dialog } from '@artui/registry';
import { useRef, useState } from 'react';

import { Playground, PlaygroundToggle } from '@/components/playground';

type LabelMode = 'title' | 'aria-labelledby';
type DescriptionOption = 'none' | 'short' | 'long';
type InitialFocusOption = 'default' | 'cancel-button';
type ReturnFocusOption = 'default' | 'trigger';

const LABEL_MODES: LabelMode[] = ['title', 'aria-labelledby'];
const DESCRIPTIONS: DescriptionOption[] = ['none', 'short', 'long'];
const INITIAL_FOCUS: InitialFocusOption[] = ['default', 'cancel-button'];
const RETURN_FOCUS: ReturnFocusOption[] = ['default', 'trigger'];

const DESCRIPTION_TEXT: Record<DescriptionOption, string | undefined> = {
  none: undefined,
  short: 'This action cannot be undone.',
  long: 'Your account and all associated data will be permanently removed after a 30-day grace period.',
};

const LABEL_HEADING_ID = 'dialog-playground-heading';

export function DialogPlayground() {
  const [open, setOpen] = useState(false);
  const [labelMode, setLabelMode] = useState<LabelMode>('title');
  const [description, setDescription] = useState<DescriptionOption>('short');
  const [initialFocus, setInitialFocus] = useState<InitialFocusOption>('default');
  const [returnFocus, setReturnFocus] = useState<ReturnFocusOption>('default');
  const [closeOnBackdrop, setCloseOnBackdrop] = useState(true);

  const cancelRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const initialFocusRef = initialFocus === 'cancel-button' ? cancelRef : undefined;
  const returnFocusRef = returnFocus === 'trigger' ? triggerRef : undefined;
  const descriptionValue = DESCRIPTION_TEXT[description];

  const usesCancelRef = initialFocus === 'cancel-button';
  const usesTriggerRef = returnFocus === 'trigger';

  const codeLines: string[] = [];
  if (usesCancelRef) {
    codeLines.push('const cancelRef = useRef<HTMLButtonElement>(null);');
  }
  if (usesTriggerRef) {
    codeLines.push('const triggerRef = useRef<HTMLButtonElement>(null);');
  }
  if (codeLines.length > 0) {
    codeLines.push('');
  }
  if (usesTriggerRef) {
    codeLines.push('<button ref={triggerRef} onClick={() => setOpen(true)}>Open dialog</button>');
    codeLines.push('');
  }
  if (labelMode === 'aria-labelledby') {
    codeLines.push(`<h2 id="${LABEL_HEADING_ID}">Delete account</h2>`);
    codeLines.push('');
  }
  codeLines.push('<Dialog');
  codeLines.push('  open={open}');
  codeLines.push('  onClose={() => setOpen(false)}');
  if (labelMode === 'title') {
    codeLines.push('  title="Delete account"');
  } else {
    codeLines.push(`  aria-labelledby="${LABEL_HEADING_ID}"`);
  }
  if (descriptionValue) {
    codeLines.push(`  description="${descriptionValue}"`);
  }
  if (usesCancelRef) {
    codeLines.push('  initialFocusRef={cancelRef}');
  }
  if (usesTriggerRef) {
    codeLines.push('  returnFocusRef={triggerRef}');
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
    <Playground
      previewClass="bg-fd-card p-8 min-h-[220px] flex flex-col items-center justify-center gap-4"
      preview={
        <>
          {labelMode === 'aria-labelledby' && (
            <h2 id={LABEL_HEADING_ID} className="sr-only">
              Delete account
            </h2>
          )}
          <button
            ref={triggerRef}
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
          <p className="text-xs text-fd-muted-foreground">
            The dialog now uses the shared artui tokens: a neutral surface, solid border, and the
            lighter <code className="font-mono">--artui-shadow-lg</code> elevation.
          </p>
          <Dialog
            {...dialogProps}
            open={open}
            onClose={() => setOpen(false)}
            description={descriptionValue}
            initialFocusRef={initialFocusRef}
            returnFocusRef={returnFocusRef}
            closeOnBackdropClick={closeOnBackdrop}
          >
            <p className="m-0">
              You are about to delete your account. This is a playground; no real action is
              performed.
            </p>
            <div className="flex justify-end gap-2 mt-4">
              <button
                ref={cancelRef}
                type="button"
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-md border border-[var(--artui-border)] bg-[var(--artui-bg)] text-[var(--artui-fg)] cursor-pointer hover:bg-[var(--artui-hover-bg)] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-md border-none bg-[var(--artui-color-error)] text-white cursor-pointer"
              >
                Delete
              </button>
            </div>
          </Dialog>
        </>
      }
      code={code}
      controls={
        <>
          <PlaygroundToggle
            label="label source"
            options={LABEL_MODES}
            value={labelMode}
            onChange={setLabelMode}
          />
          <PlaygroundToggle
            label="description"
            options={DESCRIPTIONS}
            value={description}
            onChange={setDescription}
          />
          <PlaygroundToggle
            label="initialFocusRef"
            options={INITIAL_FOCUS}
            value={initialFocus}
            onChange={setInitialFocus}
          />
          <PlaygroundToggle
            label="returnFocusRef"
            options={RETURN_FOCUS}
            value={returnFocus}
            onChange={setReturnFocus}
          />
          <PlaygroundToggle
            label="closeOnBackdropClick"
            options={['true', 'false'] as const}
            value={closeOnBackdrop ? 'true' : 'false'}
            onChange={(v) => setCloseOnBackdrop(v === 'true')}
          />
        </>
      }
    />
  );
}
