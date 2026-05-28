import type { ComponentMeta } from "../../lib/meta-types";

export const meta: ComponentMeta = {
  name: "Dialog",
  description:
    "Accessible modal dialog using native <dialog> with showModal(). Browser-managed focus trap, top layer, and Escape handling. Follows WAI-ARIA APG Dialog Modal pattern.",
  status: "stable",
  files: ["dialog.tsx", "dialog.css"],
  registryDependencies: ["lib/a11y-types.ts", "lib/dev-overlay.tsx"],
  props: [
    {
      name: "title",
      type: "AccessibleText",
      required: false,
      description:
        "Visible dialog heading rendered as an <h2>. Exactly one of title or aria-labelledby is required: passing neither or both is a compile error.",
    },
    {
      name: "aria-labelledby",
      type: "string",
      required: false,
      description:
        "ID of an existing element that labels this dialog. Mutually exclusive with title.",
    },
    {
      name: "open",
      type: "boolean",
      required: true,
      description: "Controls whether the dialog is shown.",
    },
    {
      name: "onClose",
      type: "() => void",
      required: true,
      description:
        "Called when the user closes the dialog (close button, Escape, or backdrop click). The consumer is responsible for setting open to false.",
    },
    {
      name: "children",
      type: "ReactNode",
      required: true,
      description: "Dialog body content. Rendering no content triggers a dev overlay.",
    },
    {
      name: "description",
      type: "AccessibleText",
      required: false,
      description:
        "Optional supplementary description rendered as a <p> and wired to the dialog via aria-describedby.",
    },
    {
      name: "initialFocusRef",
      type: "RefObject<HTMLElement | null>",
      required: false,
      description:
        "Ref to the element that should receive focus when the dialog opens. Falls back to the first focusable descendant.",
    },
    {
      name: "returnFocusRef",
      type: "RefObject<HTMLElement | null>",
      required: false,
      description:
        "Ref to the element that should receive focus when the dialog closes. Falls back to the element that was focused before the dialog opened.",
    },
    {
      name: "closeOnBackdropClick",
      type: "boolean",
      required: false,
      defaultValue: "true",
      description: "Whether clicking the backdrop calls onClose.",
    },
    {
      name: "className",
      type: "string",
      required: false,
      description: "Additional CSS class applied to the <dialog> element.",
    },
  ],
  accessibility: [
    {
      wcag: "1.3.1",
      description:
        "The title prop renders a semantic <h2> inside the dialog. A dev overlay fires when children is empty so the developer sees the issue immediately.",
    },
    {
      wcag: "2.1.1",
      description:
        "The header close button is always rendered, so the dialog never has zero focus stops. A dev overlay fires when the dialog body has no focusable elements, prompting the developer to add interactive content.",
    },
    {
      wcag: "2.1.2",
      description:
        "Focus is trapped inside the dialog by the browser's native showModal() implementation. Escape always exits.",
    },
    {
      wcag: "2.4.3",
      description:
        "Focus moves to initialFocusRef (or the first focusable descendant) on open, and returns to the previously focused element (or returnFocusRef) on close.",
    },
    {
      wcag: "2.4.7",
      description:
        "The close button uses outline (not box-shadow) for its focus ring, preserving visibility in Windows High Contrast Mode.",
    },
    {
      wcag: "4.1.2",
      description:
        'The <dialog> element has role="dialog" natively, aria-modal="true", and aria-labelledby pointing at either the auto-generated title <h2> or a caller-supplied element. A dev overlay fires when aria-labelledby does not resolve to a DOM element.',
    },
  ],
  examples: [
    {
      name: "Basic with title",
      description: "Standard controlled dialog with a visible heading.",
      code: `const [open, setOpen] = useState(false);
<button onClick={() => setOpen(true)}>Open dialog</button>
<Dialog open={open} onClose={() => setOpen(false)} title="Confirm deletion">
  <p>This action cannot be undone.</p>
  <button onClick={() => setOpen(false)}>Cancel</button>
  <button onClick={handleConfirm}>Delete</button>
</Dialog>`,
    },
    {
      name: "With description",
      description: "Supplementary description wired via aria-describedby.",
      code: `<Dialog
  open={open}
  onClose={() => setOpen(false)}
  title="Delete account"
  description="Your data will be permanently removed after 30 days."
>
  <button onClick={() => setOpen(false)}>Cancel</button>
  <button onClick={handleDelete}>Delete</button>
</Dialog>`,
    },
    {
      name: "With initialFocusRef",
      description: "Focus lands on a specific element instead of the first focusable one.",
      code: `const cancelRef = useRef<HTMLButtonElement>(null);
<Dialog
  open={open}
  onClose={() => setOpen(false)}
  title="Unsaved changes"
  initialFocusRef={cancelRef}
>
  <button ref={cancelRef} onClick={() => setOpen(false)}>Discard changes</button>
  <button onClick={handleSave}>Save</button>
</Dialog>`,
    },
    {
      name: "With aria-labelledby",
      description: "Label sourced from an external element.",
      code: `<h2 id="dialog-heading">Account settings</h2>
<Dialog open={open} onClose={() => setOpen(false)} aria-labelledby="dialog-heading">
  <p>Manage your account details.</p>
</Dialog>`,
    },
    {
      name: "No backdrop dismiss",
      description: "User must use the close button or Escape to exit.",
      code: `<Dialog
  open={open}
  onClose={() => setOpen(false)}
  title="Required confirmation"
  closeOnBackdropClick={false}
>
  <p>Please confirm before continuing.</p>
  <button onClick={() => setOpen(false)}>OK</button>
</Dialog>`,
    },
  ],
  related: ["Datepicker"],
  donts: [
    {
      code: `<Dialog open={open} onClose={() => setOpen(false)}>
  <p>Content</p>
</Dialog>`,
      reason:
        "Missing label source. Compile error: every Dialog must have title or aria-labelledby so screen reader users know what the dialog is about.",
    },
    {
      code: `<Dialog
  open={open}
  onClose={() => setOpen(false)}
  title="Heading"
  aria-labelledby="external-id"
>
  <p>Content</p>
</Dialog>`,
      reason:
        "Two label sources at once. Compile error: pass exactly one of title or aria-labelledby.",
    },
    {
      code: `<Dialog open={open} onClose={() => setOpen(false)} title="Empty">{false}</Dialog>`,
      reason:
        "Empty children. A dev overlay fires with WCAG 1.3.1. Dialogs must contain content so screen reader users understand their purpose.",
    },
  ],
};
