/**
 * Type-only test file. Run with `tsc --noEmit` — the @ts-expect-error lines
 * MUST be errors. If TypeScript ever stops flagging them, the safety net
 * is broken and this file fails to compile.
 */

import type { ReactNode } from "react";

import { ToastProvider, useToast } from "./toast";

export function ValidUses(): ReactNode {
  return (
    <ToastProvider>
      <span>app</span>
    </ToastProvider>
  );
}

export function ValidApiCalls(): void {
  // These must compile without errors.
  const toast = useToast();

  // Shortcut with valid title.
  toast.success("Saved.");

  // Error with action — valid.
  toast.error("Upload failed.", {
    duration: null,
    action: { label: "Retry", onAction: () => {} },
  });

  // Full show with all valid fields.
  toast.show({
    title: "Notification",
    description: "Something happened.",
    type: "info",
    duration: 5000,
  });

  // Warning and info shortcuts.
  toast.warning("Low disk space.");
  toast.info("New message received.");
}

export function InvalidTitleCases(): void {
  const toast = useToast();

  // @ts-expect-error empty title is not AccessibleText
  toast.show({ title: "" });

  // @ts-expect-error whitespace title is not AccessibleText
  toast.show({ title: " " });

  // @ts-expect-error "image" is a placeholder value, not AccessibleText
  toast.show({ title: "image" });

  // @ts-expect-error "Image" is a placeholder value, not AccessibleText
  toast.show({ title: "Image" });

  // @ts-expect-error missing title property
  toast.show({ type: "info" });

  // @ts-expect-error unknown type "danger"
  toast.show({ title: "Alert", type: "danger" });

  // @ts-expect-error empty action label
  toast.show({ title: "Alert", action: { label: "", onAction: () => {} } });

  // @ts-expect-error whitespace action label
  toast.show({ title: "Alert", action: { label: " ", onAction: () => {} } });

  // @ts-expect-error empty title on shortcut
  toast.success("");
}

export function InvalidActionCases(): void {
  const toast = useToast();

  // @ts-expect-error action missing label
  toast.show({ title: "Done.", action: { onAction: () => {} } });

  // @ts-expect-error action missing onAction
  toast.show({ title: "Done.", action: { label: "Undo" } });
}
