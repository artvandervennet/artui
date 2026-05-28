import {
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

import { type AccessibleNameProps } from "../../lib/a11y-types";
import { withErrorOverlay } from "../../lib/dev-overlay";

import "./dropdown-menu.css";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Rect = { top: number; left: number; width: number; height: number };

// ---------------------------------------------------------------------------
// Root context
// ---------------------------------------------------------------------------

interface RootCtx {
  open: boolean;
  setOpen: (next: boolean) => void;
  triggerId: string;
  menuId: string;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  /** Bounding rect captured once when the menu opens. */
  triggerRect: Rect | null;
  setTriggerRect: (r: Rect | null) => void;
  /** Dev-only: count Trigger children so we can warn about multiples. */
  triggerCount: number;
  incTriggerCount: () => void;
  decTriggerCount: () => void;
}

const RootContext = createContext<RootCtx | null>(null);

function useRoot(componentName: string): RootCtx {
  const ctx = useContext(RootContext);
  if (!ctx) {
    throw new Error(
      `[artui] <DropdownMenu.${componentName}> must be rendered inside <DropdownMenu>.`,
    );
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// Sub context
// ---------------------------------------------------------------------------

interface SubCtx {
  subOpen: boolean;
  setSubOpen: (next: boolean) => void;
  subTriggerId: string;
  subMenuId: string;
  subTriggerRect: Rect | null;
  setSubTriggerRect: (r: Rect | null) => void;
  /** Ref written synchronously by SubTrigger's effect; read by SubContent's dev guard. */
  hasSubTriggerRef: React.MutableRefObject<boolean>;
}

const SubContext = createContext<SubCtx | null>(null);

function useSub(componentName: string): SubCtx {
  const ctx = useContext(SubContext);
  if (!ctx) {
    throw new Error(
      `[artui] <DropdownMenu.${componentName}> must be rendered inside <DropdownMenu.Sub>.`,
    );
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// Keyboard helpers
// ---------------------------------------------------------------------------

const FOCUSABLE_ITEM =
  '[role="menuitem"]:not([aria-disabled="true"]):not([hidden])';

function getItems(menu: HTMLElement): HTMLElement[] {
  // Scope to direct children of the menu container so that items inside a
  // nested SubContent (which is a DOM descendant) are not included in the
  // parent menu's item list. The :scope pseudo-class anchors the selector to
  // the element itself, and > limits the match to immediate children of *that*
  // element: child submenus have their own wrapper div so their menuitem
  // descendants don't match.
  return Array.from(
    menu.querySelectorAll<HTMLElement>(`:scope > ${FOCUSABLE_ITEM}`),
  );
}

function focusItem(items: HTMLElement[], index: number): void {
  items[index]?.focus();
}

// ---------------------------------------------------------------------------
// Positioning helper
// ---------------------------------------------------------------------------

function captureRect(el: HTMLElement): Rect {
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

interface DropdownMenuRootProps {
  children: ReactNode;
  /** When provided, the menu is controlled externally. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function DropdownMenuRoot({
  children,
  open: controlledOpen,
  onOpenChange,
}: DropdownMenuRootProps): ReactElement {
  const isControlled = controlledOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const uid = useId();
  const triggerId = `${uid}-trigger`;
  const menuId = `${uid}-menu`;
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [triggerRect, setTriggerRect] = useState<Rect | null>(null);
  const [triggerCount, setTriggerCount] = useState(0);

  const open = isControlled ? (controlledOpen ?? false) : internalOpen;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  const incTriggerCount = useCallback(() => {
    setTriggerCount((n) => n + 1);
  }, []);
  const decTriggerCount = useCallback(() => {
    setTriggerCount((n) => Math.max(0, n - 1));
  }, []);

  // Close on any scroll or resize: compute rect only once on open.
  useEffect(() => {
    if (!open) return;

    const close = () => setOpen(false);
    window.addEventListener("scroll", close, { passive: true, capture: true });
    window.addEventListener("resize", close, { passive: true });

    return () => {
      window.removeEventListener("scroll", close, { capture: true });
      window.removeEventListener("resize", close);
    };
  }, [open, setOpen]);

  const ctx: RootCtx = {
    open,
    setOpen,
    triggerId,
    menuId,
    triggerRef,
    triggerRect,
    setTriggerRect,
    triggerCount,
    incTriggerCount,
    decTriggerCount,
  };

  return <RootContext.Provider value={ctx}>{children}</RootContext.Provider>;
}

// ---------------------------------------------------------------------------
// Trigger
// ---------------------------------------------------------------------------

type TriggerProps = AccessibleNameProps & {
  className?: string;
  disabled?: boolean;
};

function Trigger({
  className,
  disabled,
  ...accessibleNameProps
}: TriggerProps): ReactElement {
  const {
    open,
    setOpen,
    triggerId,
    menuId,
    triggerRef,
    setTriggerRect,
    triggerCount,
    incTriggerCount,
    decTriggerCount,
  } = useRoot("Trigger");

  // Register this trigger for the multiple-triggers guard.
  // Cleanup is required so React Strict Mode's double-invoke doesn't inflate the count.
  useEffect(() => {
    incTriggerCount();
    return () => decTriggerCount();
  }, [incTriggerCount, decTriggerCount]);

  const handleClick = () => {
    if (disabled) return;
    if (!open && triggerRef.current) {
      setTriggerRect(captureRect(triggerRef.current));
    }
    setOpen(!open);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open && triggerRef.current) {
        setTriggerRect(captureRect(triggerRef.current));
      }
      setOpen(true);
    }
  };

  // Spread accessible name props (children, aria-label, or aria-labelledby).
  const nameProps = accessibleNameProps as {
    children?: string;
    "aria-label"?: string;
    "aria-labelledby"?: string;
  };

  let element = (
    <button
      ref={triggerRef}
      id={triggerId}
      type="button"
      aria-haspopup="menu"
      aria-expanded={open}
      aria-controls={menuId}
      disabled={disabled}
      className={["artui-dropdown-trigger", className]
        .filter(Boolean)
        .join(" ")}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      {...(nameProps["aria-label"] !== undefined
        ? { "aria-label": nameProps["aria-label"] }
        : {})}
      {...(nameProps["aria-labelledby"] !== undefined
        ? { "aria-labelledby": nameProps["aria-labelledby"] }
        : {})}
    >
      {nameProps.children}
    </button>
  );

  if (triggerCount > 1) {
    element = withErrorOverlay(element, {
      key: "DropdownMenu:multiple-triggers",
      component: "DropdownMenu.Trigger",
      message:
        "Multiple Trigger elements detected inside one DropdownMenu. Only one Trigger is allowed per root.",
    });
  }

  return element;
}

// ---------------------------------------------------------------------------
// Content (menu panel)
// ---------------------------------------------------------------------------

interface ContentProps {
  children: ReactNode;
  className?: string;
}

function Content({ children, className }: ContentProps): ReactElement | null {
  const { open, setOpen, menuId, triggerId, triggerRect, triggerRef } = useRoot("Content");
  const menuRef = useRef<HTMLDivElement>(null);

  // Move focus to the first menu item when the menu opens.
  useEffect(() => {
    if (!open || !menuRef.current) return;
    const items = getItems(menuRef.current);
    if (items.length > 0) {
      items[0]?.focus();
    }
  }, [open]);

  // Click outside the menu closes it. Pointerdown captures the press before
  // any focus shifts so we can compare the target against the menu and trigger.
  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (menuRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown, true);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
    };
  }, [open, setOpen, triggerRef]);

  // In controlled mode the menu may open without a trigger click, so triggerRect
  // may be null. Capture it from the live button ref as a fallback.
  const resolvedRect =
    triggerRect ?? (triggerRef.current ? captureRect(triggerRef.current) : null);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!menuRef.current) return;
    const items = getItems(menuRef.current);
    const current = document.activeElement as HTMLElement;
    const idx = items.indexOf(current);

    switch (e.key) {
      case "ArrowDown": {
        e.preventDefault();
        focusItem(items, (idx + 1) % items.length);
        break;
      }
      case "ArrowUp": {
        e.preventDefault();
        focusItem(items, (idx - 1 + items.length) % items.length);
        break;
      }
      case "Home": {
        e.preventDefault();
        focusItem(items, 0);
        break;
      }
      case "End": {
        e.preventDefault();
        focusItem(items, items.length - 1);
        break;
      }
      case "Escape": {
        e.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
        break;
      }
      case "Tab": {
        // Tab closes the menu and lets the browser move focus naturally.
        setOpen(false);
        break;
      }
      default: {
        // Typeahead: jump to first item starting with pressed character.
        if (e.key.length === 1) {
          const ch = e.key.toLowerCase();
          const match = items.find((item) =>
            item.textContent?.trim().toLowerCase().startsWith(ch),
          );
          if (match) {
            e.preventDefault();
            match.focus();
          }
        }
      }
    }
  };

  if (!open || !resolvedRect) return null;

  const style: React.CSSProperties = {
    position: "fixed",
    top: resolvedRect.top + resolvedRect.height,
    left: resolvedRect.left,
    minWidth: resolvedRect.width,
  };

  const hasItems =
    children !== null && children !== undefined && children !== false;

  const element = (
    <div
      ref={menuRef}
      id={menuId}
      role="menu"
      aria-labelledby={triggerId}
      tabIndex={-1}
      className={["artui-dropdown-content", className].filter(Boolean).join(" ")}
      style={style}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  );

  if (!hasItems) {
    return withErrorOverlay(element, {
      key: "DropdownMenu:empty-content",
      component: "DropdownMenu.Content",
      wcag: "1.3.1",
      message:
        "Content rendered with no children. A menu must contain at least one item so keyboard and screen reader users can interact with it.",
    });
  }

  return element;
}

// ---------------------------------------------------------------------------
// Item
// ---------------------------------------------------------------------------

interface ItemProps {
  children: ReactNode;
  onSelect: () => void;
  disabled?: boolean;
  className?: string;
}

function Item({
  children,
  onSelect,
  disabled,
  className,
}: ItemProps): ReactElement {
  const { setOpen, triggerRef } = useRoot("Item");

  const handleClick = () => {
    if (disabled) return;
    onSelect();
    setOpen(false);
    triggerRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      role="menuitem"
      tabIndex={-1}
      aria-disabled={disabled ? "true" : undefined}
      className={["artui-dropdown-item", disabled && "artui-dropdown-item--disabled", className]
        .filter(Boolean)
        .join(" ")}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Separator
// ---------------------------------------------------------------------------

interface SeparatorProps {
  className?: string;
}

function Separator({ className }: SeparatorProps): ReactElement {
  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      className={["artui-dropdown-separator", className].filter(Boolean).join(" ")}
    />
  );
}

// ---------------------------------------------------------------------------
// Sub root
// ---------------------------------------------------------------------------

interface SubProps {
  children: ReactNode;
}

function Sub({ children }: SubProps): ReactElement {
  const uid = useId();
  const subTriggerId = `${uid}-sub-trigger`;
  const subMenuId = `${uid}-sub-menu`;
  const [subOpen, setSubOpen] = useState(false);
  const [subTriggerRect, setSubTriggerRect] = useState<Rect | null>(null);
  const hasSubTriggerRef = useRef(false);

  const ctx: SubCtx = {
    subOpen,
    setSubOpen,
    subTriggerId,
    subMenuId,
    subTriggerRect,
    setSubTriggerRect,
    hasSubTriggerRef,
  };

  return <SubContext.Provider value={ctx}>{children}</SubContext.Provider>;
}

// ---------------------------------------------------------------------------
// SubTrigger
// ---------------------------------------------------------------------------

type SubTriggerProps = AccessibleNameProps & {
  className?: string;
  disabled?: boolean;
};

function SubTrigger({
  className,
  disabled,
  ...accessibleNameProps
}: SubTriggerProps): ReactElement {
  const { setOpen, triggerRef: rootTriggerRef } = useRoot("SubTrigger");
  const { subOpen, setSubOpen, subTriggerId, subMenuId, setSubTriggerRect, hasSubTriggerRef } =
    useSub("SubTrigger");

  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    hasSubTriggerRef.current = true;
    return () => {
      hasSubTriggerRef.current = false;
    };
  }, [hasSubTriggerRef]);

  const openSub = () => {
    if (disabled) return;
    if (triggerRef.current) {
      setSubTriggerRect(captureRect(triggerRef.current));
    }
    setSubOpen(true);
  };

  const handleClick = () => openSub();

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (e.key === "ArrowRight" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openSub();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      rootTriggerRef.current?.focus();
    }
  };

  const nameProps = accessibleNameProps as {
    children?: string;
    "aria-label"?: string;
    "aria-labelledby"?: string;
  };

  return (
    <div
      ref={triggerRef}
      id={subTriggerId}
      role="menuitem"
      tabIndex={-1}
      aria-haspopup="menu"
      aria-expanded={subOpen}
      aria-controls={subMenuId}
      aria-disabled={disabled ? "true" : undefined}
      className={[
        "artui-dropdown-item",
        "artui-dropdown-subtrigger",
        disabled && "artui-dropdown-item--disabled",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      {...(nameProps["aria-label"] !== undefined
        ? { "aria-label": nameProps["aria-label"] }
        : {})}
      {...(nameProps["aria-labelledby"] !== undefined
        ? { "aria-labelledby": nameProps["aria-labelledby"] }
        : {})}
    >
      {nameProps.children}
      <span aria-hidden="true" className="artui-dropdown-subtrigger-arrow">
        &rsaquo;
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SubContent (portals as fixed overlay, sibling to body)
// ---------------------------------------------------------------------------

interface SubContentProps {
  children: ReactNode;
  className?: string;
}

const isDev =
  typeof process !== "undefined" && process.env.NODE_ENV !== "production";

function SubContent({ children, className }: SubContentProps): ReactElement | null {
  const { setOpen } = useRoot("SubContent");
  const { subOpen, setSubOpen, subMenuId, subTriggerId, subTriggerRect, hasSubTriggerRef } =
    useSub("SubContent");

  const menuRef = useRef<HTMLDivElement>(null);

  // Dev guard: fire if SubContent has no matching SubTrigger inside the same Sub.
  // SubTrigger writes hasSubTriggerRef.current synchronously in its effect commit,
  // before any setTimeout fires, so no re-render race is possible.
  useEffect(() => {
    if (!isDev) return;
    const id = setTimeout(() => {
      if (!hasSubTriggerRef.current) {
        console.error(
          "[artui] <DropdownMenu.SubContent>: subtrigger-without-subcontent: " +
            "SubContent rendered without a matching SubTrigger inside the same Sub. " +
            "Every Sub must contain exactly one SubTrigger and one SubContent.",
        );
      }
    }, 0);
    return () => clearTimeout(id);
  }, [hasSubTriggerRef]);

  useEffect(() => {
    if (!subOpen || !menuRef.current) return;
    const items = getItems(menuRef.current);
    if (items.length > 0) items[0]?.focus();
  }, [subOpen]);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!menuRef.current) return;
    const items = getItems(menuRef.current);
    const current = document.activeElement as HTMLElement;
    const idx = items.indexOf(current);

    switch (e.key) {
      case "ArrowDown": {
        e.preventDefault();
        // Stop propagation so the parent Content's ArrowDown handler does not
        // also fire and override the focus move inside this submenu.
        e.stopPropagation();
        focusItem(items, (idx + 1) % items.length);
        break;
      }
      case "ArrowUp": {
        e.preventDefault();
        e.stopPropagation();
        focusItem(items, (idx - 1 + items.length) % items.length);
        break;
      }
      case "Home": {
        e.preventDefault();
        e.stopPropagation();
        focusItem(items, 0);
        break;
      }
      case "End": {
        e.preventDefault();
        e.stopPropagation();
        focusItem(items, items.length - 1);
        break;
      }
      case "ArrowLeft":
      case "Escape": {
        e.preventDefault();
        // Stop propagation so the root Content's Escape handler does not also fire.
        e.stopPropagation();
        setSubOpen(false);
        // Return focus to the sub-trigger in the parent menu.
        document.getElementById(subTriggerId)?.focus();
        break;
      }
      case "Tab": {
        // Stop propagation: Tab already closes everything; parent handler
        // must not also run and attempt to move focus a second time.
        e.stopPropagation();
        setSubOpen(false);
        setOpen(false);
        break;
      }
      default: {
        if (e.key.length === 1) {
          const ch = e.key.toLowerCase();
          const match = items.find((item) =>
            item.textContent?.trim().toLowerCase().startsWith(ch),
          );
          if (match) {
            e.preventDefault();
            e.stopPropagation();
            match.focus();
          }
        }
      }
    }
  };

  // Read offsets from CSS tokens so consumers can theme without touching JS.
  // Horizontal: small gap so the submenu's border/shadow doesn't collide with
  // the parent menu's right edge. Vertical: pull up by the panel's own top
  // padding so the first item aligns with the sub-trigger row.
  const rootStyles =
    typeof window !== "undefined"
      ? getComputedStyle(document.documentElement)
      : null;
  const subOffset =
    parseFloat(rootStyles?.getPropertyValue("--artui-dropdown-sub-offset") ?? "") || 4;
  const contentPadding =
    parseFloat(rootStyles?.getPropertyValue("--artui-dropdown-content-padding") ?? "") || 4;

  if (!subOpen || !subTriggerRect) return null;

  // Compute placement side before first render: no state or layout effect needed.
  // MIN_MENU_WIDTH matches the CSS min-width on .artui-dropdown-content so the
  // flip fires whenever there isn't room for even the narrowest possible menu.
  const MIN_MENU_WIDTH = 160;
  const EDGE_MARGIN = 4;

  const rightSpace =
    window.innerWidth - (subTriggerRect.left + subTriggerRect.width + subOffset);
  const placeLeft = rightSpace < MIN_MENU_WIDTH;

  const left = placeLeft
    ? Math.max(EDGE_MARGIN, subTriggerRect.left - subOffset - MIN_MENU_WIDTH)
    : subTriggerRect.left + subTriggerRect.width + subOffset;

  const top = subTriggerRect.top - contentPadding;

  const style: React.CSSProperties = { position: "fixed", top, left };

  let element = (
    <div
      ref={menuRef}
      id={subMenuId}
      role="menu"
      aria-labelledby={subTriggerId}
      tabIndex={-1}
      className={["artui-dropdown-content", className].filter(Boolean).join(" ")}
      style={style}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  );

  if (!hasSubTriggerRef.current) {
    element = withErrorOverlay(element, {
      key: "DropdownMenu:subtrigger-without-subcontent",
      component: "DropdownMenu.SubContent",
      message:
        "SubContent rendered without a matching SubTrigger inside the same Sub. Every Sub must contain exactly one SubTrigger and one SubContent.",
    });
  }

  return element;
}

// ---------------------------------------------------------------------------
// Namespace export
// ---------------------------------------------------------------------------

/**
 * Accessible dropdown menu following the WAI-ARIA APG Menu Button pattern.
 *
 * @example
 * <DropdownMenu>
 *   <DropdownMenu.Trigger>Account</DropdownMenu.Trigger>
 *   <DropdownMenu.Content>
 *     <DropdownMenu.Item onSelect={goToProfile}>Profile</DropdownMenu.Item>
 *     <DropdownMenu.Separator />
 *     <DropdownMenu.Sub>
 *       <DropdownMenu.SubTrigger>Preferences</DropdownMenu.SubTrigger>
 *       <DropdownMenu.SubContent>
 *         <DropdownMenu.Item onSelect={setLight}>Light theme</DropdownMenu.Item>
 *       </DropdownMenu.SubContent>
 *     </DropdownMenu.Sub>
 *   </DropdownMenu.Content>
 * </DropdownMenu>
 */
export const DropdownMenu = Object.assign(DropdownMenuRoot, {
  Trigger,
  Content,
  Item,
  Separator,
  Sub,
  SubTrigger,
  SubContent,
});
