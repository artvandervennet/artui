import {
  type ReactElement,
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import type { AccessibleText } from "../../lib/a11y-types";
import { withErrorOverlay } from "../../lib/dev-overlay";

import "./toast.css";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ToastType = "info" | "success" | "warning" | "error";

export interface ToastAction<L extends string = string> {
  label: AccessibleText<L>;
  onAction: () => void;
}

export interface ToastOptions<T extends string = string, L extends string = string> {
  title: AccessibleText<T>;
  description?: string;
  type?: ToastType;
  duration?: number | null;
  action?: ToastAction<L>;
}

export interface ToastHandle {
  id: string;
  dismiss: () => void;
  done: Promise<void>;
}

export interface ToastShortcutOptions<L extends string = string> {
  description?: string;
  duration?: number | null;
  action?: ToastAction<L>;
}

export interface ToastApi {
  show: <T extends string, L extends string>(opts: ToastOptions<T, L>) => ToastHandle;
  success: <T extends string, L extends string>(title: AccessibleText<T>, opts?: ToastShortcutOptions<L>) => ToastHandle;
  error:   <T extends string, L extends string>(title: AccessibleText<T>, opts?: ToastShortcutOptions<L>) => ToastHandle;
  warning: <T extends string, L extends string>(title: AccessibleText<T>, opts?: ToastShortcutOptions<L>) => ToastHandle;
  info:    <T extends string, L extends string>(title: AccessibleText<T>, opts?: ToastShortcutOptions<L>) => ToastHandle;
}

export interface ToastProviderProps {
  children: ReactNode;
  maxVisible?: number;
  defaultDuration?: number | null;
}

// ---------------------------------------------------------------------------
// Internal types
// ---------------------------------------------------------------------------

type ToastState = "entering" | "visible" | "leaving";
type PauseReason = "hover" | "focus" | "hidden" | "reduced-motion";
type DoneReason = "dismissed" | "expired" | "collapsed" | "unmounted";

interface ResolvedToastOptions {
  title: string;
  description?: string;
  type: ToastType;
  duration: number | null;
  action?: ToastAction;
}

interface ToastRecord {
  id: string;
  options: ResolvedToastOptions;
  region: "polite" | "assertive";
  state: ToastState;
  pauseReasons: Set<PauseReason>;
  remaining: number | null;
  timerId: number | null;
  startedAt: number;
  returnFocusTo: HTMLElement | null;
  resolveDone: (reason: DoneReason) => void;
  done: Promise<void>;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const isDev =
  typeof process !== "undefined" && process.env.NODE_ENV !== "production";

let counter = 0;

function makeId(): string {
  return (
    (typeof crypto !== "undefined" ? crypto.randomUUID?.() : undefined) ??
    String(++counter)
  );
}

const isAssertive = (t: ToastType) => t === "warning" || t === "error";

const TYPE_ICON: Record<ToastType, ReactNode> = {
  info: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="6.5" />
      <line x1="8" y1="7.5" x2="8" y2="11.25" />
      <circle cx="8" cy="5" r="0.4" fill="currentColor" stroke="none" />
    </svg>
  ),
  success: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8.5 6.25 11.75 13 5" />
    </svg>
  ),
  warning: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2.25 14.5 13.25 1.5 13.25 Z" />
      <line x1="8" y1="6.25" x2="8" y2="9.5" />
      <circle cx="8" cy="11.4" r="0.4" fill="currentColor" stroke="none" />
    </svg>
  ),
  error: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="6.5" />
      <line x1="5.5" y1="5.5" x2="10.5" y2="10.5" />
      <line x1="10.5" y1="5.5" x2="5.5" y2="10.5" />
    </svg>
  ),
};

const TYPE_LABEL: Record<ToastType, string> = {
  info: "Information: ",
  success: "Success: ",
  warning: "Warning: ",
  error: "Error: ",
};

const supportsPopover =
  typeof HTMLElement !== "undefined" &&
  Object.prototype.hasOwnProperty.call(HTMLElement.prototype, "popover");

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const ToastContext = createContext<ToastApi | null>(null);

