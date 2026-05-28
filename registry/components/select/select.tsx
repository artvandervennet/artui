import {
  type ChangeEvent,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { type AccessibleNameProps, type AccessibleText } from "../../lib/a11y-types";
import { withErrorOverlay } from "../../lib/dev-overlay";

import "./select.css";

// ---------------------------------------------------------------------------
// Slot context: tells Option/Group which render pass they're in
// ---------------------------------------------------------------------------

type RenderSlot = "native" | "custom";
const SlotContext = createContext<RenderSlot>("custom");

// ---------------------------------------------------------------------------
// Root context (multi mode only)
// ---------------------------------------------------------------------------

interface RootCtx {
  mode: "multi";
  selected: readonly string[];
  commit: (next: readonly string[]) => void;
  open: boolean;
  setOpen: (next: boolean) => void;
  disabled: boolean;
  triggerId: string;
  listboxId: string;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  /**
   * Human-readable labels keyed by option value. State-based so Control
   * re-renders when Options mount and register their labels.
   */
  optionLabels: Record<string, string>;
  registerOption: (value: string, label: string) => void;
  unregisterOption: (value: string) => void;
  /** Live-region text updated on every selection change (WCAG 4.1.3). */
  announcement: string;
  setAnnouncement: (msg: string) => void;
}

const RootContext = createContext<RootCtx | null>(null);

function useRoot(name: string): RootCtx {
  const ctx = useContext(RootContext);
  if (!ctx) {
    throw new Error(
      `[artui] <Select.${name}> must be rendered inside <Select multiple>.`,
    );
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// Module helpers
// ---------------------------------------------------------------------------

const isDev =
  typeof process !== "undefined" && process.env.NODE_ENV !== "production";

// Matches custom role=option divs that are focusable (not disabled, not hidden).
const FOCUSABLE_OPTION =
  '[role="option"]:not([aria-disabled="true"]):not([hidden])';

function getOptions(listbox: HTMLElement): HTMLElement[] {
  // :scope > prevents nested groups from polluting the navigation list.
  return Array.from(
    listbox.querySelectorAll<HTMLElement>(`:scope [role="group"] > ${FOCUSABLE_OPTION}, :scope > ${FOCUSABLE_OPTION}`),
  );
}

// Focus an option and bring it into view within the scrollable listbox.
function focusOption(el: HTMLElement | undefined): void {
  if (!el) return;
  el.focus();
  // Guarded: scrollIntoView is unimplemented in some test environments (jsdom).
  el.scrollIntoView?.({ block: "nearest" });
}

// ---------------------------------------------------------------------------
// Root: single mode
// ---------------------------------------------------------------------------

type SingleAccessibleName =
  | { "aria-label": AccessibleText; "aria-labelledby"?: never }
  | { "aria-label"?: never; "aria-labelledby": string };

type SelectSingleProps = SingleAccessibleName & {
  multiple?: false;
  children: ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  disabled?: boolean;
  className?: string;
};

// ---------------------------------------------------------------------------
// Root: multi mode
// ---------------------------------------------------------------------------

interface SelectMultiProps {
  multiple: true;
  children: ReactNode;
  value?: readonly string[];
  defaultValue?: readonly string[];
  onValueChange?: (value: readonly string[]) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  name?: string;
  disabled?: boolean;
}

// ---------------------------------------------------------------------------
// Root: combined props type
// ---------------------------------------------------------------------------

type SelectRootProps = SelectSingleProps | SelectMultiProps;

// ---------------------------------------------------------------------------
// Single-mode root
// ---------------------------------------------------------------------------

function SingleRoot({
  children,
  value: controlledValue,
  defaultValue,
  onValueChange,
  name,
  disabled = false,
  className,
  ...accessibleNameProps
}: SelectSingleProps): ReactElement {
  const nameProps = accessibleNameProps as {
    "aria-label"?: string;
    "aria-labelledby"?: string;
  };

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onValueChange?.(e.target.value);
  };

  return (
    <select
      className={["artui-select-select", className].filter(Boolean).join(" ")}
      value={controlledValue}
      defaultValue={defaultValue}
      onChange={handleChange}
      name={name}
      disabled={disabled}
      {...(nameProps["aria-label"] !== undefined
        ? { "aria-label": nameProps["aria-label"] }
        : {})}
      {...(nameProps["aria-labelledby"] !== undefined
        ? { "aria-labelledby": nameProps["aria-labelledby"] }
        : {})}
    >
      {children}
    </select>
  );
}

// ---------------------------------------------------------------------------
// Multi-mode root
// ---------------------------------------------------------------------------

function MultiRoot({
  children,
  value: controlledValue,
  defaultValue = [],
  onValueChange,
  open: controlledOpen,
  onOpenChange,
  name,
  disabled = false,
}: SelectMultiProps): ReactElement {
  const isControlledValue = controlledValue !== undefined;
  const isControlledOpen = controlledOpen !== undefined;

  const [internalSelected, setInternalSelected] = useState<readonly string[]>(defaultValue);
  const [internalOpen, setInternalOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [optionLabels, setOptionLabels] = useState<Record<string, string>>({});

  const selected = isControlledValue ? (controlledValue ?? []) : internalSelected;
  const open = isControlledOpen ? (controlledOpen ?? false) : internalOpen;

  const uid = useId();
  const triggerId = `${uid}-trigger`;
  const listboxId = `${uid}-listbox`;
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  // Ref mirror so event handlers never capture stale closure state.
  const optionLabelsRef = useRef<Record<string, string>>({});

  const registerOption = useCallback((value: string, label: string) => {
    if (optionLabelsRef.current[value] === label) return;
    optionLabelsRef.current = { ...optionLabelsRef.current, [value]: label };
    setOptionLabels(optionLabelsRef.current);
  }, []);

  const unregisterOption = useCallback((value: string) => {
    if (!(value in optionLabelsRef.current)) return;
    const next = { ...optionLabelsRef.current };
    delete next[value];
    optionLabelsRef.current = next;
    setOptionLabels(next);
  }, []);

  const commit = useCallback(
    (next: readonly string[]) => {
      if (!isControlledValue) setInternalSelected(next);
      onValueChange?.(next);
    },
    [isControlledValue, onValueChange],
  );

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlledOpen) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [isControlledOpen, onOpenChange],
  );

  const ctx: RootCtx = {
    mode: "multi",
    selected,
    commit,
    open,
    setOpen,
    disabled,
    triggerId,
    listboxId,
    triggerRef,
    optionLabels,
    registerOption,
    unregisterOption,
    announcement,
    setAnnouncement,
  };

  return (
    <RootContext.Provider value={ctx}>
      {children}
      {/* Visually-hidden live region: always in DOM, updated on selection change (WCAG 4.1.3). */}
      <span
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="artui-select-sr-only"
      >
        {announcement}
      </span>
      {/* Hidden native select: form participation source of truth (WCAG 4.1.2).
          Options are rendered into Content's native slot, not here, because
          Content holds the user's Option/Group children. */}
      <select
        multiple
        aria-hidden="true"
        tabIndex={-1}
        name={name}
        value={selected as string[]}
        onChange={() => {
          // Intentional no-op: selection is managed by the custom UI.
        }}
        className="artui-select-sr-only"
      />
    </RootContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Root: dispatcher
// ---------------------------------------------------------------------------

function SelectRoot(props: SelectRootProps): ReactElement {
  if (props.multiple === true) {
    return <MultiRoot {...props} />;
  }
  return <SingleRoot {...(props as SelectSingleProps)} />;
}

// ---------------------------------------------------------------------------
// Control (multi mode only): unified field: chips + trigger + clear + caret
// ---------------------------------------------------------------------------

type ControlProps = AccessibleNameProps & {
  className?: string;
  /** Placeholder shown inside the trigger when nothing is selected. */
  placeholder?: string;
  /** Customise each chip's remove-button accessible name. Defaults to `Remove ${label}`. */
  removeLabel?: (label: string) => string;
  /** Render a "Clear all" button when true and at least one option is selected. */
  showClearAll?: boolean;
  /** Accessible name for the clear-all button. Defaults to "Clear all selections". */
  clearAllLabel?: string;
};

function Control({
  className,
  placeholder = "Select options",
  removeLabel,
  showClearAll = false,
  clearAllLabel = "Clear all selections",
  ...accessibleNameProps
}: ControlProps): ReactElement {
  const {
    selected,
    commit,
    open,
    setOpen,
    disabled,
    triggerId,
    listboxId,
    triggerRef,
    optionLabels,
    setAnnouncement,
  } = useRoot("Control");

  const nameProps = accessibleNameProps as {
    children?: string;
    "aria-label"?: string;
    "aria-labelledby"?: string;
  };

  const getRemoveLabel = removeLabel ?? ((label: string) => `Remove ${label}`);

  const handleRemove = useCallback(
    (value: string) => {
      if (disabled) return;
      const next = selected.filter((v) => v !== value);
      commit(next);
      const label = optionLabels[value] ?? value;
      setAnnouncement(`${label} removed, ${next.length} selected`);
      // When the last chip is removed focus is rescued to the trigger (WCAG 2.4.3).
      if (next.length === 0) {
        triggerRef.current?.focus();
      }
    },
    [disabled, selected, commit, optionLabels, setAnnouncement, triggerRef],
  );

  const handleClearAll = useCallback(() => {
    if (disabled) return;
    commit([]);
    setAnnouncement("All selections cleared");
    // Focus returns to trigger after chips disappear (WCAG 2.4.3).
    triggerRef.current?.focus();
  }, [disabled, commit, setAnnouncement, triggerRef]);

  const handleTriggerClick = () => {
    if (disabled) return;
    setOpen(!open);
  };

  const handleTriggerKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setOpen(true);
      return;
    }
    // Enter/Space act as a disclosure toggle that never closes the panel:
    // preventDefault stops native button activation (which would toggle it
    // shut), then open the listbox or move focus into it.
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
      } else {
        const listbox = document.getElementById(listboxId);
        if (listbox) focusOption(getOptions(listbox)[0]);
      }
      return;
    }
    // Backspace removes the last selected chip. Routes through commit
    // (onChange-driven per the registry masked-input rule).
    if (e.key === "Backspace" && selected.length > 0) {
      e.preventDefault();
      const removedValue = selected[selected.length - 1];
      const next = selected.slice(0, -1);
      commit(next);
      if (removedValue !== undefined) {
        const label = optionLabels[removedValue] ?? removedValue;
        setAnnouncement(`${label} removed, ${next.length} selected`);
      }
      // Focus rescue: when the last chip is removed via keyboard the trigger
      // already has focus, but we still call focus() to ensure consistent
      // behaviour if focus was stolen elsewhere (WCAG 2.4.3).
      if (next.length === 0) {
        triggerRef.current?.focus();
      }
    }
  };

  // Clicking the empty area of the field (not a chip, clear, or trigger button)
  // opens the listbox and focuses the trigger. Those interactive children handle
  // their own events, so we guard against double-toggling.
  const handleFieldPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    const target = e.target as HTMLElement;
    if (
      target.closest(".artui-select-tag-remove") ||
      target.closest(".artui-select-clear-all") ||
      target.closest(".artui-select-trigger")
    ) {
      return;
    }
    // Prevent default to stop focus from moving away from the trigger, then
    // toggle: clicking the field again closes an open listbox.
    e.preventDefault();
    triggerRef.current?.focus();
    setOpen(!open);
  };

  // Resolve the trigger's accessible name. A visible `children` label is rendered
  // in the field and linked via aria-labelledby so the name stays on the trigger
  // button even though the text lives outside it.
  const labelId = `${triggerId}-label`;
  const hasVisibleLabel = nameProps.children !== undefined;
  const triggerNameProps =
    nameProps["aria-label"] !== undefined
      ? { "aria-label": nameProps["aria-label"] }
      : nameProps["aria-labelledby"] !== undefined
        ? { "aria-labelledby": nameProps["aria-labelledby"] }
        : hasVisibleLabel
          ? { "aria-labelledby": labelId }
          : {};

  return (
    <div
      className={["artui-select-control", className].filter(Boolean).join(" ")}
      data-disabled={disabled ? "true" : undefined}
      data-open={open ? "true" : undefined}
      onPointerDown={handleFieldPointerDown}
    >
      {/* Field: chips + label/placeholder. Grows and wraps; the actions region
          stays pinned so the clear button and caret never move as chips wrap. */}
      <div className="artui-select-field">
        {/* Chips: DOM order is source order, so Tab visits remove buttons first. */}
        {selected.map((value) => {
          const label = optionLabels[value] ?? value;
          const removeBtnLabel = getRemoveLabel(label);
          return (
            <span key={value} className="artui-select-tag">
              <span className="artui-select-tag-label">{label}</span>
              {/* Remove button with accessible name (WCAG 4.1.2). */}
              <button
                type="button"
                aria-label={removeBtnLabel}
                className="artui-select-tag-remove"
                disabled={disabled}
                onClick={() => handleRemove(value)}
              >
                {/* Decorative X icon: screen readers use aria-label on the button. */}
                <svg
                  aria-hidden="true"
                  focusable="false"
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2 2l8 8M10 2l-8 8" />
                </svg>
              </button>
            </span>
          );
        })}

        {/* Visible children label (linked to the trigger via aria-labelledby). */}
        {hasVisibleLabel && (
          <span id={labelId} className="artui-select-value">
            {nameProps.children}
          </span>
        )}
        {/* Placeholder: only when nothing is selected and there's no visible label. */}
        {!hasVisibleLabel && selected.length === 0 && (
          <span className="artui-select-placeholder">{placeholder}</span>
        )}
      </div>

      {/* Actions: pinned to the right, never wrap. Clear-all precedes the trigger
          in the DOM so Tab reaches it before the open/close control. */}
      <div className="artui-select-actions">
        {/* Clear all: opt-in, only rendered when selection is non-empty. */}
        {showClearAll && selected.length > 0 && (
          <button
            type="button"
            aria-label={clearAllLabel}
            className="artui-select-clear-all"
            disabled={disabled}
            onClick={handleClearAll}
          >
            {/* Decorative clear-all icon (circled X): distinct from the per-chip
                remove icon; screen readers use aria-label on the button. */}
            <svg
              aria-hidden="true"
              focusable="false"
              width="15"
              height="15"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="8" cy="8" r="6.25" />
              <path d="M10 6l-4 4M6 6l4 4" />
            </svg>
          </button>
        )}

        {/* Trigger: the open/close control. Holds the decorative caret. */}
        <button
          ref={triggerRef}
          id={triggerId}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listboxId}
          disabled={disabled}
          className="artui-select-trigger"
          onClick={handleTriggerClick}
          onKeyDown={handleTriggerKeyDown}
          {...triggerNameProps}
        >
          {/* Caret: same chevron path as the single-mode native <select>. */}
          <span aria-hidden="true" className="artui-select-caret">
            <svg
              aria-hidden="true"
              focusable="false"
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 4l4 4 4-4" />
            </svg>
          </span>
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Content (multi mode only): dual-slot render
// ---------------------------------------------------------------------------

