'use client';

import { ToastProvider, useToast } from '@artui/registry';
import { useState } from 'react';

import { Playground, PlaygroundToggle } from '@/components/playground';

type ToastVariant = 'info' | 'success' | 'warning' | 'error';
type DurationMode = 'auto' | 'persistent';
type ActionMode = 'none' | 'undo';
type DescriptionMode = 'off' | 'on';

const VARIANTS: ToastVariant[] = ['info', 'success', 'warning', 'error'];
const DURATION_MODES: DurationMode[] = ['auto', 'persistent'];
const ACTION_MODES: ActionMode[] = ['none', 'undo'];
const DESCRIPTION_MODES: DescriptionMode[] = ['off', 'on'];

const VARIANT_TITLES: Record<ToastVariant, string> = {
  info: 'Report exported successfully.',
  success: 'Changes saved.',
  warning: 'Your session expires in 5 minutes.',
  error: 'Upload failed.',
};

const VARIANT_DESCRIPTIONS: Record<ToastVariant, string> = {
  info: 'A copy was sent to your downloads folder.',
  success: 'All edits are now in sync across your devices.',
  warning: 'Save your work to avoid losing unsaved changes.',
  error: 'The file exceeded the 25 MB size limit.',
};

function buildSnippet(
  variant: ToastVariant,
  durationMode: DurationMode,
  actionMode: ActionMode,
  descriptionMode: DescriptionMode,
): string {
  const title = VARIANT_TITLES[variant];
  const hasDescription = descriptionMode === 'on';
  const hasPersistent = durationMode === 'persistent';
  const hasAction = actionMode === 'undo';

  // Shortcut form (toast.info / toast.success) reads best for the simplest case.
  const canUseShortcut = variant === 'info' || variant === 'success';
  const hasNoOptions = !hasDescription && !hasPersistent && !hasAction;

  if (canUseShortcut && hasNoOptions) {
    return `toast.${variant}("${title}");`;
  }

  const optionLines: string[] = [];
  if (hasDescription) optionLines.push(`  description: "${VARIANT_DESCRIPTIONS[variant]}",`);
  if (hasPersistent) optionLines.push('  duration: null,');
  if (hasAction) optionLines.push('  action: { label: "Undo", onAction: handleUndo },');

  if (canUseShortcut) {
    return [`toast.${variant}("${title}", {`, ...optionLines, '});'].join('\n');
  }

  return [
    'toast.show({',
    `  title: "${title}",`,
    `  type: "${variant}",`,
    ...optionLines,
    '});',
  ].join('\n');
}

function PlaygroundInner() {
  const [variant, setVariant] = useState<ToastVariant>('info');
  const [durationMode, setDurationMode] = useState<DurationMode>('auto');
  const [actionMode, setActionMode] = useState<ActionMode>('none');
  const [descriptionMode, setDescriptionMode] = useState<DescriptionMode>('off');

  const toast = useToast();

  const handleShow = () => {
    const title = VARIANT_TITLES[variant];
    const description = descriptionMode === 'on' ? VARIANT_DESCRIPTIONS[variant] : undefined;
    const duration = durationMode === 'persistent' ? null : undefined;
    const action =
      actionMode === 'undo' ? { label: 'Undo' as const, onAction: () => {} } : undefined;
    toast.show({ title, description, type: variant, duration, action });
  };

  const code = buildSnippet(variant, durationMode, actionMode, descriptionMode);

  return (
    <Playground
      previewClass="bg-fd-card p-8 min-h-[220px] flex flex-col items-center justify-center gap-4"
      preview={
        <>
          <button
            type="button"
            onClick={handleShow}
            className="px-4 py-2 rounded-md bg-fd-primary text-fd-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
          >
            Show toast
          </button>
          <p className="max-w-sm text-center text-xs text-fd-muted-foreground">
            Toasts render as neutral cards with a colored left accent border per type, and
            auto-dismiss after 5s. Press <kbd className="font-mono">Alt+T</kbd> to move focus into
            the newest toast, then <kbd className="font-mono">Esc</kbd> to dismiss it.
          </p>
        </>
      }
      code={code}
      controls={
        <>
          <PlaygroundToggle
            label="variant"
            options={VARIANTS}
            value={variant}
            onChange={setVariant}
          />
          <PlaygroundToggle
            label="duration"
            options={DURATION_MODES}
            value={durationMode}
            onChange={setDurationMode}
          />
          <PlaygroundToggle
            label="action"
            options={ACTION_MODES}
            value={actionMode}
            onChange={setActionMode}
          />
          <PlaygroundToggle
            label="description"
            options={DESCRIPTION_MODES}
            value={descriptionMode}
            onChange={setDescriptionMode}
          />
        </>
      }
    />
  );
}

export function ToastPlayground() {
  return (
    <ToastProvider>
      <PlaygroundInner />
    </ToastProvider>
  );
}
