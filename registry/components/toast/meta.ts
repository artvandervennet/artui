import type { ComponentMeta } from "../../lib/meta-types";

export const meta: ComponentMeta = {
  name: "Toast",
  description:
    "Accessible toast notification system following WAI-ARIA live-region patterns. Supports info/success/warning/error types, auto-dismiss with pause-on-hover, keyboard focus management (Alt+T shortcut), and compile-time enforcement of accessible notification titles.",
  status: "stable",
  files: ["toast.tsx", "toast.css"],
  registryDependencies: ["lib/a11y-types.ts", "lib/dev-overlay.tsx"],
  props: [
    {
      name: "children",
      type: "ReactNode",
      required: true,
      description:
        "Application content. Mount exactly one ToastProvider at the root of your app.",
    },
    {
      name: "maxVisible",
      type: "number",
      required: false,
      defaultValue: "3",
      description:
        "Maximum number of toasts visible at once per region. Oldest is collapsed when the limit is exceeded.",
    },
    {
      name: "defaultDuration",
      type: "number | null",
      required: false,
      defaultValue: "5000",
      description:
        "Default auto-dismiss duration in milliseconds. Pass null for persistent toasts that require explicit dismissal.",
    },
    {
      name: "ToastOptions.title",
      type: "AccessibleText",
      required: true,
      description:
        "Required accessible title for the notification. Empty strings and placeholder values are rejected at compile time.",
    },
    {
      name: "ToastOptions.description",
      type: "string",
      required: false,
      description: "Optional secondary body text shown below the title.",
    },
    {
      name: "ToastOptions.type",
      type: "ToastType",
      required: false,
      defaultValue: '"info"',
      description:
        "Notification severity. info and success are polite; warning and error are assertive.",
    },
    {
      name: "ToastOptions.duration",
      type: "number | null",
      required: false,
      description:
        "Per-toast duration override. null makes the toast persistent. Action toasts have a 10 s minimum.",
    },
    {
      name: "ToastOptions.action",
      type: "ToastAction",
      required: false,
      description:
        "Optional action button. Rendered as a real <button>; invoking it dismisses the toast.",
    },
    {
      name: "ToastAction.label",
      type: "AccessibleText",
      required: true,
      description: "Visible label for the action button. Placeholder values are compile errors.",
    },
    {
      name: "ToastAction.onAction",
      type: "() => void",
      required: true,
      description: "Called when the action button is activated.",
    },
  ],
  accessibility: [
    {
      wcag: "4.1.3",
      description:
        "Info and success toasts are rendered in an aria-live=polite region (role=status). Warning and error toasts are rendered in an aria-live=assertive region (role=alert). Both regions are mounted as persistent DOM nodes so screen readers maintain their subscription even after all toasts dismiss.",
    },
    {
      wcag: "2.2.1",
      description:
        "Timers pause on hover, keyboard focus, document hidden, and prefers-reduced-motion. The 10 s minimum is enforced for action toasts. A dev warning fires for error toasts with short durations.",
    },
    {
      wcag: "2.1.1",
      description:
        "Esc dismisses the focused toast. Alt+T moves focus to the most-recent toast's action or close button. Action and close are real <button> elements activatable by keyboard.",
    },
    {
      wcag: "2.4.3",
      description:
        "Toasts do not steal focus on render. Focus returns to the element that was focused when show() was called, when the toast is dismissed via close/action/Esc: unless the user has already moved focus elsewhere.",
    },
    {
      wcag: "1.4.1",
      description:
        "Type (info/success/warning/error) is conveyed via a visually-hidden text prefix on the title, not color alone.",
    },
    {
      wcag: "2.4.7",
      description:
        "Focus indicators on action and close buttons use outline (not box-shadow) to remain visible in Windows High Contrast Mode.",
    },
  ],
  examples: [
    {
      name: "Basic",
      description: "Show a simple informational toast.",
      code: `const toast = useToast();
toast.info("Profile saved.");`,
    },
    {
      name: "Error with action",
      description: "Persistent error toast with an undo action.",
      code: `const toast = useToast();
toast.error("Upload failed.", {
  duration: null,
  action: { label: "Retry", onAction: retryUpload },
});`,
    },
    {
      name: "Custom duration",
      description: "Override the default auto-dismiss duration.",
      code: `toast.show({ title: "Copied!", type: "success", duration: 2000 });`,
    },
  ],
  related: ["Dialog"],
  donts: [
    {
      code: `toast.show({ title: "" })`,
      reason:
        "Empty title is not an accessible name. Compile error: AccessibleText rejects empty strings.",
    },
    {
      code: `toast.error("Deleted.", { duration: 3000 })`,
      reason:
        "Error toasts with short durations and no action fail WCAG 2.2.1. A dev warning fires and duration should be null or ≥ 10 s.",
    },
  ],
};