// Tracks whether a provider is already mounted to warn about multiples.
let providerMountCount = 0;

// ---------------------------------------------------------------------------
// ToastProvider
// ---------------------------------------------------------------------------

export function ToastProvider({
  children,
  maxVisible = Infinity,
  defaultDuration = 10_000,
}: ToastProviderProps): ReactElement {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const toastsRef = useRef<ToastRecord[]>([]);
  const [mounted, setMounted] = useState(false);
  const [politeAnnouncement, setPoliteAnnouncement] = useState('');
  const [assertiveAnnouncement, setAssertiveAnnouncement] = useState('');
  // Pending show calls queued before mount.
  const pendingRef = useRef<Array<{ opts: ResolvedToastOptions; drained: boolean }>>([]);

  // Detect duplicate providers.
  const isDuplicateRef = useRef(false);

  useEffect(() => {
    providerMountCount += 1;
    if (providerMountCount > 1) {
      isDuplicateRef.current = true;
      if (isDev) {
        console.error(
          "[artui] <ToastProvider>: Multiple <ToastProvider> instances detected. " +
            "Mount exactly one: duplicate regions duplicate live-region announcements.",
        );
      }
    }
    return () => {
      providerMountCount -= 1;
    };
  }, []);

// Sync ref whenever toasts state changes.
  useEffect(() => {
    toastsRef.current = toasts;
  }, [toasts]);

  // Mount effect: flip mounted flag, show popover, drain queue.
  useEffect(() => {
    setMounted(true);

    if (supportsPopover) {
      const container = document.getElementById("artui-toast-container") as HTMLElement & {
        showPopover?: () => void;
      };
      container?.showPopover?.();
    }
  }, []);

  // Drain pending queue after mount.
  useEffect(() => {
    if (!mounted) return;
    for (const pending of pendingRef.current) {
      if (!pending.drained) {
        pending.drained = true;
        // Actual show is triggered via the api, which was already called.
        // The pending entry contains the resolved options: we add to state here.
        addToast(pending.opts);
      }
    }
    pendingRef.current = [];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  // document.visibilitychange listener: broadcast hidden/visible.
  useEffect(() => {
    const handler = () => {
      const hidden = document.visibilityState !== "visible";
      setToasts((prev) =>
        prev.map((t) => {
          const next = new Set(t.pauseReasons);
          if (hidden) {
            next.add("hidden");
          } else {
            next.delete("hidden");
          }
          return { ...t, pauseReasons: next };
        }),
      );
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, []);

  // matchMedia prefers-reduced-motion listener.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = () => {
      const reduced = mq.matches;
      setToasts((prev) =>
        prev.map((t) => {
          const next = new Set(t.pauseReasons);
          if (reduced) {
            next.add("reduced-motion");
          } else {
            next.delete("reduced-motion");
          }
          return { ...t, pauseReasons: next };
        }),
      );
    };
    mq.addEventListener("change", handler);
    // Apply initial state.
    if (mq.matches) {
      setToasts((prev) =>
        prev.map((t) => {
          const next = new Set(t.pauseReasons);
          next.add("reduced-motion");
          return { ...t, pauseReasons: next };
        }),
      );
    }
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Alt+T global keyboard shortcut.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.altKey &&
        (e.key === "t" || e.key === "T") &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.shiftKey
      ) {
        const current = toastsRef.current;
        // Prefer assertive first, then polite.
        const assertiveToasts = current.filter(
          (t) => t.region === "assertive" && t.state !== "leaving",
        );
        const politeToasts = current.filter(
          (t) => t.region === "polite" && t.state !== "leaving",
        );
        const candidates = assertiveToasts.length > 0 ? assertiveToasts : politeToasts;
        const latest = candidates[candidates.length - 1];
        if (!latest) return;

        const li = document.querySelector<HTMLElement>(
          `[data-artui-toast-id="${latest.id}"]`,
        );
        if (!li) return;

        // Focus preference: action button → close button → li itself.
        const actionBtn = li.querySelector<HTMLElement>(".artui-toast__action");
        const closeBtn = li.querySelector<HTMLElement>(".artui-toast__close");
        if (actionBtn) {
          actionBtn.focus();
        } else if (closeBtn) {
          closeBtn.focus();
        } else {
          li.setAttribute("tabindex", "-1");
          li.focus();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Provider unmount: resolve all done promises and clear timers.
  useEffect(() => {
    return () => {
      for (const t of toastsRef.current) {
        if (t.timerId !== null) {
          clearTimeout(t.timerId);
        }
        t.resolveDone("unmounted");
      }
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Timer management helpers (operate on the record directly, then trigger re-render)
  // ---------------------------------------------------------------------------

  const scheduleTimer = useCallback((record: ToastRecord) => {
    if (
      record.remaining === null ||
      record.remaining <= 0 ||
      record.pauseReasons.size > 0
    ) {
      return;
    }
    if (record.timerId !== null) clearTimeout(record.timerId);
    record.startedAt = performance.now();
    record.timerId = window.setTimeout(() => {
      record.timerId = null;
      startLeaving(record.id, "expired");
    }, record.remaining) as unknown as number;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const pauseTimer = useCallback((record: ToastRecord) => {
    if (record.timerId !== null) {
      clearTimeout(record.timerId);
      record.timerId = null;
      const elapsed = performance.now() - record.startedAt;
      if (record.remaining !== null) {
        record.remaining = Math.max(0, record.remaining - elapsed);
      }
    }
  }, []);

  const startLeaving = useCallback((id: string, reason: DoneReason) => {
    setToasts((prev) => {
      const record = prev.find((t) => t.id === id);
      if (!record || record.state === "leaving") return prev;

      if (record.timerId !== null) {
        clearTimeout(record.timerId);
        record.timerId = null;
      }

      // Focus return.
      const li = document.querySelector<HTMLElement>(`[data-artui-toast-id="${id}"]`);
      if (li) {
        const isInsideLi = li.contains(document.activeElement);
        const region = li.closest<HTMLElement>("[data-artui-toast-region]");
        const isInsideRegion = region?.contains(document.activeElement) ?? false;
        if (isInsideLi || isInsideRegion) {
          record.returnFocusTo?.focus();
        }
      }

      // Schedule DOM removal.
      const removeId = window.setTimeout(() => {
        setToasts((p) => p.filter((t) => t.id !== id));
        record.resolveDone(reason);
      }, 300);

      // Guard against transitionend never firing.
      const li2 = document.querySelector<HTMLElement>(`[data-artui-toast-id="${id}"]`);
      if (li2) {
        const onTransitionEnd = () => {
          clearTimeout(removeId);
          li2.removeEventListener("transitionend", onTransitionEnd);
          setToasts((p) => p.filter((t) => t.id !== id));
          record.resolveDone(reason);
        };
        li2.addEventListener("transitionend", onTransitionEnd, { once: true });
      }

      return prev.map((t) =>
        t.id === id ? { ...t, state: "leaving" as ToastState } : t,
      );
    });
  }, []);

  // ---------------------------------------------------------------------------
  // addToast: internal, called after mount gate
  // ---------------------------------------------------------------------------

  const addToast = useCallback(
    (opts: ResolvedToastOptions): ToastRecord => {
      let resolveDone!: (reason: DoneReason) => void;
      const done = new Promise<void>((res) => {
        resolveDone = () => res();
      });

      const record: ToastRecord = {
        id: makeId(),
        options: opts,
        region: isAssertive(opts.type) ? "assertive" : "polite",
        state: "entering",
        pauseReasons: new Set<PauseReason>(),
        remaining: opts.duration,
        timerId: null,
        startedAt: performance.now(),
        returnFocusTo: document.activeElement as HTMLElement | null,
        resolveDone,
        done,
      };

      // Announce to the appropriate live region.
      const announcementText = opts.description
        ? `${opts.title}. ${opts.description}`
        : opts.title;
      const setAnnouncement = isAssertive(opts.type)
        ? setAssertiveAnnouncement
        : setPoliteAnnouncement;
      setAnnouncement('');
      window.setTimeout(() => setAnnouncement(announcementText), 0);

      // Transition entering → visible on next tick.
      window.setTimeout(() => {
        setToasts((prev) =>
          prev.map((t) =>
            t.id === record.id ? { ...t, state: "visible" as ToastState } : t,
          ),
        );
        scheduleTimer(record);
      }, 16);

      setToasts((prev) => {
        const visibleToasts = prev.filter((t) => t.state !== "leaving");
        let next = [...prev, record];

        // Collapse oldest if over maxVisible.
        if (visibleToasts.length >= maxVisible) {
          const oldest = visibleToasts[0];
          if (oldest) {
            if (oldest.timerId !== null) {
              clearTimeout(oldest.timerId);
              oldest.timerId = null;
            }
            window.setTimeout(() => {
              setToasts((p) => p.filter((t) => t.id !== oldest.id));
              oldest.resolveDone("collapsed");
            }, 300);
            next = next.map((t) =>
              t.id === oldest.id ? { ...t, state: "leaving" as ToastState } : t,
            );
          }
        }

        return next;
      });

      return record;
    },
    [maxVisible, scheduleTimer],
  );

  // ---------------------------------------------------------------------------
  // Pause/resume on hover and focus (wired as native DOM events on each <li>)
  // ---------------------------------------------------------------------------

  const handlePointerEnter = useCallback(
    (id: string) => {
      setToasts((prev) => {
        const record = prev.find((t) => t.id === id);
        if (!record) return prev;
        record.pauseReasons.add("hover");
        pauseTimer(record);
        return [...prev];
      });
    },
    [pauseTimer],
  );

  const handlePointerLeave = useCallback(
    (id: string) => {
      setToasts((prev) => {
        const record = prev.find((t) => t.id === id);
        if (!record) return prev;
        record.pauseReasons.delete("hover");
        if (record.pauseReasons.size === 0) {
          scheduleTimer(record);
        }
        return [...prev];
      });
    },
    [scheduleTimer],
  );

  const handleFocusIn = useCallback(
    (id: string) => {
      setToasts((prev) => {
        const record = prev.find((t) => t.id === id);
        if (!record) return prev;
        record.pauseReasons.add("focus");
        pauseTimer(record);
        return [...prev];
      });
    },
    [pauseTimer],
  );

  const handleFocusOut = useCallback(
    (id: string) => {
      setToasts((prev) => {
        const record = prev.find((t) => t.id === id);
        if (!record) return prev;
        record.pauseReasons.delete("focus");
        if (record.pauseReasons.size === 0) {
          scheduleTimer(record);
        }
        return [...prev];
      });
    },
    [scheduleTimer],
  );

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  const show = useCallback(
    <T extends string, L extends string>(opts: ToastOptions<T, L>): ToastHandle => {
      const type = opts.type ?? "info";
      let duration =
        opts.duration !== undefined ? opts.duration : defaultDuration;

      // Dev guards.
      if (isDev) {
        if (
          type === "error" &&
          !opts.action &&
          duration !== null &&
          duration < 10_000
        ) {
          console.error(
            `[artui] <ToastProvider>: Error toast with duration ${duration}ms and no action. Errors should be persistent (duration: null) or last at least 10 s.`,
          );
        }
        if (
          opts.action &&
          opts.duration !== undefined &&
          opts.duration !== null &&
          opts.duration < 10_000
        ) {
          console.error(
            `[artui] <ToastProvider>: Toast with action has duration ${opts.duration}ms. Action toasts are bumped to a 10 s minimum.`,
          );
        }
      }

      // Silently bump action-toast duration to 10s floor.
      if (opts.action && duration !== null && duration < 10_000) {
        duration = 10_000;
      }

      const resolved: ResolvedToastOptions = {
        title: opts.title as string,
        description: opts.description,
        type,
        duration,
        action: opts.action,
      };

      // Check that the region is actually in the DOM.
      if (mounted && !document.getElementById("artui-toast-region")) {
        if (isDev) {
          console.error(
            "[artui] <ToastProvider>: Toast fired but the aria-live region is not in the DOM. " +
              "Ensure <ToastProvider> is mounted and not conditionally rendered.",
          );
        }
        let noopResolve!: () => void;
        const done = new Promise<void>((res) => {
          noopResolve = res;
        });
        noopResolve();
        return { id: makeId(), dismiss: () => {}, done };
      }

      if (!mounted) {
        // Queue for drain after mount.
        const id = makeId();
        let noopResolve!: () => void;
        const done = new Promise<void>((res) => {
          noopResolve = res;
        });
        noopResolve();
        pendingRef.current.push({ opts: resolved, drained: false });
        return { id, dismiss: () => {}, done };
      }

      const record = addToast(resolved);
      return {
        id: record.id,
        dismiss: () => startLeaving(record.id, "dismissed"),
        done: record.done,
      };
    },
    [mounted, defaultDuration, addToast, startLeaving],
  );

  const success = useCallback(
    <T extends string, L extends string>(title: AccessibleText<T>, opts?: ToastShortcutOptions<L>): ToastHandle =>
      show({ ...opts, title, type: "success" }),
    [show],
  );

  const error = useCallback(
    <T extends string, L extends string>(title: AccessibleText<T>, opts?: ToastShortcutOptions<L>): ToastHandle =>
      show({ ...opts, title, type: "error" }),
    [show],
  );

  const warning = useCallback(
    <T extends string, L extends string>(title: AccessibleText<T>, opts?: ToastShortcutOptions<L>): ToastHandle =>
      show({ ...opts, title, type: "warning" }),
    [show],
  );

  const info = useCallback(
    <T extends string, L extends string>(title: AccessibleText<T>, opts?: ToastShortcutOptions<L>): ToastHandle =>
      show({ ...opts, title, type: "info" }),
    [show],
  );

  const api: ToastApi = { show, success, error, warning, info };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  let providerChildren = <>{children}</>;

  if (isDuplicateRef.current) {
    providerChildren = withErrorOverlay(<>{children}</>, {
      key: "Toast:duplicate-provider",
      component: "ToastProvider",
      message:
        "Multiple <ToastProvider> instances detected. Mount exactly one: duplicate regions duplicate live-region announcements.",
    });
  }

  return (
    <ToastContext.Provider value={api}>
      {providerChildren}
      {mounted &&
        createPortal(
          <div
            id="artui-toast-container"
            className={`artui-toast-container${supportsPopover ? "" : " artui-toast-container--fallback"}`}
            {...(supportsPopover ? { popover: "manual" as const } : {})}
          >
            <div
              role="status"
              aria-live="polite"
              aria-atomic="true"
              className="artui-visually-hidden"
            >
              {politeAnnouncement}
            </div>
            <div
              role="alert"
              aria-live="assertive"
              aria-atomic="true"
              className="artui-visually-hidden"
            >
              {assertiveAnnouncement}
            </div>
            <ToastRegion
              id="artui-toast-region"
              toasts={toasts}
              onPointerEnter={handlePointerEnter}
              onPointerLeave={handlePointerLeave}
              onFocusIn={handleFocusIn}
              onFocusOut={handleFocusOut}
              onDismiss={(id) => startLeaving(id, "dismissed")}
            />
          </div>,
          document.body,
        )}
    </ToastContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// ToastRegion
// ---------------------------------------------------------------------------

interface ToastRegionProps {
  id: string;
  toasts: ToastRecord[];
  onPointerEnter: (id: string) => void;
  onPointerLeave: (id: string) => void;
  onFocusIn: (id: string) => void;
  onFocusOut: (id: string) => void;
  onDismiss: (id: string) => void;
}

function ToastRegion({
  id,
  toasts,
  onPointerEnter,
  onPointerLeave,
  onFocusIn,
  onFocusOut,
  onDismiss,
}: ToastRegionProps): ReactElement {
  const regionRef = useRef<HTMLOListElement>(null);

  // Esc key: dismiss the toast containing the focused element.
  useEffect(() => {
    const el = regionRef.current;
    if (!el) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const li = (e.target as Element)?.closest<HTMLElement>("li[data-artui-toast-id]");
      if (!li) return;
      const toastId = li.dataset.artuiToastId;
      if (toastId) {
        e.stopPropagation();
        onDismiss(toastId);
      }
    };
    el.addEventListener("keydown", handler);
    return () => el.removeEventListener("keydown", handler);
  }, [onDismiss]);

  return (
    <ol
      ref={regionRef}
      id={id}
      data-artui-toast-region
      className="artui-toast-region"
    >
      {toasts.map((t) => (
        <ToastItem
          key={t.id}
          record={t}
          onPointerEnter={onPointerEnter}
          onPointerLeave={onPointerLeave}
          onFocusIn={onFocusIn}
          onFocusOut={onFocusOut}
          onDismiss={onDismiss}
        />
      ))}
    </ol>
  );
}

// ---------------------------------------------------------------------------
// ToastItem
// ---------------------------------------------------------------------------

interface ToastItemProps {
  record: ToastRecord;
  onPointerEnter: (id: string) => void;
  onPointerLeave: (id: string) => void;
  onFocusIn: (id: string) => void;
  onFocusOut: (id: string) => void;
  onDismiss: (id: string) => void;
}

function ToastItem({
  record,
  onPointerEnter,
  onPointerLeave,
  onFocusIn,
  onFocusOut,
  onDismiss,
}: ToastItemProps): ReactElement {
  const liRef = useRef<HTMLLIElement>(null);

  // Wire native DOM events for hover and focus.
  useEffect(() => {
    const li = liRef.current;
    if (!li) return;

    const handlePointerEnter = () => onPointerEnter(record.id);
    const handlePointerLeave = () => onPointerLeave(record.id);
    const handleFocusIn = () => onFocusIn(record.id);
    const handleFocusOut = () => onFocusOut(record.id);

    li.addEventListener("pointerenter", handlePointerEnter);
    li.addEventListener("pointerleave", handlePointerLeave);
    li.addEventListener("focusin", handleFocusIn);
    li.addEventListener("focusout", handleFocusOut);

    return () => {
      li.removeEventListener("pointerenter", handlePointerEnter);
      li.removeEventListener("pointerleave", handlePointerLeave);
      li.removeEventListener("focusin", handleFocusIn);
      li.removeEventListener("focusout", handleFocusOut);
    };
  }, [record.id, onPointerEnter, onPointerLeave, onFocusIn, onFocusOut]);

  const { options, state } = record;

  const handleActionClick = () => {
    options.action?.onAction();
    onDismiss(record.id);
  };

  return (
    <li
      ref={liRef}
      className={`artui-toast artui-toast--${options.type}`}
      data-artui-toast-id={record.id}
      data-artui-toast-state={state}
    >
      <span className="artui-toast__icon" aria-hidden="true">
        {TYPE_ICON[options.type]}
      </span>
      <div className="artui-toast__body">
        <p className="artui-toast__title">
          <span className="artui-visually-hidden">{TYPE_LABEL[options.type]}</span>
          {options.title}
        </p>
        {options.description && (
          <p className="artui-toast__description">{options.description}</p>
        )}
      </div>
      {options.action && (
        <button
          type="button"
          className="artui-toast__action"
          onClick={handleActionClick}
        >
          {options.action.label as string}
        </button>
      )}
      <button
        type="button"
        className="artui-toast__close"
        aria-label="Dismiss notification"
        onClick={() => onDismiss(record.id)}
      >
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
          <line x1="4" y1="4" x2="12" y2="12" />
          <line x1="12" y1="4" x2="4" y2="12" />
        </svg>
      </button>
    </li>
  );
}

// ---------------------------------------------------------------------------
// useToast
// ---------------------------------------------------------------------------

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("[artui] useToast() must be called inside <ToastProvider>.");
  }
  return ctx;
}
