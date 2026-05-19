import {
  type ReactElement,
  type ReactNode,
  type RefObject,
  useEffect,
  useId,
  useRef,
} from "react";

import { type AccessibleText } from "../../lib/a11y-types";
import { withErrorOverlay } from "../../lib/dev-overlay";

import "./dialog.css";

// ---------------------------------------------------------------------------
// Props — discriminated union: exactly one label source required
// ---------------------------------------------------------------------------

type DialogLabelProps =
  | { title: AccessibleText; "aria-labelledby"?: never }
  | { title?: never; "aria-labelledby": string };

type DialogBaseProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  description?: AccessibleText;
  initialFocusRef?: RefObject<HTMLElement | null>;
  returnFocusRef?: RefObject<HTMLElement | null>;
  /** Whether clicking the backdrop calls onClose. Defaults to true. */
  closeOnBackdropClick?: boolean;
  className?: string;
};

export type DialogProps = DialogBaseProps & DialogLabelProps;

// ---------------------------------------------------------------------------
// Module constants & pure helpers
// ---------------------------------------------------------------------------

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function getFirstFocusable(container: HTMLElement): HTMLElement | null {
  // Prefer a focusable element inside the body slot over the header close button,
  // so keyboard users land on the dialog's primary content first.
  const body = container.querySelector<HTMLElement>(".artui-dialog-body");
  if (body) {
    const bodyFirst = body.querySelector<HTMLElement>(FOCUSABLE);
    if (bodyFirst) return bodyFirst;
  }
  return container.querySelector<HTMLElement>(FOCUSABLE);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Dialog(props: DialogProps): ReactElement | null {
  // Props
  const {
    open,
    onClose,
    children,
    description,
    initialFocusRef,
    returnFocusRef,
    closeOnBackdropClick = true,
    className,
    ...labelRest
  } = props;

  // IDs
  const uid = useId();
  const titleId = `${uid}-title`;
  const descId = `${uid}-desc`;

  // Refs
  const dialogRef = useRef<HTMLDialogElement>(null);
  // Capture the element that had focus before the dialog opened so we can restore it.
  const returnTargetRef = useRef<Element | null>(null);

  // Computed
  const { title, "aria-labelledby": ariaLabelledBy } = labelRest as {
    title?: string;
    "aria-labelledby"?: string;
  };
  const hasChildren =
    children !== null && children !== undefined && children !== false;
  const labelledBy = title ? titleId : (ariaLabelledBy ?? titleId);

  // -------------------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------------------

  // Open / close lifecycle: showModal, initial focus, event wiring, cleanup.
  useEffect(() => {
    if (!open) return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    // Capture return-focus target before showModal moves focus.
    returnTargetRef.current =
      returnFocusRef?.current ?? document.activeElement;

    if (!dialog.open) {
      dialog.showModal();
    }

    // Move focus to initialFocusRef, or fall back to first focusable child.
    const focusTarget =
      initialFocusRef?.current ?? getFirstFocusable(dialog);
    if (focusTarget) {
      focusTarget.focus();
    }

    // Backdrop click: native <dialog> dispatches click on itself when the
    // user clicks the ::backdrop pseudo-element. Children stop bubbling.
    const handleClick = (e: MouseEvent) => {
      if (closeOnBackdropClick && e.target === dialog) {
        onClose();
      }
    };
    // Intercept native cancel (Escape) so we control the close sequence.
    const handleCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };
    dialog.addEventListener("click", handleClick);
    dialog.addEventListener("cancel", handleCancel);

    return () => {
      dialog.removeEventListener("click", handleClick);
      dialog.removeEventListener("cancel", handleCancel);
      if (dialog.open) {
        dialog.close();
      }
    };
  }, [open, initialFocusRef, returnFocusRef, onClose, closeOnBackdropClick]);

  // Restore focus on close.
  useEffect(() => {
    if (open) return;
    const target = returnFocusRef?.current ?? returnTargetRef.current;
    if (target && target instanceof HTMLElement) {
      target.focus();
    }
  }, [open, returnFocusRef]);

  // Lock body scroll while open. Native <dialog> + showModal() does not prevent
  // background scrolling on its own (WCAG 2.4.11 — focused element not obscured).
  useEffect(() => {
    if (!open || typeof document === "undefined") return;
    const body = document.body;
    const previousOverflow = body.style.overflow;
    body.style.overflow = "hidden";
    return () => {
      body.style.overflow = previousOverflow;
    };
  }, [open]);

  // Runtime violation detection (dev overlays).
  useEffect(() => {
    if (!open || !dialogRef.current) return;
    const dialog = dialogRef.current;

    // Dialog:labelledby-missing (4.1.2) — aria-labelledby points at a nonexistent element.
    if (ariaLabelledBy) {
      const target = document.getElementById(ariaLabelledBy);
      if (!target) {
        console.error(
          `[artui] <Dialog> [WCAG 4.1.2]: aria-labelledby="${ariaLabelledBy}" does not resolve to any element in the DOM.`,
        );
      }
    }

    // Dialog:no-focusable (2.1.1) — no focusable elements in the dialog body.
    // We check only the body slot, not the header close button or the sentinel.
    const body = dialog.querySelector(".artui-dialog-body");
    const bodyFocusable = body ? body.querySelectorAll(FOCUSABLE) : [];
    if (bodyFocusable.length === 0) {
      console.error(
        `[artui] <Dialog> [WCAG 2.1.1]: No focusable elements found inside the dialog body. The hidden sentinel close button is the only focus stop.`,
      );
    }
  }, [open, ariaLabelledBy]);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  if (!open) return null;

  const element = (
    <dialog
      ref={dialogRef}
      aria-modal="true"
      aria-labelledby={labelledBy}
      aria-describedby={description ? descId : undefined}
      className={["artui-dialog", className].filter(Boolean).join(" ")}
    >
      <div className="artui-dialog-header">
        {title && (
          <h2 id={titleId} className="artui-dialog-title">
            {title}
          </h2>
        )}

        <button
          type="button"
          className="artui-dialog-close"
          aria-label="Close"
          onClick={onClose}
        >
          <svg
            aria-hidden="true"
            focusable="false"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="4" y1="4" x2="16" y2="16" />
            <line x1="16" y1="4" x2="4" y2="16" />
          </svg>
        </button>
      </div>

      {description && (
        <p id={descId} className="artui-dialog-description">
          {description}
        </p>
      )}

      <div className="artui-dialog-body">{children}</div>

      {/* Hidden sentinel button — last-resort focusable so the dialog never has zero focus stops. */}
      <button
        type="button"
        className="artui-dialog-sentinel"
        aria-label="Close dialog"
        tabIndex={-1}
        onClick={onClose}
      >
        Close dialog
      </button>
    </dialog>
  );

  // Dialog:empty-children (1.3.1) — children rendered no visible content.
  if (!hasChildren) {
    return withErrorOverlay(element, {
      key: "Dialog:empty-children",
      component: "Dialog",
      wcag: "1.3.1",
      message:
        "Dialog rendered with no children. Dialogs must contain content so screen reader users know what the dialog is about.",
    });
  }

  return element;
}
