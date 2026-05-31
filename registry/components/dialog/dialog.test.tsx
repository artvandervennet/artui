import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { __resetDevOverlayCache } from "../../lib/dev-overlay";

import { Dialog, DialogTrigger } from "./dialog";

describe("Dialog", () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    __resetDevOverlayCache();
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    // JSDOM does not implement showModal/close; shim them so dialog lifecycle works.
    HTMLDialogElement.prototype.showModal = vi
      .fn()
      .mockImplementation(function (this: HTMLDialogElement) {
        this.setAttribute("open", "");
      });
    HTMLDialogElement.prototype.close = vi.fn().mockImplementation(function (
      this: HTMLDialogElement,
    ) {
      this.removeAttribute("open");
      this.dispatchEvent(new Event("close"));
    });
  });

  afterEach(() => {
    errorSpy.mockRestore();
    vi.restoreAllMocks();
  });

  // -------------------------------------------------------------------------
  // Accessible name: title prop
  // -------------------------------------------------------------------------

  it("renders an h2 heading when title prop is provided", () => {
    render(
      <Dialog open onClose={() => {}} title="Confirm deletion">
        <p>Are you sure?</p>
      </Dialog>,
    );
    expect(screen.getByRole("heading", { level: 2, name: "Confirm deletion" })).toBeInTheDocument();
  });

  it("wires aria-labelledby on the dialog to the generated title id", () => {
    render(
      <Dialog open onClose={() => {}} title="Confirm deletion">
        <p>Are you sure?</p>
      </Dialog>,
    );
    const dialog = screen.getByRole("dialog");
    const labelledBy = dialog.getAttribute("aria-labelledby");
    expect(document.getElementById(labelledBy!)).toHaveTextContent("Confirm deletion");
  });

  // -------------------------------------------------------------------------
  // Accessible name: aria-labelledby prop
  // -------------------------------------------------------------------------

  it("uses the provided aria-labelledby value when title is absent", () => {
    render(
      <div>
        <h2 id="external-heading">External heading</h2>
        <Dialog open onClose={() => {}} aria-labelledby="external-heading">
          <p>Content</p>
        </Dialog>
      </div>,
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-labelledby", "external-heading");
  });

  // -------------------------------------------------------------------------
  // Description wiring
  // -------------------------------------------------------------------------

  it("renders description and wires aria-describedby when description prop is set", () => {
    render(
      <Dialog
        open
        onClose={() => {}}
        title="Settings"
        description="Adjust your preferences below."
      >
        <p>Content</p>
      </Dialog>,
    );
    const dialog = screen.getByRole("dialog");
    const descId = dialog.getAttribute("aria-describedby");
    expect(document.getElementById(descId!)).toHaveTextContent("Adjust your preferences below.");
  });

  it("does not set aria-describedby when description is absent", () => {
    render(
      <Dialog open onClose={() => {}} title="Settings">
        <p>Content</p>
      </Dialog>,
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).not.toHaveAttribute("aria-describedby");
  });

  // -------------------------------------------------------------------------
  // ARIA attributes
  // -------------------------------------------------------------------------

  it('has aria-modal="true"', () => {
    render(
      <Dialog open onClose={() => {}} title="Modal">
        <p>Content</p>
      </Dialog>,
    );
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
  });

  // -------------------------------------------------------------------------
  // Open / close lifecycle
  // -------------------------------------------------------------------------

  it("dialog element is present but not open when open is false", () => {
    render(
      <Dialog open={false} onClose={() => {}} title="Hidden">
        <p>Content</p>
      </Dialog>,
    );
    // The <dialog> is always in the DOM: a closed native <dialog> (no `open`
    // attribute) is display:none per the UA stylesheet and AT-invisible, so
    // the external contract is unchanged. We must keep it mounted so that
    // dialog.close() can fire before any unmount, preventing NVDA from getting
    // stranded in modal mode.
    const dialog = document.querySelector("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog).not.toHaveAttribute("open");
  });

  it("renders the dialog when open is true", () => {
    render(
      <Dialog open onClose={() => {}} title="Visible">
        <p>Content</p>
      </Dialog>,
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("calls onClose when the close button is clicked", async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    render(
      <Dialog open onClose={handleClose} title="Close test">
        <p>Content</p>
      </Dialog>,
    );
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(handleClose).toHaveBeenCalledOnce();
  });

  it("calls onClose when Escape is pressed", async () => {
    const handleClose = vi.fn();
    render(
      <Dialog open onClose={handleClose} title="Escape test">
        <p>Content</p>
      </Dialog>,
    );
    // Simulate the native cancel event that Escape fires on <dialog>.
    const dialog = screen.getByRole("dialog");
    dialog.dispatchEvent(new Event("cancel", { bubbles: true, cancelable: true }));
    expect(handleClose).toHaveBeenCalledOnce();
  });

  it("calls onClose when backdrop is clicked and closeOnBackdropClick is true", async () => {
    const handleClose = vi.fn();
    render(
      <Dialog open onClose={handleClose} title="Backdrop test" closeOnBackdropClick>
        <p>Content</p>
      </Dialog>,
    );
    const dialog = screen.getByRole("dialog");
    // Simulate a click whose target is the dialog element itself (backdrop click).
    dialog.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(handleClose).toHaveBeenCalledOnce();
  });

  it("does not call onClose when backdrop is clicked and closeOnBackdropClick is false", async () => {
    const handleClose = vi.fn();
    render(
      <Dialog open onClose={handleClose} title="Backdrop disabled" closeOnBackdropClick={false}>
        <p>Content</p>
      </Dialog>,
    );
    const dialog = screen.getByRole("dialog");
    dialog.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(handleClose).not.toHaveBeenCalled();
  });

  // -------------------------------------------------------------------------
  // Close button
  // -------------------------------------------------------------------------

  it("renders a close button with aria-label=Close", () => {
    render(
      <Dialog open onClose={() => {}} title="Close button">
        <p>Content</p>
      </Dialog>,
    );
    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
  });

  it("close button has an SVG icon that is aria-hidden", () => {
    render(
      <Dialog open onClose={() => {}} title="Icon test">
        <p>Content</p>
      </Dialog>,
    );
    const closeBtn = screen.getByRole("button", { name: "Close" });
    const svg = closeBtn.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  // -------------------------------------------------------------------------
  // Focus management
  // -------------------------------------------------------------------------

  it("moves focus to the first focusable child on open", () => {
    render(
      <Dialog open onClose={() => {}} title="Focus test">
        <button type="button">Action</button>
      </Dialog>,
    );
    const actionBtn = screen.getByRole("button", { name: "Action" });
    expect(document.activeElement).toBe(actionBtn);
  });

  it("moves focus to initialFocusRef target when provided", () => {
    function Wrapper() {
      const ref = { current: null as HTMLButtonElement | null };
      return (
        <Dialog open onClose={() => {}} title="Initial focus" initialFocusRef={ref}>
          <button type="button" ref={(el) => { ref.current = el; }}>
            Secondary
          </button>
          <button type="button">Primary</button>
        </Dialog>
      );
    }
    render(<Wrapper />);
    expect(document.activeElement).toHaveTextContent("Secondary");
  });

  it("restores focus to the previously focused element on close", () => {
    const trigger = document.createElement("button");
    trigger.textContent = "Open dialog";
    document.body.appendChild(trigger);
    trigger.focus();

    const { rerender } = render(
      <Dialog open onClose={() => {}} title="Return focus">
        <button type="button">Action</button>
      </Dialog>,
    );

    rerender(
      <Dialog open={false} onClose={() => {}} title="Return focus">
        <button type="button">Action</button>
      </Dialog>,
    );

    expect(document.activeElement).toBe(trigger);
    document.body.removeChild(trigger);
  });

  // -------------------------------------------------------------------------
  // Runtime overlays
  // -------------------------------------------------------------------------

  it("fires dev overlay with WCAG 1.3.1 for empty children", () => {
    render(
      <Dialog open onClose={() => {}} title="Empty">
        {false}
      </Dialog>,
    );
    const hit = errorSpy.mock.calls.find((call: unknown[]) =>
      String(call[0]).includes("1.3.1"),
    );
    expect(hit).toBeDefined();
  });

  it("fires dev overlay with WCAG 4.1.2 when aria-labelledby points to a nonexistent element", () => {
    render(
      <Dialog open onClose={() => {}} aria-labelledby="does-not-exist">
        <p>Content</p>
      </Dialog>,
    );
    const hit = errorSpy.mock.calls.find((call: unknown[]) =>
      String(call[0]).includes("4.1.2"),
    );
    expect(hit).toBeDefined();
  });

  it("fires dev overlay with WCAG 2.1.1 when no focusable elements are in the dialog body", () => {
    render(
      <Dialog open onClose={() => {}} title="No focusable">
        <p>Just text, no buttons</p>
      </Dialog>,
    );
    const hit = errorSpy.mock.calls.find((call: unknown[]) =>
      String(call[0]).includes("2.1.1"),
    );
    expect(hit).toBeDefined();
  });

  // -------------------------------------------------------------------------
  // className passthrough
  // -------------------------------------------------------------------------

  it("appends custom className to the dialog element", () => {
    render(
      <Dialog open onClose={() => {}} title="Styled" className="my-dialog">
        <p>Content</p>
      </Dialog>,
    );
    expect(screen.getByRole("dialog")).toHaveClass("my-dialog");
  });

  it("always includes the artui-dialog base class", () => {
    render(
      <Dialog open onClose={() => {}} title="Base class">
        <p>Content</p>
      </Dialog>,
    );
    expect(screen.getByRole("dialog")).toHaveClass("artui-dialog");
  });

  it("applies the provided id to the <dialog> element", () => {
    render(
      <Dialog open onClose={() => {}} title="Id test" id="my-dialog">
        <p>Content</p>
      </Dialog>,
    );
    expect(screen.getByRole("dialog")).toHaveAttribute("id", "my-dialog");
  });
});

describe("DialogTrigger", () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    __resetDevOverlayCache();
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    errorSpy.mockRestore();
    vi.restoreAllMocks();
  });

  // -------------------------------------------------------------------------
  // ARIA attributes
  // -------------------------------------------------------------------------

  it('has aria-haspopup="dialog"', () => {
    render(
      <DialogTrigger controls="my-dialog" open={false} onClick={() => {}}>
        Open
      </DialogTrigger>,
    );
    expect(screen.getByRole("button", { name: "Open" })).toHaveAttribute(
      "aria-haspopup",
      "dialog",
    );
  });

  it("sets aria-controls to the provided controls id", () => {
    render(
      <DialogTrigger controls="my-dialog" open={false} onClick={() => {}}>
        Open
      </DialogTrigger>,
    );
    expect(screen.getByRole("button", { name: "Open" })).toHaveAttribute(
      "aria-controls",
      "my-dialog",
    );
  });

  it('has aria-expanded="false" when open is false', () => {
    render(
      <DialogTrigger controls="my-dialog" open={false} onClick={() => {}}>
        Open
      </DialogTrigger>,
    );
    expect(screen.getByRole("button", { name: "Open" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it('has aria-expanded="true" when open is true', () => {
    render(
      <DialogTrigger controls="my-dialog" open onClick={() => {}}>
        Open
      </DialogTrigger>,
    );
    expect(screen.getByRole("button", { name: "Open" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("updates aria-expanded when open prop toggles from false to true", () => {
    const { rerender } = render(
      <DialogTrigger controls="my-dialog" open={false} onClick={() => {}}>
        Open
      </DialogTrigger>,
    );
    rerender(
      <DialogTrigger controls="my-dialog" open onClick={() => {}}>
        Open
      </DialogTrigger>,
    );
    expect(screen.getByRole("button", { name: "Open" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("updates aria-expanded when open prop toggles from true to false", () => {
    const { rerender } = render(
      <DialogTrigger controls="my-dialog" open onClick={() => {}}>
        Open
      </DialogTrigger>,
    );
    rerender(
      <DialogTrigger controls="my-dialog" open={false} onClick={() => {}}>
        Open
      </DialogTrigger>,
    );
    expect(screen.getByRole("button", { name: "Open" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  // -------------------------------------------------------------------------
  // Native button behavior
  // -------------------------------------------------------------------------

  it('has type="button" to prevent accidental form submission', () => {
    render(
      <DialogTrigger controls="my-dialog" open={false} onClick={() => {}}>
        Open
      </DialogTrigger>,
    );
    expect(screen.getByRole("button", { name: "Open" })).toHaveAttribute(
      "type",
      "button",
    );
  });

  it("fires onClick when clicked", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <DialogTrigger controls="my-dialog" open={false} onClick={handleClick}>
        Open
      </DialogTrigger>,
    );
    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  // -------------------------------------------------------------------------
  // aria-controls + dialog id wiring
  // -------------------------------------------------------------------------

  it("aria-controls matches the id on the Dialog element", () => {
    render(
      <>
        <DialogTrigger controls="wired-dialog" open={false} onClick={() => {}}>
          Open
        </DialogTrigger>
        <Dialog open={false} onClose={() => {}} title="Wired" id="wired-dialog">
          <button type="button">Action</button>
        </Dialog>
      </>,
    );
    const trigger = screen.getByRole("button", { name: "Open" });
    const controlsId = trigger.getAttribute("aria-controls");
    expect(document.getElementById(controlsId!)).not.toBeNull();
  });

  // -------------------------------------------------------------------------
  // className passthrough
  // -------------------------------------------------------------------------

  it("applies className to the button element", () => {
    render(
      <DialogTrigger
        controls="my-dialog"
        open={false}
        onClick={() => {}}
        className="custom-trigger"
      >
        Open
      </DialogTrigger>,
    );
    expect(screen.getByRole("button", { name: "Open" })).toHaveClass(
      "custom-trigger",
    );
  });

  // -------------------------------------------------------------------------
  // Ref forwarding
  // -------------------------------------------------------------------------

  it("forwards ref to the underlying button element", () => {
    const ref = { current: null as HTMLButtonElement | null };
    render(
      <DialogTrigger
        ref={ref}
        controls="my-dialog"
        open={false}
        onClick={() => {}}
      >
        Open
      </DialogTrigger>,
    );
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  // -------------------------------------------------------------------------
  // Dev guard — controls not resolving
  // -------------------------------------------------------------------------

  it("logs a WCAG 4.1.2 console.error when controls does not resolve to a DOM element", () => {
    render(
      <DialogTrigger controls="does-not-exist" open={false} onClick={() => {}}>
        Open
      </DialogTrigger>,
    );
    const hit = errorSpy.mock.calls.find((call: unknown[]) =>
      String(call[0]).includes("4.1.2"),
    );
    expect(hit).toBeDefined();
  });

  it("does not log a console.error when controls resolves to the Dialog element", () => {
    render(
      <>
        <DialogTrigger controls="resolves-dialog" open={false} onClick={() => {}}>
          Open
        </DialogTrigger>
        <Dialog open={false} onClose={() => {}} title="Resolves" id="resolves-dialog">
          <button type="button">Action</button>
        </Dialog>
      </>,
    );
    const hit = errorSpy.mock.calls.find((call: unknown[]) =>
      String(call[0]).includes("DialogTrigger") &&
      String(call[0]).includes("4.1.2"),
    );
    expect(hit).toBeUndefined();
  });
});
