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

const isDev =
  typeof process !== "undefined" && process.env.NODE_ENV !== "production";

// ---------------------------------------------------------------------------
// Props: discriminated union: exactly one label source required
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
  const bodyFirst = body?.querySelector<HTMLElement>(FOCUSABLE);
  if (bodyFirst) return bodyFirst;
  return container.querySelector<HTMLElement>(FOCUSABLE);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Dialog(props: DialogProps): ReactElement {
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

  // Effect A: open transition: showModal, initial focus, event wiring.
  // Cleanup only removes listeners. dialog.close() is deliberately NOT called
  // here because this effect's cleanup fires after React has already committed
  // the re-render: by that point the <dialog> could have been removed from
  // the DOM (in a conditional-render pattern), making close() a no-op and
  // leaving NVDA's virtual buffer stranded in modal mode. close() is handled
  // exclusively by Effect B, which runs while the element is still mounted.
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
    };
  }, [open, initialFocusRef, returnFocusRef, onClose, closeOnBackdropClick]);

  // Effect B: close transition: dialog.close() then focus restore.
  // Running close() here (while the element is still in the DOM) ensures the
  // browser receives the close signal before any potential unmount, preventing
  // NVDA from getting stuck in a modal context with no dialog to read.
  useEffect(() => {
    if (open) return;
    const dialog = dialogRef.current;
    if (dialog?.open) {
      dialog.close();
    }
    const target = returnFocusRef?.current ?? returnTargetRef.current;
    if (target instanceof HTMLElement) {
      target.focus();
    }
  }, [open, returnFocusRef]);

  // Lock body scroll while open. Native <dialog> + showModal() does not prevent
  // background scrolling on its own (WCAG 2.4.11: focused element not obscured).
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
    if (!isDev || !open || !dialogRef.current) return;
    const dialog = dialogRef.current;

    // Dialog:labelledby-missing (4.1.2): aria-labelledby points at a nonexistent element.
    if (ariaLabelledBy) {
      const target = document.getElementById(ariaLabelledBy);
      if (!target) {
        console.error(
          `[artui] <Dialog> [WCAG 4.1.2]: aria-labelledby="${ariaLabelledBy}" does not resolve to any element in the DOM.`,
        );
      }
    }

    // Dialog:no-focusable (2.1.1): no focusable elements in the dialog body.
    // We check only the body slot, not the header close button.
    const body = dialog.querySelector(".artui-dialog-body");
    const bodyFocusable = body ? body.querySelectorAll(FOCUSABLE) : [];
    if (bodyFocusable.length === 0) {
      console.error(
        `[artui] <Dialog> [WCAG 2.1.1]: No focusable elements found inside the dialog body. Add at least one interactive element so keyboard users can act on the dialog.`,
      );
    }
  }, [open, ariaLabelledBy]);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  // Always render the <dialog> element: never conditionally unmount it.
  // A closed native <dialog> (no `open` attribute) is display:none per the
  // browser UA stylesheet and invisible to the accessibility tree, so there
  // is no observable difference for users. Keeping it mounted ensures
  // dialog.close() can always be called before the element leaves the DOM,
  // which is required to correctly end the browser's top-layer modal session
  // and allow screen readers (NVDA, JAWS) to restore their virtual buffers.
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
    </dialog>
  );

  // Dialog:empty-children (1.3.1): only meaningful when the dialog is open.
  if (open && !hasChildren) {
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
