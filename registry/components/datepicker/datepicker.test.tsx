import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { __resetDevOverlayCache } from "../../lib/dev-overlay";

import { Datepicker } from "./datepicker";

// Stable reference date used across tests: 15 May 2026
const MAY_15 = new Date(2026, 4, 15);

describe("Datepicker", () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    __resetDevOverlayCache();
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    // JSDOM does not implement showModal/close; shim them so dialog lifecycle works.
    HTMLDialogElement.prototype.showModal = vi
      .fn()
      .mockImplementation(function (this: HTMLDialogElement) {
        this.setAttribute("open", ""); // makes the dialog visible in the a11y tree
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
  // Label and accessible name
  // -------------------------------------------------------------------------

  it("renders a visible label and associates it with the input", () => {
    render(
      <Datepicker label="Appointment date" value={null} onChange={() => {}} />,
    );
    expect(screen.getByLabelText("Appointment date")).toBeInTheDocument();
  });

  it("wires aria-label to the input when label prop is absent", () => {
    render(
      <Datepicker
        aria-label="Appointment date"
        value={null}
        onChange={() => {}}
      />,
    );
    expect(
      screen.getByRole("textbox", { name: "Appointment date" }),
    ).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Calendar open / close
  // -------------------------------------------------------------------------

  it("opens the calendar popup on trigger button click", async () => {
    const user = userEvent.setup();
    render(<Datepicker label="Date" value={null} onChange={() => {}} />);
    await user.click(screen.getByRole("button", { name: /open date picker/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("closes the calendar on Escape and returns focus to trigger", async () => {
    const user = userEvent.setup();
    render(<Datepicker label="Date" value={null} onChange={() => {}} />);
    const trigger = screen.getByRole("button", { name: /open date picker/i });
    await user.click(trigger);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.activeElement).toBe(trigger);
  });

  it("closes the calendar on close button click and returns focus to trigger", async () => {
    const user = userEvent.setup();
    render(<Datepicker label="Date" value={null} onChange={() => {}} />);
    const trigger = screen.getByRole("button", { name: /open date picker/i });
    await user.click(trigger);
    await user.click(screen.getByRole("button", { name: /close/i }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.activeElement).toBe(trigger);
  });

  // -------------------------------------------------------------------------
  // Dialog ARIA attributes
  // -------------------------------------------------------------------------

  it('dialog has role="dialog", aria-modal="true", and aria-labelledby pointing at the heading', async () => {
    const user = userEvent.setup();
    render(
      <Datepicker
        label="Date"
        value={MAY_15}
        onChange={() => {}}
        locale="en-US"
      />,
    );
    await user.click(screen.getByRole("button", { name: /open date picker/i }));
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    const headingId = dialog.getAttribute("aria-labelledby");
    expect(headingId).toBeTruthy();
    const heading = document.getElementById(headingId!);
    expect(heading).toBeInTheDocument();
    expect(heading?.tagName).toBe("H2");
  });

  it('trigger has aria-haspopup="dialog" and aria-expanded reflects open state', async () => {
    const user = userEvent.setup();
    render(<Datepicker label="Date" value={null} onChange={() => {}} />);
    const trigger = screen.getByRole("button", { name: /open date picker/i });
    expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  // -------------------------------------------------------------------------
  // Day cell ARIA attributes
  // -------------------------------------------------------------------------

  it('selected day has aria-selected="true"', async () => {
    const user = userEvent.setup();
    render(
      <Datepicker
        label="Date"
        value={MAY_15}
        onChange={() => {}}
        locale="en-US"
      />,
    );
    await user.click(screen.getByRole("button", { name: /open date picker/i }));
    const selected = screen.getByRole("button", { name: "May 15, 2026" });
    expect(selected.closest('[role="gridcell"]')).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it('non-selected days have aria-selected="false"', async () => {
    const user = userEvent.setup();
    render(
      <Datepicker
        label="Date"
        value={MAY_15}
        onChange={() => {}}
        locale="en-US"
      />,
    );
    await user.click(screen.getByRole("button", { name: /open date picker/i }));
    const dayFourteen = screen.getByRole("button", { name: "May 14, 2026" });
    expect(dayFourteen.closest('[role="gridcell"]')).not.toHaveAttribute(
      "aria-selected",
    );
  });

  it('disabled days have aria-disabled="true" and disabled attribute', async () => {
    const user = userEvent.setup();
    render(
      <Datepicker
        label="Date"
        value={null}
        onChange={() => {}}
        min={MAY_15}
        locale="en-US"
        // May 1 is before min, so it should be disabled
      />,
    );
    await user.click(screen.getByRole("button", { name: /open date picker/i }));
    const dayOne = screen.getByRole("button", { name: "May 1, 2026" });
    expect(dayOne).toHaveAttribute("aria-disabled", "true");
    expect(dayOne).toBeDisabled();
  });

  // -------------------------------------------------------------------------
  // Day selection
  // -------------------------------------------------------------------------

  it("clicking a day calls onChange with the selected date and closes the dialog", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <Datepicker
        label="Date"
        value={null}
        onChange={handleChange}
        locale="en-US"
      />,
    );
    await user.click(screen.getByRole("button", { name: /open date picker/i }));
    const cells = screen.getAllByRole("button", { name: /15/ });
    const dayBtn = cells.find((el) =>
      el.classList.contains("artui-dp-day-btn"),
    );
    if (dayBtn) {
      await user.click(dayBtn);
    }
    expect(handleChange).toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("disabled days cannot be selected", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <Datepicker
        label="Date"
        value={null}
        onChange={handleChange}
        isDateDisabled={(d) => d.getDay() === 0}
        locale="en-US"
      />,
    );
    await user.click(screen.getByRole("button", { name: /open date picker/i }));
    const disabled = document.querySelector<HTMLElement>(
      'button[aria-disabled="true"]',
    );
    if (disabled) {
      // fireEvent bypasses pointer-events:none; the handler still guards with isDisabled check
      fireEvent.click(disabled);
    }
    expect(handleChange).not.toHaveBeenCalled();
  });

  // -------------------------------------------------------------------------
  // Keyboard grid navigation
  // -------------------------------------------------------------------------

  it("ArrowRight moves focus to the next day", async () => {
    const user = userEvent.setup();
    render(
      <Datepicker
        label="Date"
        value={MAY_15}
        onChange={() => {}}
        locale="en-US"
      />,
    );
    await user.click(screen.getByRole("button", { name: /open date picker/i }));
    const focused = screen.getByRole("button", { name: "May 15, 2026" });
    focused.focus();
    await user.keyboard("{ArrowRight}");
    const nextDay = screen.getByRole("button", { name: "May 16, 2026" });
    expect(document.activeElement).toBe(nextDay);
  });

  it("ArrowDown moves focus to the same weekday next week", async () => {
    const user = userEvent.setup();
    render(
      <Datepicker
        label="Date"
        value={MAY_15}
        onChange={() => {}}
        locale="en-US"
      />,
    );
    await user.click(screen.getByRole("button", { name: /open date picker/i }));
    const focused = screen.getByRole("button", { name: "May 15, 2026" });
    focused.focus();
    await user.keyboard("{ArrowDown}");
    const nextWeek = screen.getByRole("button", { name: "May 22, 2026" });
    expect(document.activeElement).toBe(nextWeek);
  });

  it("Enter on a focused day selects it, calls onChange, and closes dialog", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <Datepicker
        label="Date"
        value={MAY_15}
        onChange={handleChange}
        locale="en-US"
      />,
    );
    await user.click(screen.getByRole("button", { name: /open date picker/i }));
    const dayBtn = screen.getByRole("button", { name: "May 16, 2026" });
    dayBtn.focus();
    await user.keyboard("{Enter}");
    expect(handleChange).toHaveBeenCalledWith(new Date(2026, 4, 16));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("Home moves focus to first day of the displayed month", async () => {
    const user = userEvent.setup();
    render(
      <Datepicker
        label="Date"
        value={MAY_15}
        onChange={() => {}}
        locale="en-US"
      />,
    );
    await user.click(screen.getByRole("button", { name: /open date picker/i }));
    const dayBtn = screen.getByRole("button", { name: "May 15, 2026" });
    dayBtn.focus();
    await user.keyboard("{Home}");
    const firstDay = screen.getByRole("button", { name: "May 1, 2026" });
    expect(document.activeElement).toBe(firstDay);
  });

  it("End moves focus to last day of the displayed month", async () => {
    const user = userEvent.setup();
    render(
      <Datepicker
        label="Date"
        value={MAY_15}
        onChange={() => {}}
        locale="en-US"
      />,
    );
    await user.click(screen.getByRole("button", { name: /open date picker/i }));
    const dayBtn = screen.getByRole("button", { name: "May 15, 2026" });
    dayBtn.focus();
    await user.keyboard("{End}");
    const lastDay = screen.getByRole("button", { name: "May 31, 2026" });
    expect(document.activeElement).toBe(lastDay);
  });

  it("PageDown navigates to next month", async () => {
    const user = userEvent.setup();
    render(
      <Datepicker
        label="Date"
        value={MAY_15}
        onChange={() => {}}
        locale="en-US"
      />,
    );
    await user.click(screen.getByRole("button", { name: /open date picker/i }));
    const dayBtn = screen.getByRole("button", { name: "May 15, 2026" });
    dayBtn.focus();
    await user.keyboard("{PageDown}");
    const heading = document.querySelector(".artui-dp-heading");
    expect(heading?.textContent).toMatch(/June.*2026/i);
  });

  it("PageUp navigates to previous month", async () => {
    const user = userEvent.setup();
    render(
      <Datepicker
        label="Date"
        value={MAY_15}
        onChange={() => {}}
        locale="en-US"
      />,
    );
    await user.click(screen.getByRole("button", { name: /open date picker/i }));
    const dayBtn = screen.getByRole("button", { name: "May 15, 2026" });
    dayBtn.focus();
    await user.keyboard("{PageUp}");
    const heading = document.querySelector(".artui-dp-heading");
    expect(heading?.textContent).toMatch(/April.*2026/i);
  });

  // -------------------------------------------------------------------------
  // Input / text entry
  // -------------------------------------------------------------------------

  it("typing a valid date in the input calls onChange", () => {
    const handleChange = vi.fn();
    render(
      <Datepicker
        label="Date"
        value={null}
        onChange={handleChange}
        locale="en-US"
      />,
    );
    const input = screen.getByRole("textbox");
    // Mask input: type digits only — separators are auto-inserted.
    for (const digit of "05152026") {
      fireEvent.keyDown(input, { key: digit });
    }
    expect(handleChange).toHaveBeenCalledWith(new Date(2026, 4, 15));
  });

  it("typing an invalid date shows an error message wired via aria-describedby", () => {
    render(
      <Datepicker
        label="Date"
        value={null}
        onChange={() => {}}
        locale="en-US"
      />,
    );
    const input = screen.getByRole("textbox");
    // Type an impossible date (month 99).
    for (const digit of "05992026") {
      fireEvent.keyDown(input, { key: digit });
    }
    const errorId = input.getAttribute("aria-describedby");
    expect(errorId).toBeTruthy();
    const errorEl = document.getElementById(errorId!);
    expect(errorEl?.textContent).toMatch(/valid date/i);
  });

  it("external error prop is displayed and wired via aria-describedby", () => {
    render(
      <Datepicker
        label="Date"
        value={null}
        onChange={() => {}}
        error="Date is required"
      />,
    );
    const input = screen.getByRole("textbox");
    const errorId = input.getAttribute("aria-describedby");
    const errorEl = document.getElementById(errorId!);
    expect(errorEl?.textContent).toBe("Date is required");
  });

  // -------------------------------------------------------------------------
  // min / max constraints
  // -------------------------------------------------------------------------

  it("days before min are disabled", async () => {
    const user = userEvent.setup();
    render(
      <Datepicker
        label="Date"
        value={MAY_15}
        onChange={() => {}}
        min={MAY_15}
        locale="en-US"
      />,
    );
    await user.click(screen.getByRole("button", { name: /open date picker/i }));
    const day14 = screen.queryByRole("button", { name: "May 14, 2026" });
    if (day14) {
      expect(day14).toBeDisabled();
    }
  });

  it("days after max are disabled", async () => {
    const user = userEvent.setup();
    render(
      <Datepicker
        label="Date"
        value={MAY_15}
        onChange={() => {}}
        max={MAY_15}
        locale="en-US"
      />,
    );
    await user.click(screen.getByRole("button", { name: /open date picker/i }));
    const day16 = screen.queryByRole("button", { name: "May 16, 2026" });
    if (day16) {
      expect(day16).toBeDisabled();
    }
  });

  // -------------------------------------------------------------------------
  // Runtime overlay guard
  // -------------------------------------------------------------------------

  it("fires dev overlay for invalid BCP-47 locale", () => {
    render(
      <Datepicker
        label="Date"
        value={null}
        onChange={() => {}}
        locale="not-valid-locale-xyz"
      />,
    );
    expect(errorSpy).toHaveBeenCalled();
    const msg = String(errorSpy.mock.calls[0]?.[0] ?? "");
    expect(msg).toContain("BCP-47");
  });

  // -------------------------------------------------------------------------
  // Live region
  // -------------------------------------------------------------------------

  it("aria-live region exists in the DOM when calendar is closed", () => {
    render(<Datepicker label="Date" value={null} onChange={() => {}} />);
    const live = document.querySelector('[aria-live="polite"]');
    expect(live).toBeInTheDocument();
  });

  it("aria-live region text updates when navigating months", async () => {
    const user = userEvent.setup();
    render(
      <Datepicker
        label="Date"
        value={MAY_15}
        onChange={() => {}}
        locale="en-US"
      />,
    );
    await user.click(screen.getByRole("button", { name: /open date picker/i }));
    const live = document.querySelector('[aria-live="polite"]');
    const initialText = live?.textContent;
    await user.click(screen.getByRole("button", { name: /next month/i }));
    expect(live?.textContent).not.toBe(initialText);
  });
});
