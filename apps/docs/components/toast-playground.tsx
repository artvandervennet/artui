'use client';

import { ToastProvider, useToast } from '@artui/registry';
import { useState } from 'react';

type ToastVariant = 'info' | 'success' | 'warning' | 'error';
type DurationMode = 'auto' | 'persistent';
type ActionMode = 'none' | 'undo';

const VARIANTS: ToastVariant[] = ['info', 'success', 'warning', 'error'];
const DURATION_MODES: DurationMode[] = ['auto', 'persistent'];
const ACTION_MODES: ActionMode[] = ['none', 'undo'];

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

function ToastTrigger({
  variant,
  durationMode,
  actionMode,
}: {
  variant: ToastVariant;
  durationMode: DurationMode;
  actionMode: ActionMode;
}) {
  const toast = useToast();

  const handleShow = () => {
    const title = VARIANT_TITLES[variant];
    const duration = durationMode === 'persistent' ? null : undefined;
    const action =
      actionMode === 'undo' ? { label: 'Undo' as const, onAction: () => {} } : undefined;

    toast.show({ title, type: variant, duration, action });
  };

  const codeLines: string[] = [];
  const durationLine = durationMode === 'persistent' ? ', duration: null' : '';
  const actionLine =
    actionMode === 'undo' ? ', action: { label: "Undo", onAction: handleUndo }' : '';

  if (variant === 'info' || variant === 'success') {
    if (durationMode === 'auto' && actionMode === 'none') {
      codeLines.push(`toast.${variant}("${VARIANT_TITLES[variant]}");`);
    } else {
      codeLines.push(
        `toast.${variant}("${VARIANT_TITLES[variant]}", {${durationLine}${actionLine} });`,
      );
    }
  } else {
    codeLines.push(`toast.show({`);
    codeLines.push(`  title: "${VARIANT_TITLES[variant]}",`);
    codeLines.push(`  type: "${variant}",`);
    if (durationMode === 'persistent') codeLines.push('  duration: null,');
    if (actionMode === 'undo') codeLines.push('  action: { label: "Undo", onAction: handleUndo },');
    codeLines.push('});');
  }

  const code = codeLines.join('\n');

  return { handleShow, code };
}

function PlaygroundInner() {
  const [variant, setVariant] = useState<ToastVariant>('info');
  const [durationMode, setDurationMode] = useState<DurationMode>('auto');
  const [actionMode, setActionMode] = useState<ActionMode>('none');

  const toast = useToast();

  const handleShow = () => {
    const title = VARIANT_TITLES[variant];
    const duration = durationMode === 'persistent' ? null : undefined;
    const action =
      actionMode === 'undo' ? { label: 'Undo' as const, onAction: () => {} } : undefined;
    toast.show({ title, type: variant, duration, action });
  };

  const codeLines: string[] = [];
  const durationSegment = durationMode === 'persistent' ? ', duration: null' : '';
  const actionSegment =
    actionMode === 'undo' ? ', action: { label: "Undo", onAction: handleUndo }' : '';

  if (
    (variant === 'info' || variant === 'success') &&
    durationMode === 'auto' &&
    actionMode === 'none'
  ) {
    codeLines.push(`toast.${variant}("${VARIANT_TITLES[variant]}");`);
  } else {
    codeLines.push('toast.show({');
    codeLines.push(`  title: "${VARIANT_TITLES[variant]}",`);
    codeLines.push(`  type: "${variant}",`);
    if (durationMode === 'persistent') codeLines.push('  duration: null,');
    if (actionMode === 'undo') codeLines.push('  action: { label: "Undo", onAction: handleUndo },');
    codeLines.push('});');
  }
  const code = codeLines.join('\n');

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
        <p className="text-xs text-fd-muted-foreground">
          Press <kbd className="font-mono">Alt+T</kbd> to move focus into the newest toast. Press{' '}
          <kbd className="font-mono">Esc</kbd> while focused to dismiss it.
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