interface ContentProps {
  children: ReactNode;
  className?: string;
}

function Content({ children, className }: ContentProps): ReactElement {
  const { open, setOpen, listboxId, triggerId, triggerRef, selected } = useRoot("Content");

  const listboxRef = useRef<HTMLDivElement>(null);

  // Floating-overlay position. The panel renders as position:fixed anchored to
  // the Control field so it sits above the page without reflowing it.
  const [position, setPosition] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  const updatePosition = useCallback(() => {
    const anchor = triggerRef.current?.closest<HTMLElement>(
      ".artui-select-control",
    );
    const panel = listboxRef.current;
    if (!anchor || !panel) return;
    const r = anchor.getBoundingClientRect();
    // Flip above the field when there isn't room below and there's more above.
    const panelHeight = panel.offsetHeight;

    // If height is 0 the panel hasn't been laid out yet (panel just became
    // visible in the same layout cycle). Place below as a safe default so
    // visibility:hidden is lifted, then re-measure next frame for the flip
    // calculation once the browser has real dimensions.
    if (panelHeight === 0) {
      setPosition((prev) => {
        const top = r.bottom;
        const left = r.left;
        const width = r.width;
        return prev && prev.top === top && prev.left === left && prev.width === width
          ? prev
          : { top, left, width };
      });
      requestAnimationFrame(updatePosition);
      return;
    }

    const spaceBelow = window.innerHeight - r.bottom;
    const placeAbove = spaceBelow < panelHeight && r.top > spaceBelow;
    const top = placeAbove ? Math.max(0, r.top - panelHeight) : r.bottom;
    const left = r.left;
    const width = r.width;
    setPosition((prev) =>
      prev && prev.top === top && prev.left === left && prev.width === width
        ? prev
        : { top, left, width },
    );
  }, [triggerRef]);

  // Position on open, then keep the panel glued to the field on scroll/resize.
  // Repositioning (not closing) means scrolling the option list itself is a
  // no-op (the anchor doesn't move) while page scroll keeps the panel anchored.
  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
    window.addEventListener("scroll", updatePosition, {
      passive: true,
      capture: true,
    });
    window.addEventListener("resize", updatePosition, { passive: true });
    return () => {
      window.removeEventListener("scroll", updatePosition, { capture: true });
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, updatePosition]);

  // Move focus to the first option when the listbox opens (WCAG 2.4.3 / APG Listbox).
  useEffect(() => {
    if (!open || !listboxRef.current) return;
    const items = getOptions(listboxRef.current);
    focusOption(items[0]);
  }, [open]);

  // Return focus to the trigger whenever a close would orphan focus (WCAG 2.4.3).
  // Tab and outside-click move focus elsewhere first, so they are not hijacked.
  const wasOpen = useRef(open);
  useEffect(() => {
    if (wasOpen.current && !open) {
      const active = document.activeElement;
      if (!active || active === document.body || listboxRef.current?.contains(active)) {
        triggerRef.current?.focus();
      }
    }
    wasOpen.current = open;
  }, [open, triggerRef]);

  // Pointerdown outside listbox and control closes it.
  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (listboxRef.current?.contains(target)) return;
      if (triggerRef.current?.closest(".artui-select-control")?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown, true);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
    };
  }, [open, setOpen, triggerRef]);

  // Duplicate-value dev guard: scans the custom panel DOM after all Options mount.
  // setTimeout(0) ensures all sibling Option registration effects have run first.
  useEffect(() => {
    if (!isDev || !listboxRef.current) return;
    const id = setTimeout(() => {
      if (!listboxRef.current) return;
      const values = Array.from(
        listboxRef.current.querySelectorAll<HTMLElement>('[role="option"][data-value]'),
      ).map((el) => el.getAttribute("data-value")!);
      const seen = new Set<string>();
      for (const v of values) {
        if (seen.has(v)) {
          console.error(
            `[artui] <Select.Content> [WCAG 4.1.2] [Select:duplicate-value]: ` +
              `Duplicate option value="${v}" detected. Each option must have a unique value; ` +
              `duplicates cause ambiguous selection state.`,
          );
          break;
        }
        seen.add(v);
      }
    }, 0);
    return () => clearTimeout(id);
    // Run once on mount so the guard fires even before first open.
  }, []);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!listboxRef.current) return;
    if (!open) return;
    const items = getOptions(listboxRef.current);
    const current = document.activeElement as HTMLElement;
    const idx = items.indexOf(current);

    switch (e.key) {
      case "ArrowDown": {
        e.preventDefault();
        // No wrap: APG Listbox pattern.
        focusOption(items[Math.min(idx + 1, items.length - 1)]);
        break;
      }
      case "ArrowUp": {
        e.preventDefault();
        focusOption(items[Math.max(idx - 1, 0)]);
        break;
      }
      case "Home": {
        e.preventDefault();
        focusOption(items[0]);
        break;
      }
      case "End": {
        e.preventDefault();
        focusOption(items[items.length - 1]);
        break;
      }
      case "Escape": {
        e.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
        break;
      }
      case "Tab": {
        setOpen(false);
        break;
      }
      default: {
        // Typeahead: jump to first option starting with the typed character.
        // Space is excluded: it toggles the focused option, not typeahead.
        if (e.key.length === 1 && e.key !== " ") {
          const ch = e.key.toLowerCase();
          const match = items.find((item) =>
            item.textContent?.trim().toLowerCase().startsWith(ch),
          );
          if (match) {
            e.preventDefault();
            focusOption(match);
          }
        }
      }
    }
  };

  const hasItems = children !== null && children !== undefined && children !== false;

  // Floating overlay: position:fixed anchored to the field so opening the panel
  // never reflows the page. When open but not yet measured (position===null) we
  // place the panel off-screen and hide it so the layout engine can measure its
  // height without a visible flash in the wrong position.
  const overlayStyle: React.CSSProperties | undefined = open
    ? {
        position: "fixed",
        top: position?.top ?? -9999,
        left: position?.left ?? -9999,
        minWidth: position?.width,
        ...(position === null ? { visibility: "hidden" } : {}),
      }
    : undefined;

  // The listbox is always in the DOM so Options always mount and can register labels.
  // When closed it is visually hidden (aria-hidden + hidden) and excluded from the AT tree.
  const listboxElement = (
    <div
      ref={listboxRef}
      id={listboxId}
      role="listbox"
      aria-multiselectable="true"
      aria-labelledby={triggerId}
      aria-hidden={!open}
      tabIndex={-1}
      hidden={!open}
      className={["artui-select-content", className].filter(Boolean).join(" ")}
      style={overlayStyle}
      onKeyDown={handleKeyDown}
    >
      {/* Custom slot: Options/Groups render their accessible div/group markup here. */}
      <SlotContext.Provider value="custom">{children}</SlotContext.Provider>
    </div>
  );

  return (
    <>
      {/* Native slot: hidden <select multiple> for form submission (WCAG 4.1.2). */}
      <SlotContext.Provider value="native">
        <select
          multiple
          aria-hidden="true"
          tabIndex={-1}
          value={selected as string[]}
          onChange={() => {
            // Intentional no-op: selection managed by custom UI only.
          }}
          className="artui-select-sr-only"
        >
          {children}
        </select>
      </SlotContext.Provider>
      {hasItems
        ? listboxElement
        : withErrorOverlay(listboxElement, {
            key: "Select:empty-content",
            component: "Select.Content",
            wcag: "1.3.1",
            message:
              "Content rendered with no children. A listbox must contain at least one option so keyboard and screen reader users can interact with it.",
          })}
    </>
  );
}

