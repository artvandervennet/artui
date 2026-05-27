'use client';

import { ToastProvider, useToast } from '@artui/registry';
import { useState } from 'react';

type ToastVariant = 'info' | 'success' | 'warning' | 'error';
type DurationMode = 'auto' | 'persistent';
type ActionMode = 'none' | 'undo';
type DescriptionMode = 'off' | 'on';

const VARIANTS: ToastVariant[] = ['info', 'success', 'warning', 'error'];
const DURATION_MODES: DurationMode[] = ['auto', 'persistent'];
const ACTION_MODES: ActionMode[] = ['none', 'undo'];
const DESCRIPTION_MODES: DescriptionMode[] = ['off', 'on'];

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
    <div className="not-prose rounded-xl border border-fd-border overflow-hidden">
      <div className="flex flex-col items-center justify-center bg-fd-card p-8 min-h-[220px] gap-4">
        <button
          type="button"
          onClick={handleShow}
          className="px-4 py-2 rounded-md bg-fd-primary text-fd-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
        >
          Show toast
        </button>
        <p className="max-w-sm text-center text-xs text-fd-muted-foreground">
          Toasts render as neutral cards with a colored left accent border per type, and
          auto-dismiss after 5s. Press <kbd className="font-mono">Alt+T</kbd> to move focus into the
          newest toast, then <kbd className="font-mono">Esc</kbd> to dismiss it.
        </p>
      </div>

      <div className="border-t bg-fd-muted/50 divide-y divide-fd-border">
        <div className="flex items-center gap-4 px-4 py-3">
          <span className="w-36 shrink-0 font-mono text-xs text-fd-muted-foreground">variant</span>
          <Toggle options={VARIANTS} value={variant} onChange={setVariant} />
        </div>

        <div className="flex items-center gap-4 px-4 py-3">
          <span className="w-36 shrink-0 font-mono text-xs text-fd-muted-foreground">duration</span>
          <Toggle options={DURATION_MODES} value={durationMode} onChange={setDurationMode} />
        </div>

        <div className="flex items-center gap-4 px-4 py-3">
          <span className="w-36 shrink-0 font-mono text-xs text-fd-muted-foreground">action</span>
          <Toggle options={ACTION_MODES} value={actionMode} onChange={setActionMode} />
        </div>

        <div className="flex items-center gap-4 px-4 py-3">
          <span className="w-36 shrink-0 font-mono text-xs text-fd-muted-foreground">
            description
          </span>
          <Toggle
            options={DESCRIPTION_MODES}
            value={descriptionMode}
            onChange={setDescriptionMode}
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

export function ToastPlayground() {
  return (
    <ToastProvider>
      <PlaygroundInner />
    </ToastProvider>
  );
}
