import {
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  Children,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

import { type AccessibleNameProps } from "../../lib/a11y-types";

import "./accordion.css";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type AccordionSingleProps = {
  type?: "single";
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
};

type AccordionMultipleProps = {
  type: "multiple";
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
};

export type AccordionProps = (AccordionSingleProps | AccordionMultipleProps) & {
  /** Heading level rendered by every Accordion.Header (h2..h6). Required. */
  headingLevel: 2 | 3 | 4 | 5 | 6;
  children: ReactNode;
  className?: string;
};

export type AccordionItemProps = {
  /** Stable identifier. Required; runtime-validated for uniqueness. */
  value: string;
  /** Marks the entire item non-interactive (summary gets aria-disabled). */
  disabled?: boolean;
  children: ReactNode;
  className?: string;
};

export type AccordionHeaderProps = {
  children: ReactNode;
  className?: string;
};

export type AccordionTriggerProps = AccessibleNameProps & {
  className?: string;
};

export type AccordionPanelProps = {
  children: ReactNode;
  className?: string;
};

// ---------------------------------------------------------------------------
// Root context
// ---------------------------------------------------------------------------

interface RootCtx {
  type: "single" | "multiple";
  headingLevel: 2 | 3 | 4 | 5 | 6;
  openValues: Set<string>;
  setOpen: (value: string, open: boolean, userInitiated: boolean) => void;
  groupName: string;
  isControlled: boolean;
  /** Ref-based registry for synchronous duplicate-value detection. */
  registeredValuesRef: React.MutableRefObject<string[]>;
  /** Registers an item value; returns deregister cleanup. Updates itemCount state. */
  registerItem: (value: string) => () => void;
  /** State-based count used for the region-role threshold and empty guard. */
  itemCount: number;
  /** Pushes a polite announcement into the root's aria-live region. */
  announce: (text: string) => void;
}

const RootContext = createContext<RootCtx | null>(null);

function useRoot(componentName: string): RootCtx {
  const ctx = useContext(RootContext);
  if (!ctx) {
    throw new Error(
      `[artui] <Accordion.${componentName}> must be rendered inside <Accordion>.`,
    );
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// Item context
// ---------------------------------------------------------------------------

interface ItemCtx {
  value: string;
  disabled: boolean;
  summaryId: string;
  panelId: string;
  isOpen: boolean;
  lastOpenWasUserInitiated: React.MutableRefObject<boolean>;
  hasTriggerRef: React.MutableRefObject<boolean>;
  hasPanelRef: React.MutableRefObject<boolean>;
}

const ItemContext = createContext<ItemCtx | null>(null);

function useItem(componentName: string): ItemCtx {
  const ctx = useContext(ItemContext);
  if (!ctx) {
    throw new Error(
      `[artui] <Accordion.${componentName}> must be rendered inside <Accordion.Item>.`,
    );
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// isDev flag
// ---------------------------------------------------------------------------

const isDev =
  typeof process !== "undefined" && process.env.NODE_ENV !== "production";

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

function AccordionRoot(props: AccordionProps) {
  const { headingLevel, children, className } = props;
  const type = props.type ?? "single";
  const groupName = useId();

  // Ref-based registry for synchronous duplicate detection in Item.
  const registeredValuesRef = useRef<string[]>([]);

  // State-based count for panelGetsRegionRole threshold and empty guard.
  const [itemCount, setItemCount] = useState(0);

  // Polite live-region text announced once on user-initiated expand. Clearing
  // between announcements (the rAF dance in `announce`) is what lets the same
  // panel text re-announce when it's reopened.
  const [announcement, setAnnouncement] = useState("");

  const announce = useCallback((text: string) => {
    setAnnouncement("");
    requestAnimationFrame(() => setAnnouncement(text));
  }, []);

  const getInitialOpen = (): Set<string> => {
    if (type === "multiple") {
      const p = props as AccordionMultipleProps;
      return new Set(p.value ?? p.defaultValue ?? []);
    }
    const p = props as AccordionSingleProps;
    const v = p.value ?? p.defaultValue;
    return v ? new Set([v]) : new Set();
  };

  const [internalOpenValues, setInternalOpenValues] =
    useState<Set<string>>(getInitialOpen);

  const isControlled =
    type === "multiple"
      ? (props as AccordionMultipleProps).value !== undefined
      : (props as AccordionSingleProps).value !== undefined;

  let effectiveOpen: Set<string>;
  if (isControlled) {
    if (type === "multiple") {
      effectiveOpen = new Set((props as AccordionMultipleProps).value ?? []);
    } else {
      const v = (props as AccordionSingleProps).value;
      effectiveOpen = v ? new Set([v]) : new Set();
    }
  } else {
    effectiveOpen = internalOpenValues;
  }

  const internalOpenRef = useRef(internalOpenValues);
  internalOpenRef.current = internalOpenValues;

  const setOpen = useCallback(
    (value: string, open: boolean, userInitiated: boolean) => {
      if (type === "multiple") {
        const p = props as AccordionMultipleProps;
        if (!isControlled) {
          setInternalOpenValues((prev) => {
            const next = new Set(prev);
            if (open) next.add(value);
            else next.delete(value);
            return next;
          });
        }
        if (userInitiated && p.onValueChange) {
          const current = isControlled
            ? new Set(p.value ?? [])
            : internalOpenRef.current;
          const next = new Set(current);
          if (open) next.add(value);
          else next.delete(value);
          p.onValueChange(Array.from(next));
        }
      } else {
        const p = props as AccordionSingleProps;
        if (!isControlled) {
          setInternalOpenValues(open ? new Set([value]) : new Set());
        }
        if (userInitiated && open && p.onValueChange) {
          p.onValueChange(value);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [type, isControlled],
  );

  const registerItem = useCallback((value: string) => {
    registeredValuesRef.current = [...registeredValuesRef.current, value];
    setItemCount((n) => n + 1);
    return () => {
      registeredValuesRef.current = registeredValuesRef.current.filter(
        (v) => v !== value,
      );
      setItemCount((n) => Math.max(0, n - 1));
    };
  }, []);

  // Empty guard: deferred so children's registration effects run first.
  useEffect(() => {
    if (!isDev) return;
    const id = setTimeout(() => {
      if (registeredValuesRef.current.length === 0) {
        console.error(
          `[artui] <Accordion> [Accordion:empty]: Accordion rendered with no Items. Add at least one Accordion.Item.`,
        );
      }
    }, 0);
    return () => clearTimeout(id);
  }, []);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (!target.matches("summary[data-artui-accordion-summary]")) return;

    const all = Array.from(
      e.currentTarget.querySelectorAll<HTMLElement>(
        "summary[data-artui-accordion-summary]:not([aria-disabled='true'])",
      ),
    );
    const idx = all.indexOf(target);

    switch (e.key) {
      case "ArrowDown": {
        e.preventDefault();
        all[(idx + 1) % all.length]?.focus();
        break;
      }
      case "ArrowUp": {
        e.preventDefault();
        all[(idx - 1 + all.length) % all.length]?.focus();
        break;
      }
      case "Home": {
        e.preventDefault();
        all[0]?.focus();
        break;
      }
      case "End": {
        e.preventDefault();
        all[all.length - 1]?.focus();
        break;
      }
    }
  };

  const ctx: RootCtx = {
    type,
    headingLevel,
    openValues: effectiveOpen,
    setOpen,
    groupName,
    isControlled,
    registeredValuesRef,
    registerItem,
    itemCount,
    announce,
  };

  return (
    // The APG accordion pattern delegates Arrow/Home/End navigation from the wrapper
    // div to its summary children. The div itself is not interactive; it's a scoped
    // keyboard event boundary. jsx-a11y flags this because it sees an onKeyDown on a
    // non-interactive element, but no WAI-ARIA role fits here without requiring an
    // accessible name that doesn't exist at the container level.
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      className={["artui-accordion", className].filter(Boolean).join(" ")}
      onKeyDown={handleKeyDown}
    >
      <RootContext.Provider value={ctx}>{children}</RootContext.Provider>
      <div
        aria-live="polite"
        aria-atomic="true"
        className="artui-accordion-sr-only"
      >
        {announcement}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Item
// ---------------------------------------------------------------------------

function AccordionItem({
  value,
  disabled = false,
  children,
  className,
}: AccordionItemProps) {
  const {
    type,
    openValues,
    setOpen,
    groupName,
    isControlled,
    registeredValuesRef,
    registerItem,
    itemCount,
  } = useRoot("Item");

  const uid = useId();
  const summaryId = `${uid}-summary`;
  const panelId = `${uid}-panel`;
  const isOpen = openValues.has(value);

  const lastOpenWasUserInitiated = useRef(false);
  const userInitiatedRef = useRef(false);
  const hasTriggerRef = useRef(false);
  const hasPanelRef = useRef(false);
  const detailsRef = useRef<HTMLDetailsElement>(null);

  // Register with root so itemCount stays accurate and duplicate detection works.
  useEffect(() => {
    return registerItem(value);
  }, [registerItem, value]);

  // In controlled mode, sync details.open to the externally-driven isOpen value.
  // In uncontrolled mode, the native toggle event is the source of truth: we
  // must NOT write back to details.open or we create a feedback loop via the
  // toggle event listener.
  useEffect(() => {
    if (!isControlled) return;
    if (detailsRef.current && detailsRef.current.open !== isOpen) {
      detailsRef.current.open = isOpen;
    }
  }, [isControlled, isOpen]);

  // Dev guards: fire after children and siblings have committed their registration effects.
  useEffect(() => {
    if (!isDev) return;
    const id = setTimeout(() => {
      if (!hasTriggerRef.current) {
        console.error(
          `[artui] <Accordion.Item> [Accordion:item-without-trigger]: ` +
            `Accordion.Item rendered without exactly one Trigger. Each Item must contain one Header + one Trigger + one Panel.`,
        );
      }
      if (!hasPanelRef.current) {
        console.error(
          `[artui] <Accordion.Item> [Accordion:item-without-panel]: ` +
            `Accordion.Item rendered without a Panel. Triggers need panels to describe.`,
        );
      }
      // Duplicate-value check: after all siblings have registered, count occurrences.
      if (registeredValuesRef.current.filter((v) => v === value).length > 1) {
        console.error(
          `[artui] <Accordion.Item> [Accordion:duplicate-values]: ` +
            `Accordion.Item with value="${value}" is duplicated. Each Item must have a unique value.`,
        );
      }
    }, 0);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePointerDown = () => {
    if (!disabled) userInitiatedRef.current = true;
  };

  const handleSummaryKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (!disabled && (e.key === "Enter" || e.key === " ")) {
      userInitiatedRef.current = true;
    }
  };

  useEffect(() => {
    const el = detailsRef.current;
    if (!el) return;

    const handleToggle = (e: Event) => {
      const te = e as ToggleEvent;
      const userInitiated = userInitiatedRef.current;
      userInitiatedRef.current = false;
      if (te.newState === "open") {
        lastOpenWasUserInitiated.current = userInitiated;
      }
      setOpen(value, te.newState === "open", userInitiated);
    };

    el.addEventListener("toggle", handleToggle);
    return () => el.removeEventListener("toggle", handleToggle);
  }, [value, setOpen]);

  // Split children: Panel goes after <summary>, everything else goes inside it.
  const childArray = Children.toArray(children);
  const summaryChildren: ReactNode[] = [];
  const outsideChildren: ReactNode[] = [];

  for (const child of childArray) {
    if (
      isValidElement(child) &&
      (child as ReactElement).type === AccordionPanel
    ) {
      outsideChildren.push(child);
    } else {
      summaryChildren.push(child);
    }
  }

  const itemCtx: ItemCtx = {
    value,
    disabled,
    summaryId,
    panelId,
    isOpen,
    lastOpenWasUserInitiated,
    hasTriggerRef,
    hasPanelRef,
  };

  // panelGetsRegionRole derived from itemCount (state, so re-renders when count changes).
  const panelGetsRegionRole = itemCount <= 6;

  return (
    <ItemContext.Provider value={{ ...itemCtx }}>
      <details
        ref={detailsRef}
        data-value={value}
        {...(type === "single" ? { name: groupName } : {})}
        className={["artui-accordion-item", className]
          .filter(Boolean)
          .join(" ")}
      >
        <summary
          id={summaryId}
          data-artui-accordion-summary=""
          aria-controls={panelId}
          aria-expanded={isOpen}
          aria-disabled={disabled ? "true" : undefined}
          // Disabled summaries are removed from the natural tab order so neither
          // Tab nor Shift+Tab can land on them. Arrow/Home/End already skip them
          // via :not([aria-disabled='true']). tabIndex={0} is the implicit
          // default for <summary>; we must be explicit here.
          tabIndex={disabled ? -1 : 0}
          className="artui-accordion-summary"
          onPointerDown={handlePointerDown}
          onKeyDown={handleSummaryKeyDown}
          onClick={(e) => { if (disabled) e.preventDefault(); }}
        >
          {summaryChildren}
          <span aria-hidden="true" className="artui-accordion-chevron" />
        </summary>
        {/* Render Panel children with region role info available via a nested context. */}
        <PanelRegionContext.Provider value={panelGetsRegionRole}>
          {outsideChildren}
        </PanelRegionContext.Provider>
      </details>
    </ItemContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// PanelRegionContext: passes panelGetsRegionRole from Item to Panel
// ---------------------------------------------------------------------------

const PanelRegionContext = createContext<boolean>(true);

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------

function AccordionHeader({ children, className }: AccordionHeaderProps) {
  const { headingLevel } = useRoot("Header");
  const Tag = `h${headingLevel}` as "h2" | "h3" | "h4" | "h5" | "h6";
  return (
    <Tag
      className={["artui-accordion-header", className]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </Tag>
  );
}

// ---------------------------------------------------------------------------
// Trigger
// ---------------------------------------------------------------------------

function AccordionTrigger({
  className,
  ...accessibleNameProps
}: AccordionTriggerProps) {
  const { hasTriggerRef } = useItem("Trigger");

  useEffect(() => {
    hasTriggerRef.current = true;
    return () => {
      hasTriggerRef.current = false;
    };
  }, [hasTriggerRef]);

  const nameProps = accessibleNameProps as {
    children?: string;
    "aria-label"?: string;
    "aria-labelledby"?: string;
  };

  return (
    <span
      className={["artui-accordion-trigger", className]
        .filter(Boolean)
        .join(" ")}
      {...(nameProps["aria-label"] !== undefined
        ? { "aria-label": nameProps["aria-label"] }
        : {})}
      {...(nameProps["aria-labelledby"] !== undefined
        ? { "aria-labelledby": nameProps["aria-labelledby"] }
        : {})}
    >
      {nameProps.children}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Panel
// ---------------------------------------------------------------------------

function AccordionPanel({ children, className }: AccordionPanelProps) {
  const { panelId, summaryId, isOpen, lastOpenWasUserInitiated, hasPanelRef } =
    useItem("Panel");
  const { announce } = useRoot("Panel");
  const panelGetsRegionRole = useContext(PanelRegionContext);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    hasPanelRef.current = true;
    return () => {
      hasPanelRef.current = false;
    };
  }, [hasPanelRef]);

  // Announce the panel's text content via the root's polite live region on
  // user-initiated expand. Focus stays on the summary so Space / Enter still
  // toggle the disclosure on subsequent presses. Programmatic opens (controlled
  // value, defaultValue on mount) do not announce: the user did not ask.
  useEffect(() => {
    if (!isOpen) return;
    if (!lastOpenWasUserInitiated.current) return;
    lastOpenWasUserInitiated.current = false;
    const text = panelRef.current?.textContent?.trim();
    if (text) announce(text);
  }, [isOpen, lastOpenWasUserInitiated, announce]);

  return (
    <div
      ref={panelRef}
      id={panelId}
      {...(panelGetsRegionRole ? { role: "region" } : {})}
      aria-labelledby={summaryId}
      tabIndex={-1}
      className={["artui-accordion-panel", className].filter(Boolean).join(" ")}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Namespace export
// ---------------------------------------------------------------------------

/**
 * Accessible accordion built on native <details> / <summary>.
 *
 * @example
 * <Accordion headingLevel={3}>
 *   <Accordion.Item value="faq-1">
 *     <Accordion.Header><Accordion.Trigger>Question one?</Accordion.Trigger></Accordion.Header>
 *     <Accordion.Panel>Answer one.</Accordion.Panel>
 *   </Accordion.Item>
 * </Accordion>
 */
export const Accordion = Object.assign(AccordionRoot, {
  Item: AccordionItem,
  Header: AccordionHeader,
  Trigger: AccordionTrigger,
  Panel: AccordionPanel,
});