// ---------------------------------------------------------------------------
// Option (both modes)
// ---------------------------------------------------------------------------

interface OptionProps {
  value: string;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
}

function Option({ value, children, disabled, className }: OptionProps): ReactElement | null {
  const slot = useContext(SlotContext);
  const ctx = useContext(RootContext);

  // Derive accessible label from children for registration.
  const labelText = typeof children === "string" ? children : value;
  const trimmedLabel = labelText.trim();

  // In native slot: register label + render native <option>.
  // In custom slot: render the interactive div.
  // In single mode (no RootContext): render native <option> directly.

  // Label registration: only in the native slot (or single mode) to avoid double-registration.
  const registerOption = ctx?.registerOption;
  const unregisterOption = ctx?.unregisterOption;

  useEffect(() => {
    if (!registerOption || !unregisterOption) return;
    // Only register from the native slot so we don't register twice.
    if (slot !== "native") return;
    registerOption(value, labelText);
    return () => unregisterOption(value);
  }, [value, labelText, registerOption, unregisterOption, slot]);

  if (slot === "native" || ctx === null) {
    // Single mode or native hidden-select slot: render a real <option>.
    return (
      <option value={value} disabled={disabled}>
        {children}
      </option>
    );
  }

  // Custom slot: render the accessible interactive div.
  const { selected, commit, setAnnouncement, optionLabels } = ctx;
  const isSelected = selected.includes(value);

  const handleToggle = () => {
    if (disabled) return;
    const label = optionLabels[value] ?? value;
    let next: readonly string[];
    let msg: string;
    if (isSelected) {
      next = selected.filter((v) => v !== value);
      msg = `${label} removed, ${next.length} selected`;
    } else {
      next = [...selected, value];
      msg = `${label} added, ${next.length} selected`;
    }
    // onChange-driven selection (registry masked-input rule).
    commit(next);
    setAnnouncement(msg);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    // Space or Enter toggles without closing the listbox (APG Listbox pattern).
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleToggle();
    }
  };

  let element = (
    <div
      role="option"
      aria-selected={isSelected}
      aria-disabled={disabled ? "true" : undefined}
      tabIndex={disabled ? -1 : 0}
      data-value={value}
      className={[
        "artui-select-option",
        isSelected && "artui-select-option--selected",
        disabled && "artui-select-option--disabled",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
    >
      <span className="artui-select-option-label">{children}</span>
      {/* Checkmark on the right: selection conveyed by icon, not colour alone (WCAG 1.4.1). */}
      <span className="artui-select-option-check" aria-hidden="true">
        {isSelected && (
          <svg
            focusable="false"
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 7.5l3 3 5-6" />
          </svg>
        )}
      </span>
    </div>
  );

  // Dev guard: empty option label (WCAG 1.3.1).
  if (isDev && trimmedLabel === "") {
    element = withErrorOverlay(element, {
      key: `Select:empty-option-label:${value}`,
      component: "Select.Option",
      wcag: "1.3.1",
      message: `Option with value="${value}" has an empty or whitespace-only label. Screen readers will announce nothing meaningful for this option.`,
    });
  }

  return element;
}

// ---------------------------------------------------------------------------
// Group (both modes)
// ---------------------------------------------------------------------------

interface GroupProps {
  /** Group label: required. Used as aria-label on role=group and as optgroup label. */
  label: string;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
}

function Group({ label, disabled, children, className }: GroupProps): ReactElement {
  const slot = useContext(SlotContext);
  const ctx = useContext(RootContext);

  if (slot === "native" || ctx === null) {
    // Single mode or native hidden-select slot: render a real <optgroup>.
    return (
      <optgroup label={label} disabled={disabled}>
        {children}
      </optgroup>
    );
  }

  // Custom slot: render accessible group container.
  let element = (
    <div
      role="group"
      aria-label={label}
      className={["artui-select-group", className].filter(Boolean).join(" ")}
    >
      {/* Visual group header: aria-hidden so the group's accessible name
          comes from aria-label on the role=group element (WCAG 1.3.1). */}
      <div aria-hidden="true" className="artui-select-group-label">
        {label}
      </div>
      {children}
    </div>
  );

  // Dev guard: empty group label (WCAG 1.3.1).
  if (isDev && label.trim() === "") {
    element = withErrorOverlay(element, {
      key: "Select:empty-group-label",
      component: "Select.Group",
      wcag: "1.3.1",
      message:
        "Select.Group received an empty label. Screen readers will not be able to identify the group.",
    });
  }

  return element;
}

// ---------------------------------------------------------------------------
// Namespace export
// ---------------------------------------------------------------------------

/**
 * Accessible select control with two modes:
 *
 * **Single mode** (default): renders a real, styled native `<select>`.
 * Platform provides full a11y. Use `aria-label` or `aria-labelledby` for the
 * accessible name. `Option` and `Group` children map directly to `<option>` /
 * `<optgroup>`.
 *
 * **Multi mode** (`multiple`): a hidden `<select multiple>` stays in the DOM
 * as the form/value source of truth. The visible UI is a unified Control field
 * containing chips, a disclosure trigger, an optional clear-all button, and a
 * decorative caret: all siblings inside one bordered container. Supports
 * option groups (Group) and live-region announcements on every selection change.
 *
 * @example Single mode
 * <Select aria-label="Country" onValueChange={setCountry}>
 *   <Select.Option value="be">Belgium</Select.Option>
 *   <Select.Option value="nl">Netherlands</Select.Option>
 * </Select>
 *
 * @example Multi mode with groups and clear-all
 * <Select multiple defaultValue={["be"]} onValueChange={setCountries}>
 *   <Select.Control aria-label="Countries" showClearAll>
 *   <Select.Content>
 *     <Select.Group label="Benelux">
 *       <Select.Option value="be">Belgium</Select.Option>
 *       <Select.Option value="nl">Netherlands</Select.Option>
 *     </Select.Group>
 *     <Select.Option value="fr" disabled>France</Select.Option>
 *   </Select.Content>
 * </Select>
 */
export const Select = Object.assign(SelectRoot, {
  Control,
  Content,
  Option,
  Group,
});
