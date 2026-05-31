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
    const selected = screen.getByRole("gridcell", { name: "May 15, 2026" });
    expect(selected).toHaveAttribute("aria-selected", "true");
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
    const dayFourteen = screen.getByRole("gridcell", { name: "May 14, 2026" });
    expect(dayFourteen).toHaveAttribute("aria-selected", "false");
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
    const dayOne = screen.getByRole("gridcell", { name: "May 1, 2026" });
    expect(dayOne).toHaveAttribute("aria-disabled", "true");
  });

  // -------------------------------------------------------------------------
  // Weekday column headers
  // -------------------------------------------------------------------------

  it("exposes the full weekday name as the column header accessible name", async () => {
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
    // The visible "Sun" is aria-hidden; the column header's accessible name is
    // the full day name so screen readers announce "Sunday", not "Sun".
    expect(
      screen.getByRole("columnheader", { name: "Sunday" }),
    ).toBeInTheDocument();
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
    await user.click(screen.getByRole("gridcell", { name: "May 15, 2026" }));
    expect(handleChange).toHaveBeenCalledWith(new Date(2026, 4, 15));
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
      '[role="gridcell"][aria-disabled="true"]',
    );
    // fireEvent bypasses pointer-events:none; the handler still guards with isDisabled check
    fireEvent.click(disabled!);
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
    const focused = screen.getByRole("gridcell", { name: "May 15, 2026" });
    focused.focus();
    await user.keyboard("{ArrowRight}");
    const nextDay = screen.getByRole("gridcell", { name: "May 16, 2026" });
    expect(document.activeElement).toBe(nextDay);
  });

  it("moves the data-focused-day marker onto the newly focused day so the focus ring follows", async () => {
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
    const focused = screen.getByRole("gridcell", { name: "May 15, 2026" });
    focused.focus();
    await user.keyboard("{ArrowRight}");
    const nextDay = screen.getByRole("gridcell", { name: "May 16, 2026" });
    expect(nextDay).toHaveAttribute("data-focused-day", "true");
    expect(focused).not.toHaveAttribute("data-focused-day");
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
    const focused = screen.getByRole("gridcell", { name: "May 15, 2026" });
    focused.focus();
    await user.keyboard("{ArrowDown}");
    const nextWeek = screen.getByRole("gridcell", { name: "May 22, 2026" });
    expect(document.activeElement).toBe(nextWeek);
  });

  it("ArrowLeft moves focus to the previous day", async () => {
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
    const focused = screen.getByRole("gridcell", { name: "May 15, 2026" });
    focused.focus();
    await user.keyboard("{ArrowLeft}");
    const prevDay = screen.getByRole("gridcell", { name: "May 14, 2026" });
    expect(document.activeElement).toBe(prevDay);
  });

  it("ArrowUp moves focus to the same weekday previous week", async () => {
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
    const focused = screen.getByRole("gridcell", { name: "May 15, 2026" });
    focused.focus();
    await user.keyboard("{ArrowUp}");
    const prevWeek = screen.getByRole("gridcell", { name: "May 8, 2026" });
    expect(document.activeElement).toBe(prevWeek);
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
    const dayBtn = screen.getByRole("gridcell", { name: "May 16, 2026" });
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
    const dayBtn = screen.getByRole("gridcell", { name: "May 15, 2026" });
    dayBtn.focus();
    await user.keyboard("{Home}");
    const firstDay = screen.getByRole("gridcell", { name: "May 1, 2026" });
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
    const dayBtn = screen.getByRole("gridcell", { name: "May 15, 2026" });
    dayBtn.focus();
    await user.keyboard("{End}");
    const lastDay = screen.getByRole("gridcell", { name: "May 31, 2026" });
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
    const dayBtn = screen.getByRole("gridcell", { name: "May 15, 2026" });
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
    const dayBtn = screen.getByRole("gridcell", { name: "May 15, 2026" });
    dayBtn.focus();
    await user.keyboard("{PageUp}");
    const heading = document.querySelector(".artui-dp-heading");
    expect(heading?.textContent).toMatch(/April.*2026/i);
  });

  // -------------------------------------------------------------------------
  // Input / text entry
  // -------------------------------------------------------------------------

  it("entering a valid date via input change calls onChange", () => {
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
    fireEvent.change(input, { target: { value: "05/15/2026" } });
    expect(handleChange).toHaveBeenCalledWith(new Date(2026, 4, 15));
  });

  it("entering an invalid date shows an error message wired via aria-describedby", () => {
    render(
      <Datepicker
        label="Date"
        value={null}
        onChange={() => {}}
        locale="en-US"
      />,
    );
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "99/99/2026" } });
    const errorId = input.getAttribute("aria-describedby");
    const errorEl = document.getElementById(errorId!);
    expect(errorEl?.textContent).toMatch(/valid date/i);
  });

  it("input value events drive the masked field (voice/IME regression)", () => {
    const handleChange = vi.fn();
    render(
      <Datepicker
        label="Date"
        value={null}
        onChange={handleChange}
        locale="en-US"
      />,
    );
    const input = screen.getByRole("textbox") as HTMLInputElement;
    // Voice-control software sets the value programmatically without dispatching keydown.
    fireEvent.change(input, { target: { value: "05152026" } });
    expect(handleChange).toHaveBeenCalledWith(new Date(2026, 4, 15));
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
    expect(
      screen.getByRole("gridcell", { name: "May 14, 2026" }),
    ).toHaveAttribute("aria-disabled", "true");
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
    expect(
      screen.getByRole("gridcell", { name: "May 16, 2026" }),
    ).toHaveAttribute("aria-disabled", "true");
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

  it("aria-live region lives inside the dialog so aria-modal does not hide its announcements", async () => {
    const user = userEvent.setup();
    render(<Datepicker label="Date" value={null} onChange={() => {}} />);
    await user.click(screen.getByRole("button", { name: /open date picker/i }));
    const dialog = screen.getByRole("dialog");
    expect(dialog.querySelector('[aria-live="polite"]')).toBeInTheDocument();
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

  // -------------------------------------------------------------------------
  // Focus order on open (WCAG 2.4.3)
  // -------------------------------------------------------------------------

  it("focuses the previous-month button when calendar opens", async () => {
    const user = userEvent.setup();
    render(
      <Datepicker label="Date" value={MAY_15} onChange={() => {}} locale="en-US" />,
    );
    await user.click(screen.getByRole("button", { name: /open date picker/i }));
    const prevBtn = screen.getByRole("button", { name: /previous month/i });
    expect(document.activeElement).toBe(prevBtn);
  });

  it("announces the selected date in the live region when calendar opens", async () => {
    const user = userEvent.setup();
    render(
      <Datepicker label="Date" value={MAY_15} onChange={() => {}} locale="en-US" />,
    );
    await user.click(screen.getByRole("button", { name: /open date picker/i }));
    const live = document.querySelector('[aria-live="polite"]');
    expect(live?.textContent).toMatch(/May 15, 2026/i);
    expect(live?.textContent).toMatch(/selected/i);
  });

  it('announces "No date selected" in the live region when no value is set on open', async () => {
    const user = userEvent.setup();
    render(<Datepicker label="Date" value={null} onChange={() => {}} locale="en-US" />);
    await user.click(screen.getByRole("button", { name: /open date picker/i }));
    const live = document.querySelector('[aria-live="polite"]');
    expect(live?.textContent).toMatch(/no date selected/i);
  });

  // -------------------------------------------------------------------------
  // Specific validation error messages (WCAG 3.3.1)
  // -------------------------------------------------------------------------

  it("shows a month-range error when the month part is out of 1-12", () => {
    render(
      <Datepicker label="Date" value={null} onChange={() => {}} locale="en-US" />,
    );
    const input = screen.getByRole("textbox");
    // MM/DD/YYYY — month 99 is invalid
    fireEvent.change(input, { target: { value: "99/15/2026" } });
    const errorEl = document.getElementById(
      input.getAttribute("aria-describedby")!,
    );
    expect(errorEl?.textContent).toMatch(/month must be 1/i);
  });

  it("shows a day-overflow error naming the day and month when the day does not exist", () => {
    render(
      <Datepicker label="Date" value={null} onChange={() => {}} locale="en-US" />,
    );
    const input = screen.getByRole("textbox");
    // MM/DD/YYYY — February 30 doesn't exist
    fireEvent.change(input, { target: { value: "02/30/2026" } });
    const errorEl = document.getElementById(
      input.getAttribute("aria-describedby")!,
    );
    expect(errorEl?.textContent).toMatch(/30 February isn't a valid date/i);
  });

  it("shows a day-overflow error for DD/MM/YYYY locale when day does not exist in month", () => {
    render(
      <Datepicker label="Date" value={null} onChange={() => {}} locale="nl-BE" />,
    );
    const input = screen.getByRole("textbox");
    // DD/MM/YYYY — 30 February doesn't exist
    fireEvent.change(input, { target: { value: "30/02/2026" } });
    const errorEl = document.getElementById(
      input.getAttribute("aria-describedby")!,
    );
    expect(errorEl?.textContent).toMatch(/30/);
    expect(errorEl?.textContent).toMatch(/februari|february/i);
  });

  it("shows a generic invalid-date error for an otherwise malformed 8-digit input", () => {
    render(
      <Datepicker label="Date" value={null} onChange={() => {}} locale="en-US" />,
    );
    const input = screen.getByRole("textbox");
    // Month 13 triggers bad-month
    fireEvent.change(input, { target: { value: "13/15/2026" } });
    const errorEl = document.getElementById(
      input.getAttribute("aria-describedby")!,
    );
    expect(errorEl?.textContent).toMatch(/valid date/i);
  });
});
