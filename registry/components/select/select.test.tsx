import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { __resetDevOverlayCache } from "../../lib/dev-overlay";

import { Select } from "./select";

// ---------------------------------------------------------------------------
// Helpers: multi mode
// ---------------------------------------------------------------------------

function BasicSelect({
  value,
  defaultValue,
  onValueChange = vi.fn(),
  open,
  onOpenChange,
  disabled,
}: {
  value?: readonly string[];
  defaultValue?: readonly string[];
  onValueChange?: (v: readonly string[]) => void;
  open?: boolean;
  onOpenChange?: (o: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <Select
      multiple
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      open={open}
      onOpenChange={onOpenChange}
      disabled={disabled}
    >
      <Select.Control aria-label="Countries" />
      <Select.Content>
        <Select.Option value="be">Belgium</Select.Option>
        <Select.Option value="nl">Netherlands</Select.Option>
        <Select.Option value="fr" disabled>
          France
        </Select.Option>
      </Select.Content>
    </Select>
  );
}

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

describe("Select", () => {
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
  // AC5: trigger aria-haspopup="listbox"
  // -------------------------------------------------------------------------

  it("AC5: trigger has aria-haspopup=listbox", () => {
    render(<BasicSelect />);
    expect(screen.getByRole("button", { name: "Countries" })).toHaveAttribute(
      "aria-haspopup",
      "listbox",
    );
  });

  // -------------------------------------------------------------------------
  // AC6: trigger aria-expanded
  // -------------------------------------------------------------------------

  it("AC6: trigger has aria-expanded=false when listbox is closed", () => {
    render(<BasicSelect />);
    expect(screen.getByRole("button", { name: "Countries" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("AC6: trigger has aria-expanded=true when listbox is open", async () => {
    const user = userEvent.setup();
    render(<BasicSelect />);
    await user.click(screen.getByRole("button", { name: "Countries" }));
    expect(screen.getByRole("button", { name: "Countries" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  // -------------------------------------------------------------------------
  // AC7: listbox role + aria-multiselectable
  // -------------------------------------------------------------------------

  it("AC7: listbox container has role=listbox and aria-multiselectable=true", async () => {
    const user = userEvent.setup();
    render(<BasicSelect />);
    await user.click(screen.getByRole("button", { name: "Countries" }));
    const listbox = screen.getByRole("listbox");
    expect(listbox).toHaveAttribute("aria-multiselectable", "true");
  });

  // -------------------------------------------------------------------------
  // AC8: each option has role=option + aria-selected
  // -------------------------------------------------------------------------

  it("AC8: each option has role=option", async () => {
    const user = userEvent.setup();
    render(<BasicSelect />);
    await user.click(screen.getByRole("button", { name: "Countries" }));
    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(3);
  });

  it("AC8: unselected option has aria-selected=false", async () => {
    const user = userEvent.setup();
    render(<BasicSelect />);
    await user.click(screen.getByRole("button", { name: "Countries" }));
    expect(screen.getByRole("option", { name: /Belgium/ })).toHaveAttribute(
      "aria-selected",
      "false",
    );
  });

  it("AC8: selected option has aria-selected=true", async () => {
    const user = userEvent.setup();
    render(<BasicSelect defaultValue={["be"]} />);
    await user.click(screen.getByRole("button", { name: "Countries" }));
    expect(screen.getByRole("option", { name: /Belgium/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("AC8: aria-selected is always present (true or false), never omitted", async () => {
    const user = userEvent.setup();
    render(<BasicSelect />);
    await user.click(screen.getByRole("button", { name: "Countries" }));
    const options = screen.getAllByRole("option");
    for (const opt of options) {
      expect(opt.hasAttribute("aria-selected")).toBe(true);
    }
  });

  // -------------------------------------------------------------------------
  // AC9: chip remove buttons have accessible names
  // -------------------------------------------------------------------------

  it("AC9: remove button has aria-label naming the option being removed", () => {
    render(<BasicSelect defaultValue={["be"]} />);
    expect(screen.getByRole("button", { name: "Remove Belgium" })).toBeInTheDocument();
  });

  it("AC9: remove button label updates when selection changes", () => {
    render(<BasicSelect defaultValue={["be", "nl"]} />);
    expect(screen.getByRole("button", { name: "Remove Belgium" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Remove Netherlands" })).toBeInTheDocument();
  });

  it("AC9: removeLabel prop on Control customises the remove button accessible name", () => {
    render(
      <Select multiple defaultValue={["be"]} onValueChange={vi.fn()}>
        <Select.Control
          aria-label="Pays"
          removeLabel={(label) => `Supprimer ${label}`}
        />
        <Select.Content>
          <Select.Option value="be">Belgium</Select.Option>
        </Select.Content>
      </Select>,
    );
    expect(screen.getByRole("button", { name: "Supprimer Belgium" })).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // AC1: selection communicated outside the listbox
  // -------------------------------------------------------------------------

  it("AC1: selected chips are rendered in the control when listbox is closed", () => {
    render(<BasicSelect defaultValue={["be"]} />);
    const tagLabel = document.querySelector(".artui-select-tag-label");
    expect(tagLabel?.textContent).toBe("Belgium");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("AC1: aria-live region receives announcement when option is toggled on", async () => {
    const user = userEvent.setup();
    render(<BasicSelect />);
    await user.click(screen.getByRole("button", { name: "Countries" }));
    await user.click(screen.getByRole("option", { name: /Belgium/ }));
    const live = document.querySelector('[aria-live="polite"]');
    expect(live?.textContent).toMatch(/Belgium added/);
  });

  it("AC1: field shows placeholder when nothing is selected", () => {
    render(<BasicSelect />);
    expect(document.querySelector(".artui-select-field")).toHaveTextContent(
      "Select options",
    );
  });

  it("AC1: placeholder is hidden when chips are present", () => {
    render(<BasicSelect defaultValue={["be", "nl"]} />);
    expect(document.querySelector(".artui-select-field")).not.toHaveTextContent(
      "Select options",
    );
  });

  // -------------------------------------------------------------------------
  // AC2: keyboard: Arrow Up/Down + Space/Enter toggle without closing
  // -------------------------------------------------------------------------

  it("AC2: ArrowDown moves focus to next option", async () => {
    const user = userEvent.setup();
    render(<BasicSelect />);
    await user.click(screen.getByRole("button", { name: "Countries" }));
    await user.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(
      screen.getByRole("option", { name: /Netherlands/ }),
    );
  });

  it("AC2: ArrowUp moves focus to previous option", async () => {
    const user = userEvent.setup();
    render(<BasicSelect />);
    await user.click(screen.getByRole("button", { name: "Countries" }));
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{ArrowUp}");
    expect(document.activeElement).toBe(
      screen.getByRole("option", { name: /Belgium/ }),
    );
  });

  it("AC2: ArrowDown does not wrap at last focusable option", async () => {
    const user = userEvent.setup();
    render(<BasicSelect />);
    await user.click(screen.getByRole("button", { name: "Countries" }));
    const netherlands = screen.getByRole("option", { name: /Netherlands/ });
    netherlands.focus();
    await user.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(netherlands);
  });

  it("AC2: ArrowUp does not wrap at first option", async () => {
    const user = userEvent.setup();
    render(<BasicSelect />);
    await user.click(screen.getByRole("button", { name: "Countries" }));
    const options = screen.getAllByRole("option");
    options[0]?.focus();
    await user.keyboard("{ArrowUp}");
    expect(document.activeElement).toBe(options[0]);
  });

  it("AC2: Space toggles selection of focused option and keeps listbox open", async () => {
    const user = userEvent.setup();
    render(<BasicSelect />);
    await user.click(screen.getByRole("button", { name: "Countries" }));
    screen.getByRole("option", { name: /Belgium/ }).focus();
    await user.keyboard(" ");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /Belgium/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("AC2: Enter toggles selection of focused option and keeps listbox open", async () => {
    const user = userEvent.setup();
    render(<BasicSelect />);
    await user.click(screen.getByRole("button", { name: "Countries" }));
    screen.getByRole("option", { name: /Belgium/ }).focus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /Belgium/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("AC2: Space deselects a selected option", async () => {
    const user = userEvent.setup();
    render(<BasicSelect defaultValue={["be"]} />);
    await user.click(screen.getByRole("button", { name: "Countries" }));
    screen.getByRole("option", { name: /Belgium/ }).focus();
    await user.keyboard(" ");
    expect(screen.getByRole("option", { name: /Belgium/ })).toHaveAttribute(
      "aria-selected",
      "false",
    );
  });

  // -------------------------------------------------------------------------
  // AC3: Escape closes + returns focus to trigger
  // -------------------------------------------------------------------------

  it("AC3: Escape closes the listbox", async () => {
    const user = userEvent.setup();
    render(<BasicSelect />);
    await user.click(screen.getByRole("button", { name: "Countries" }));
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("AC3: Escape returns focus to the trigger button", async () => {
    const user = userEvent.setup();
    render(<BasicSelect />);
    const trigger = screen.getByRole("button", { name: "Countries" });
    await user.click(trigger);
    await user.keyboard("{Escape}");
    expect(document.activeElement).toBe(trigger);
  });

  // -------------------------------------------------------------------------
  // AC4: visible focus indicators (structural check via CSS classes)
  // -------------------------------------------------------------------------

  it("AC4: trigger has artui-select-trigger class for styling focus-visible", () => {
    render(<BasicSelect />);
    expect(screen.getByRole("button", { name: "Countries" })).toHaveClass(
      "artui-select-trigger",
    );
  });

  it("AC4: control field has artui-select-control class", () => {
    render(<BasicSelect />);
    expect(document.querySelector(".artui-select-control")).toBeInTheDocument();
  });

  it("AC4: options have artui-select-option class for styling focus-visible", async () => {
    const user = userEvent.setup();
    render(<BasicSelect />);
    await user.click(screen.getByRole("button", { name: "Countries" }));
    const options = screen.getAllByRole("option");
    expect(options[0]).toHaveClass("artui-select-option");
  });

  it("AC4: tag remove button has artui-select-tag-remove class for styling focus-visible", () => {
    render(<BasicSelect defaultValue={["be"]} />);
    expect(screen.getByRole("button", { name: "Remove Belgium" })).toHaveClass(
      "artui-select-tag-remove",
    );
  });

  // -------------------------------------------------------------------------
  // Open / close lifecycle
  // -------------------------------------------------------------------------

  it("does not render listbox when closed", () => {
    render(<BasicSelect />);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("shows listbox on trigger click", async () => {
    const user = userEvent.setup();
    render(<BasicSelect />);
    await user.click(screen.getByRole("button", { name: "Countries" }));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("closes listbox on second trigger click", async () => {
    const user = userEvent.setup();
    render(<BasicSelect />);
    await user.click(screen.getByRole("button", { name: "Countries" }));
    await user.click(screen.getByRole("button", { name: "Countries" }));
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("closes listbox when the field is clicked again", async () => {
    const user = userEvent.setup();
    render(<BasicSelect />);
    const field = document.querySelector(".artui-select-field") as HTMLElement;
    await user.click(field);
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    await user.click(field);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("opens listbox with ArrowDown on trigger", async () => {
    const user = userEvent.setup();
    render(<BasicSelect />);
    screen.getByRole("button", { name: "Countries" }).focus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("opens listbox with ArrowUp on trigger", async () => {
    const user = userEvent.setup();
    render(<BasicSelect />);
    screen.getByRole("button", { name: "Countries" }).focus();
    await user.keyboard("{ArrowUp}");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("closes listbox when clicking outside", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <button type="button">Outside</button>
        <BasicSelect />
      </div>,
    );
    await user.click(screen.getByRole("button", { name: "Countries" }));
    await user.click(screen.getByRole("button", { name: "Outside" }));
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("keeps the listbox open when the window scrolls", async () => {
    const user = userEvent.setup();
    render(<BasicSelect />);
    await user.click(screen.getByRole("button", { name: "Countries" }));
    fireEvent.scroll(window);
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("renders the open listbox as a fixed overlay so the page does not reflow", async () => {
    const user = userEvent.setup();
    render(<BasicSelect />);
    await user.click(screen.getByRole("button", { name: "Countries" }));
    expect(screen.getByRole("listbox")).toHaveStyle({ position: "fixed" });
  });

  it("places the clear-all button before the trigger in tab order", async () => {
    const user = userEvent.setup();
    render(
      <Select multiple defaultValue={["be"]} onValueChange={vi.fn()}>
        <Select.Control aria-label="Countries" showClearAll />
        <Select.Content>
          <Select.Option value="be">Belgium</Select.Option>
          <Select.Option value="nl">Netherlands</Select.Option>
        </Select.Content>
      </Select>,
    );
    screen.getByRole("button", { name: "Clear all selections" }).focus();
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Countries" }));
  });

  it("keeps the listbox open when Enter is pressed on the trigger while open", async () => {
    const user = userEvent.setup();
    render(<BasicSelect />);
    const trigger = screen.getByRole("button", { name: "Countries" });
    await user.click(trigger);
    fireEvent.keyDown(trigger, { key: "Enter" });
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("keeps the listbox open when Space is pressed on the trigger while open", async () => {
    const user = userEvent.setup();
    render(<BasicSelect />);
    const trigger = screen.getByRole("button", { name: "Countries" });
    await user.click(trigger);
    fireEvent.keyDown(trigger, { key: " " });
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("returns focus to the trigger when a non-Escape close orphans focus", () => {
    const { rerender } = render(<BasicSelect open />);
    screen.getAllByRole("option")[0]?.focus();
    rerender(<BasicSelect open={false} />);
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Countries" }));
  });

  // -------------------------------------------------------------------------
  // Focus management
  // -------------------------------------------------------------------------

  it("moves focus to the first option when listbox opens", async () => {
    const user = userEvent.setup();
    render(<BasicSelect />);
    await user.click(screen.getByRole("button", { name: "Countries" }));
    const options = screen.getAllByRole("option");
    expect(document.activeElement).toBe(options[0]);
  });

  it("removes last chip with Backspace and focuses trigger when selection becomes empty", () => {
    render(<BasicSelect defaultValue={["be"]} />);
    const trigger = screen.getByRole("button", { name: "Countries" });
    fireEvent.keyDown(trigger, { key: "Backspace" });
    expect(document.activeElement).toBe(trigger);
  });

  // -------------------------------------------------------------------------
  // Home / End keys
  // -------------------------------------------------------------------------

  it("Home moves focus to first option", async () => {
    const user = userEvent.setup();
    render(<BasicSelect />);
    await user.click(screen.getByRole("button", { name: "Countries" }));
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{Home}");
    expect(document.activeElement).toBe(screen.getAllByRole("option")[0]);
  });

  it("End moves focus to last focusable option", async () => {
    const user = userEvent.setup();
    render(<BasicSelect />);
    await user.click(screen.getByRole("button", { name: "Countries" }));
    await user.keyboard("{End}");
    // Netherlands is the last focusable option; France is disabled and excluded.
    expect(document.activeElement).toBe(
      screen.getByRole("option", { name: /Netherlands/ }),
    );
  });

  // -------------------------------------------------------------------------
  // Typeahead
  // -------------------------------------------------------------------------

  it("typeahead jumps to first option matching typed character", async () => {
    const user = userEvent.setup();
    render(<BasicSelect />);
    await user.click(screen.getByRole("button", { name: "Countries" }));
    await user.keyboard("n");
    expect(document.activeElement).toBe(
      screen.getByRole("option", { name: /Netherlands/ }),
    );
  });

  // -------------------------------------------------------------------------
  // Disabled option
  // -------------------------------------------------------------------------

  it("disabled option has aria-disabled=true", async () => {
    const user = userEvent.setup();
    render(<BasicSelect />);
    await user.click(screen.getByRole("button", { name: "Countries" }));
    expect(screen.getByRole("option", { name: /France/ })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });

  it("disabled option click does not update selection", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<BasicSelect onValueChange={onValueChange} />);
    await user.click(screen.getByRole("button", { name: "Countries" }));
    await user.click(screen.getByRole("option", { name: /France/ }));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("ArrowDown skips disabled options in the focusable list", async () => {
    const user = userEvent.setup();
    render(<BasicSelect />);
    await user.click(screen.getByRole("button", { name: "Countries" }));
    await user.keyboard("{ArrowDown}"); // Belgium -> Netherlands
    await user.keyboard("{ArrowDown}"); // Netherlands -> Netherlands (no-wrap; France excluded)
    expect(document.activeElement).toBe(
      screen.getByRole("option", { name: /Netherlands/ }),
    );
  });

  // -------------------------------------------------------------------------
  // Backspace removes last chip
  // -------------------------------------------------------------------------

  it("Backspace on trigger removes last selected chip via onValueChange", () => {
    const onValueChange = vi.fn();
    render(
      <BasicSelect defaultValue={["be", "nl"]} onValueChange={onValueChange} />,
    );
    fireEvent.keyDown(screen.getByRole("button", { name: "Countries" }), {
      key: "Backspace",
    });
    expect(onValueChange).toHaveBeenCalledWith(["be"]);
  });

  it("Backspace does nothing when no chips are selected", () => {
    const onValueChange = vi.fn();
    render(<BasicSelect onValueChange={onValueChange} />);
    fireEvent.keyDown(screen.getByRole("button", { name: "Countries" }), {
      key: "Backspace",
    });
    expect(onValueChange).not.toHaveBeenCalled();
  });

  // -------------------------------------------------------------------------
  // Chip remove button
  // -------------------------------------------------------------------------

  it("clicking a chip remove button calls onValueChange without that value", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<BasicSelect defaultValue={["be", "nl"]} onValueChange={onValueChange} />);
    await user.click(screen.getByRole("button", { name: "Remove Belgium" }));
    expect(onValueChange).toHaveBeenCalledWith(["nl"]);
  });

  it("chip remove button is disabled when the root is disabled", () => {
    render(<BasicSelect defaultValue={["be"]} disabled />);
    expect(screen.getByRole("button", { name: "Remove Belgium" })).toBeDisabled();
  });

  // -------------------------------------------------------------------------
  // Disabled root
  // -------------------------------------------------------------------------

  it("trigger is disabled when root disabled prop is true", () => {
    render(<BasicSelect disabled />);
    expect(screen.getByRole("button", { name: "Countries" })).toBeDisabled();
  });

  it("disabled trigger click does not open listbox", async () => {
    const user = userEvent.setup();
    render(<BasicSelect disabled />);
    await user.click(screen.getByRole("button", { name: "Countries" }));
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Selection state
  // -------------------------------------------------------------------------

  it("onValueChange is called with toggled-on value", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<BasicSelect onValueChange={onValueChange} />);
    await user.click(screen.getByRole("button", { name: "Countries" }));
    await user.click(screen.getByRole("option", { name: /Belgium/ }));
    expect(onValueChange).toHaveBeenCalledWith(["be"]);
  });

  it("onValueChange is called with toggled-off value removed", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<BasicSelect defaultValue={["be"]} onValueChange={onValueChange} />);
    await user.click(screen.getByRole("button", { name: "Countries" }));
    await user.click(screen.getByRole("option", { name: /Belgium/ }));
    expect(onValueChange).toHaveBeenCalledWith([]);
  });

  it("multiple options can be selected simultaneously", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<BasicSelect onValueChange={onValueChange} />);
    await user.click(screen.getByRole("button", { name: "Countries" }));
    await user.click(screen.getByRole("option", { name: /Belgium/ }));
    await user.click(screen.getByRole("option", { name: /Netherlands/ }));
    expect(onValueChange).toHaveBeenLastCalledWith(["be", "nl"]);
  });

  // -------------------------------------------------------------------------
  // Controlled mode
  // -------------------------------------------------------------------------

  it("reflects controlled value as aria-selected on options", async () => {
    const user = userEvent.setup();
    render(<BasicSelect value={["nl"]} onValueChange={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: "Countries" }));
    expect(screen.getByRole("option", { name: /Netherlands/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("option", { name: /Belgium/ })).toHaveAttribute(
      "aria-selected",
      "false",
    );
  });

  it("calls onValueChange when selection is toggled in controlled mode", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<BasicSelect value={["nl"]} onValueChange={onValueChange} />);
    await user.click(screen.getByRole("button", { name: "Countries" }));
    await user.click(screen.getByRole("option", { name: /Belgium/ }));
    expect(onValueChange).toHaveBeenCalledWith(["nl", "be"]);
  });

  it("controlled open=true renders the listbox immediately", () => {
    render(<BasicSelect open={true} onOpenChange={vi.fn()} />);
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("calls onOpenChange(false) on Escape in controlled mode", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<BasicSelect open={true} onOpenChange={onOpenChange} />);
    const options = screen.getAllByRole("option");
    options[0]?.focus();
    await user.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  // -------------------------------------------------------------------------
  // aria-controls wiring
  // -------------------------------------------------------------------------

  it("trigger aria-controls points to the listbox element", async () => {
    const user = userEvent.setup();
    render(<BasicSelect />);
    await user.click(screen.getByRole("button", { name: "Countries" }));
    const trigger = screen.getByRole("button", { name: "Countries" });
    const listboxId = trigger.getAttribute("aria-controls");
    expect(document.getElementById(listboxId!)).toHaveAttribute("role", "listbox");
  });

  // -------------------------------------------------------------------------
  // aria-labelledby on listbox
  // -------------------------------------------------------------------------

  it("listbox is aria-labelledby the trigger", async () => {
    const user = userEvent.setup();
    render(<BasicSelect />);
    await user.click(screen.getByRole("button", { name: "Countries" }));
    const trigger = screen.getByRole("button", { name: "Countries" });
    const listbox = screen.getByRole("listbox");
    expect(listbox).toHaveAttribute("aria-labelledby", trigger.id);
  });

  // -------------------------------------------------------------------------
  // CSS classes
  // -------------------------------------------------------------------------

  it("listbox has artui-select-content class", async () => {
    const user = userEvent.setup();
    render(<BasicSelect />);
    await user.click(screen.getByRole("button", { name: "Countries" }));
    expect(screen.getByRole("listbox")).toHaveClass("artui-select-content");
  });

  it("selected option has artui-select-option--selected class", async () => {
    const user = userEvent.setup();
    render(<BasicSelect defaultValue={["be"]} />);
    await user.click(screen.getByRole("button", { name: "Countries" }));
    expect(screen.getByRole("option", { name: /Belgium/ })).toHaveClass(
      "artui-select-option--selected",
    );
  });

  it("unselected option does not have artui-select-option--selected class", async () => {
    const user = userEvent.setup();
    render(<BasicSelect />);
    await user.click(screen.getByRole("button", { name: "Countries" }));
    expect(screen.getByRole("option", { name: /Belgium/ })).not.toHaveClass(
      "artui-select-option--selected",
    );
  });

  // -------------------------------------------------------------------------
  // Dev overlays
  // -------------------------------------------------------------------------

  it("Select:empty-content overlay fires for empty Content", () => {
    render(
      <Select multiple onValueChange={vi.fn()}>
        <Select.Control aria-label="Test" />
        <Select.Content>{false}</Select.Content>
      </Select>,
    );
    expect(errorSpy).toHaveBeenCalled();
    const msg = String(errorSpy.mock.calls[0]?.[0] ?? "");
    expect(msg).toMatch(/Select\.Content/);
  });

  it("Select:empty-content overlay includes WCAG 1.3.1", () => {
    render(
      <Select multiple onValueChange={vi.fn()}>
        <Select.Control aria-label="Test" />
        <Select.Content>{false}</Select.Content>
      </Select>,
    );
    const msg = String(errorSpy.mock.calls[0]?.[0] ?? "");
    expect(msg).toMatch(/1\.3\.1/);
  });

  it("Select:empty-option-label overlay fires for whitespace-only label", () => {
    render(
      <Select multiple onValueChange={vi.fn()}>
        <Select.Control aria-label="Test" />
        <Select.Content>
          <Select.Option value="empty">{"  "}</Select.Option>
        </Select.Content>
      </Select>,
    );
    const hit = errorSpy.mock.calls.find((c: unknown[]) =>
      String(c[0]).includes("Select.Option") && String(c[0]).includes('"empty"'),
    );
    expect(hit).toBeDefined();
  });

  it("Select:empty-option-label overlay includes WCAG 1.3.1", () => {
    render(
      <Select multiple onValueChange={vi.fn()}>
        <Select.Control aria-label="Test" />
        <Select.Content>
          <Select.Option value="empty">{"  "}</Select.Option>
        </Select.Content>
      </Select>,
    );
    const hit = errorSpy.mock.calls.find((c: unknown[]) =>
      String(c[0]).includes("1.3.1"),
    );
    expect(hit).toBeDefined();
  });

  it("Select:duplicate-value guard fires console.error for duplicate option values", async () => {
    render(
      <Select multiple onValueChange={vi.fn()}>
        <Select.Control aria-label="Test" />
        <Select.Content>
          <Select.Option value="x">Option X</Select.Option>
          <Select.Option value="x">Option X duplicate</Select.Option>
        </Select.Content>
      </Select>,
    );
    await new Promise((resolve) => setTimeout(resolve, 0));
    const hit = errorSpy.mock.calls.find((c: unknown[]) =>
      String(c[0]).includes("Select:duplicate-value"),
    );
    expect(hit).toBeDefined();
  });

  it("Select:duplicate-value guard message includes WCAG 4.1.2", async () => {
    render(
      <Select multiple onValueChange={vi.fn()}>
        <Select.Control aria-label="Test" />
        <Select.Content>
          <Select.Option value="dup">A</Select.Option>
          <Select.Option value="dup">B</Select.Option>
        </Select.Content>
      </Select>,
    );
    await new Promise((resolve) => setTimeout(resolve, 0));
    const hit = errorSpy.mock.calls.find((c: unknown[]) =>
      String(c[0]).includes("4.1.2") && String(c[0]).includes("duplicate"),
    );
    expect(hit).toBeDefined();
  });

  it("empty-option-label overlay renders a visible error marker", () => {
    const { container } = render(
      <Select multiple onValueChange={vi.fn()}>
        <Select.Control aria-label="Test" />
        <Select.Content>
          <Select.Option value="empty">{""}</Select.Option>
        </Select.Content>
      </Select>,
    );
    expect(container.querySelector('span[aria-hidden="true"]')).toBeInTheDocument();
  });

  it("empty-content overlay renders a visible error marker", () => {
    const { container } = render(
      <Select multiple onValueChange={vi.fn()}>
        <Select.Control aria-label="Test" />
        <Select.Content>{false}</Select.Content>
      </Select>,
    );
    expect(container.querySelector('span[aria-hidden="true"]')).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Uncontrolled / defaultValue
  // -------------------------------------------------------------------------

  it("defaultValue initializes selection in uncontrolled mode", () => {
    render(<BasicSelect defaultValue={["nl"]} />);
    expect(screen.getByRole("button", { name: "Remove Netherlands" })).toBeInTheDocument();
  });

  it("selection updates in uncontrolled mode without external state", async () => {
    const user = userEvent.setup();
    render(<BasicSelect />);
    await user.click(screen.getByRole("button", { name: "Countries" }));
    await user.click(screen.getByRole("option", { name: /Belgium/ }));
    expect(screen.getByRole("button", { name: "Remove Belgium" })).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Control accessible name variants
  // -------------------------------------------------------------------------

  it("Control accepts aria-labelledby for accessible name", () => {
    render(
      <div>
        <span id="lbl">Select countries</span>
        <Select multiple onValueChange={vi.fn()}>
          <Select.Control aria-labelledby="lbl" />
          <Select.Content>
            <Select.Option value="be">Belgium</Select.Option>
          </Select.Content>
        </Select>
      </div>,
    );
    expect(screen.getByRole("button", { name: "Select countries" })).toBeInTheDocument();
  });

  it("Control accepts children as accessible name", () => {
    render(
      <Select multiple onValueChange={vi.fn()}>
        <Select.Control>Pick countries</Select.Control>
        <Select.Content>
          <Select.Option value="be">Belgium</Select.Option>
        </Select.Content>
      </Select>,
    );
    expect(screen.getByRole("button", { name: "Pick countries" })).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Live region announces deselection
  // -------------------------------------------------------------------------

  it("live region announces when a chip is removed via remove button", async () => {
    const user = userEvent.setup();
    render(<BasicSelect defaultValue={["be"]} />);
    await user.click(screen.getByRole("button", { name: "Remove Belgium" }));
    const live = document.querySelector('[aria-live="polite"]');
    expect(live?.textContent).toMatch(/Belgium removed/);
  });

  it("live region announces when Backspace removes last chip", () => {
    render(<BasicSelect defaultValue={["be"]} />);
    fireEvent.keyDown(screen.getByRole("button", { name: "Countries" }), {
      key: "Backspace",
    });
    const live = document.querySelector('[aria-live="polite"]');
    expect(live?.textContent).toMatch(/Belgium removed/);
  });

  // -------------------------------------------------------------------------
  // Single mode
  // -------------------------------------------------------------------------

  it("single mode renders a native <select> element", () => {
    render(
      <Select aria-label="Country" onValueChange={vi.fn()}>
        <Select.Option value="be">Belgium</Select.Option>
        <Select.Option value="nl">Netherlands</Select.Option>
      </Select>,
    );
    expect(screen.getByRole("combobox", { name: "Country" })).toBeInTheDocument();
  });

  it("single mode: aria-label is forwarded to the native select", () => {
    render(
      <Select aria-label="Country" onValueChange={vi.fn()}>
        <Select.Option value="be">Belgium</Select.Option>
      </Select>,
    );
    const select = screen.getByRole("combobox", { name: "Country" });
    expect(select).toHaveAttribute("aria-label", "Country");
  });

  it("single mode: aria-labelledby is forwarded to the native select", () => {
    render(
      <div>
        <span id="country-label">Country</span>
        <Select aria-labelledby="country-label" onValueChange={vi.fn()}>
          <Select.Option value="be">Belgium</Select.Option>
        </Select>
      </div>,
    );
    const select = screen.getByRole("combobox", { name: "Country" });
    expect(select).toHaveAttribute("aria-labelledby", "country-label");
  });

  it("single mode: selecting an option calls onValueChange with a string", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Select aria-label="Country" onValueChange={onValueChange}>
        <Select.Option value="be">Belgium</Select.Option>
        <Select.Option value="nl">Netherlands</Select.Option>
      </Select>,
    );
    await user.selectOptions(screen.getByRole("combobox", { name: "Country" }), "nl");
    expect(onValueChange).toHaveBeenCalledWith("nl");
  });

  it("single mode: controlled value prop reflects selection on the native select", () => {
    render(
      <Select aria-label="Country" value="nl" onValueChange={vi.fn()}>
        <Select.Option value="be">Belgium</Select.Option>
        <Select.Option value="nl">Netherlands</Select.Option>
      </Select>,
    );
    const select = screen.getByRole("combobox", { name: "Country" }) as HTMLSelectElement;
    expect(select.value).toBe("nl");
  });

  it("single mode: name prop is forwarded to the native select", () => {
    render(
      <Select aria-label="Country" name="country" onValueChange={vi.fn()}>
        <Select.Option value="be">Belgium</Select.Option>
      </Select>,
    );
    expect(screen.getByRole("combobox", { name: "Country" })).toHaveAttribute("name", "country");
  });

  it("single mode: disabled prop disables the native select", () => {
    render(
      <Select aria-label="Country" disabled onValueChange={vi.fn()}>
        <Select.Option value="be">Belgium</Select.Option>
      </Select>,
    );
    expect(screen.getByRole("combobox", { name: "Country" })).toBeDisabled();
  });

  it("single mode: defaultValue initializes the native select selection", () => {
    render(
      <Select aria-label="Country" defaultValue="nl" onValueChange={vi.fn()}>
        <Select.Option value="be">Belgium</Select.Option>
        <Select.Option value="nl">Netherlands</Select.Option>
      </Select>,
    );
    const select = screen.getByRole("combobox", { name: "Country" }) as HTMLSelectElement;
    expect(select.value).toBe("nl");
  });

  // -------------------------------------------------------------------------
  // Group: multi mode
  // -------------------------------------------------------------------------

  it("Group renders with role=group in the custom panel", async () => {
    const user = userEvent.setup();
    render(
      <Select multiple onValueChange={vi.fn()}>
        <Select.Control aria-label="Countries" />
        <Select.Content>
          <Select.Group label="Benelux">
            <Select.Option value="be">Belgium</Select.Option>
          </Select.Group>
        </Select.Content>
      </Select>,
    );
    await user.click(screen.getByRole("button", { name: "Countries" }));
    expect(screen.getByRole("group")).toBeInTheDocument();
  });

  it("Group has aria-label matching the label prop", async () => {
    const user = userEvent.setup();
    render(
      <Select multiple onValueChange={vi.fn()}>
        <Select.Control aria-label="Countries" />
        <Select.Content>
          <Select.Group label="Benelux">
            <Select.Option value="be">Belgium</Select.Option>
          </Select.Group>
        </Select.Content>
      </Select>,
    );
    await user.click(screen.getByRole("button", { name: "Countries" }));
    expect(screen.getByRole("group")).toHaveAttribute("aria-label", "Benelux");
  });

  it("Group header label text is visible in the panel", async () => {
    const user = userEvent.setup();
    render(
      <Select multiple onValueChange={vi.fn()}>
        <Select.Control aria-label="Countries" />
        <Select.Content>
          <Select.Group label="Benelux">
            <Select.Option value="be">Belgium</Select.Option>
          </Select.Group>
        </Select.Content>
      </Select>,
    );
    await user.click(screen.getByRole("button", { name: "Countries" }));
    const header = document.querySelector(".artui-select-group-label");
    expect(header?.textContent).toBe("Benelux");
  });

  it("Group header is aria-hidden=true", async () => {
    const user = userEvent.setup();
    render(
      <Select multiple onValueChange={vi.fn()}>
        <Select.Control aria-label="Countries" />
        <Select.Content>
          <Select.Group label="Benelux">
            <Select.Option value="be">Belgium</Select.Option>
          </Select.Group>
        </Select.Content>
      </Select>,
    );
    await user.click(screen.getByRole("button", { name: "Countries" }));
    const header = document.querySelector(".artui-select-group-label");
    expect(header).toHaveAttribute("aria-hidden", "true");
  });

  it("Options inside a disabled Group have a disabled optgroup in the native select", () => {
    render(
      <Select multiple onValueChange={vi.fn()}>
        <Select.Control aria-label="Countries" />
        <Select.Content>
          <Select.Group label="Benelux" disabled>
            <Select.Option value="be">Belgium</Select.Option>
            <Select.Option value="nl">Netherlands</Select.Option>
          </Select.Group>
        </Select.Content>
      </Select>,
    );
    const optgroup = document.querySelector("optgroup[label='Benelux']");
    expect(optgroup).toHaveAttribute("disabled");
  });

  it("Group renders as optgroup in the native hidden select", () => {
    render(
      <Select multiple onValueChange={vi.fn()}>
        <Select.Control aria-label="Countries" />
        <Select.Content>
          <Select.Group label="Benelux">
            <Select.Option value="be">Belgium</Select.Option>
          </Select.Group>
        </Select.Content>
      </Select>,
    );
    const optgroup = document.querySelector("optgroup[label='Benelux']");
    expect(optgroup).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Clear-all: multi mode (via Control)
  // -------------------------------------------------------------------------

  it("clear-all button is not rendered when showClearAll is absent", () => {
    render(<BasicSelect defaultValue={["be"]} />);
    expect(screen.queryByRole("button", { name: "Clear all selections" })).not.toBeInTheDocument();
  });

  it("clear-all button is not rendered when showClearAll=true but nothing is selected", () => {
    render(
      <Select multiple onValueChange={vi.fn()}>
        <Select.Control aria-label="Countries" showClearAll />
        <Select.Content>
          <Select.Option value="be">Belgium</Select.Option>
        </Select.Content>
      </Select>,
    );
    expect(screen.queryByRole("button", { name: "Clear all selections" })).not.toBeInTheDocument();
  });

  it("clear-all button is rendered when showClearAll=true and selection exists", () => {
    render(
      <Select multiple defaultValue={["be"]} onValueChange={vi.fn()}>
        <Select.Control aria-label="Countries" showClearAll />
        <Select.Content>
          <Select.Option value="be">Belgium</Select.Option>
        </Select.Content>
      </Select>,
    );
    expect(screen.getByRole("button", { name: "Clear all selections" })).toBeInTheDocument();
  });

  it("clicking clear-all calls onValueChange with empty array", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Select multiple defaultValue={["be", "nl"]} onValueChange={onValueChange}>
        <Select.Control aria-label="Countries" showClearAll />
        <Select.Content>
          <Select.Option value="be">Belgium</Select.Option>
          <Select.Option value="nl">Netherlands</Select.Option>
        </Select.Content>
      </Select>,
    );
    await user.click(screen.getByRole("button", { name: "Clear all selections" }));
    expect(onValueChange).toHaveBeenCalledWith([]);
  });

  it("clicking clear-all updates live region to All selections cleared", async () => {
    const user = userEvent.setup();
    render(
      <Select multiple defaultValue={["be"]} onValueChange={vi.fn()}>
        <Select.Control aria-label="Countries" showClearAll />
        <Select.Content>
          <Select.Option value="be">Belgium</Select.Option>
        </Select.Content>
      </Select>,
    );
    await user.click(screen.getByRole("button", { name: "Clear all selections" }));
    const live = document.querySelector('[aria-live="polite"]');
    expect(live?.textContent).toMatch(/All selections cleared/);
  });

  it("clearAllLabel prop on Control customizes the clear-all button accessible name", () => {
    render(
      <Select multiple defaultValue={["be"]} onValueChange={vi.fn()}>
        <Select.Control aria-label="Pays" showClearAll clearAllLabel="Tout effacer" />
        <Select.Content>
          <Select.Option value="be">Belgique</Select.Option>
        </Select.Content>
      </Select>,
    );
    expect(screen.getByRole("button", { name: "Tout effacer" })).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Hidden native select sync: multi mode
  // -------------------------------------------------------------------------

  it("hidden select in multi mode has aria-hidden=true", () => {
    render(<BasicSelect />);
    const hiddenSelects = document.querySelectorAll('select[aria-hidden="true"]');
    expect(hiddenSelects.length).toBeGreaterThan(0);
  });

  it("hidden select in multi mode has tabIndex=-1", () => {
    render(<BasicSelect />);
    const hiddenSelects = document.querySelectorAll('select[aria-hidden="true"]');
    hiddenSelects.forEach((sel) => {
      expect(sel).toHaveAttribute("tabindex", "-1");
    });
  });

  it("hidden select reflects current multi selection", () => {
    render(<BasicSelect defaultValue={["be", "nl"]} />);
    const hiddenSelect = document.querySelector('select[multiple][aria-hidden="true"]') as HTMLSelectElement | null;
    expect(hiddenSelect).not.toBeNull();
    const selectedValues = Array.from(hiddenSelect!.selectedOptions).map((o) => o.value);
    expect(selectedValues).toContain("be");
    expect(selectedValues).toContain("nl");
  });

  // -------------------------------------------------------------------------
  // Bug fix: trigger is first tab stop (WCAG 2.1.1 / 2.4.3)
  // -------------------------------------------------------------------------

  it("trigger receives focus before chip remove buttons in tab order (DOM order)", () => {
    const { container } = render(<BasicSelect defaultValue={["be", "nl"]} />);
    // DOM order determines tab order. The trigger must appear before any chip
    // remove button in the document tree so Tab lands on the trigger first.
    const trigger = container.querySelector(".artui-select-trigger") as HTMLElement;
    const firstRemoveButton = container.querySelector(".artui-select-tag-remove") as HTMLElement;
    expect(trigger).not.toBeNull();
    expect(firstRemoveButton).not.toBeNull();
    // Node.compareDocumentPosition: DOCUMENT_POSITION_FOLLOWING = 4 means
    // firstRemoveButton comes after trigger in DOM order.
    expect(trigger.compareDocumentPosition(firstRemoveButton) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  // -------------------------------------------------------------------------
  // Bug fix: trigger aria-describedby announces selection summary (WCAG 1.3.1)
  // -------------------------------------------------------------------------

  it("trigger aria-describedby resolves to text listing selected option labels", () => {
    render(<BasicSelect defaultValue={["be", "nl"]} />);
    const trigger = screen.getByRole("button", { name: "Countries" });
    const descId = trigger.getAttribute("aria-describedby");
    expect(descId).toBeTruthy();
    const descEl = document.getElementById(descId!);
    expect(descEl?.textContent).toMatch(/Belgium/);
    expect(descEl?.textContent).toMatch(/Netherlands/);
  });

  it("trigger aria-describedby description says none selected when empty", () => {
    render(<BasicSelect />);
    const trigger = screen.getByRole("button", { name: "Countries" });
    const descId = trigger.getAttribute("aria-describedby");
    const descEl = document.getElementById(descId!);
    expect(descEl?.textContent).toMatch(/None selected/i);
  });

  it("trigger aria-describedby description updates when selection changes", async () => {
    const user = userEvent.setup();
    render(<BasicSelect />);
    const trigger = screen.getByRole("button", { name: "Countries" });
    const descId = trigger.getAttribute("aria-describedby")!;
    await user.click(trigger);
    await user.click(screen.getByRole("option", { name: /Belgium/ }));
    const descEl = document.getElementById(descId);
    expect(descEl?.textContent).toMatch(/Belgium/);
  });
});
