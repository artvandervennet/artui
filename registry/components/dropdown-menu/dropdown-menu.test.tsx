import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { __resetDevOverlayCache } from "../../lib/dev-overlay";

import { DropdownMenu } from "./dropdown-menu";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function BasicMenu({
  onSelect = vi.fn(),
  open,
  onOpenChange,
}: {
  onSelect?: () => void;
  open?: boolean;
  onOpenChange?: (o: boolean) => void;
}) {
  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenu.Trigger>Open menu</DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item onSelect={onSelect}>Profile</DropdownMenu.Item>
        <DropdownMenu.Item onSelect={vi.fn()}>Settings</DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item onSelect={vi.fn()} disabled>
          Disabled item
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
}

function MenuWithSub() {
  return (
    <DropdownMenu>
      <DropdownMenu.Trigger>Open menu</DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item onSelect={vi.fn()}>Profile</DropdownMenu.Item>
        <DropdownMenu.Sub>
          <DropdownMenu.SubTrigger>Preferences</DropdownMenu.SubTrigger>
          <DropdownMenu.SubContent>
            <DropdownMenu.Item onSelect={vi.fn()}>Light theme</DropdownMenu.Item>
            <DropdownMenu.Item onSelect={vi.fn()}>Dark theme</DropdownMenu.Item>
          </DropdownMenu.SubContent>
        </DropdownMenu.Sub>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
}

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

describe("DropdownMenu", () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    __resetDevOverlayCache();
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    // JSDOM does not implement getBoundingClientRect usefully.
    Element.prototype.getBoundingClientRect = vi.fn().mockReturnValue({
      top: 100,
      left: 50,
      width: 120,
      height: 40,
      bottom: 140,
      right: 170,
    });
  });

  afterEach(() => {
    errorSpy.mockRestore();
    vi.restoreAllMocks();
  });

  // -------------------------------------------------------------------------
  // ARIA wiring — trigger
  // -------------------------------------------------------------------------

  it("renders a button with aria-haspopup=menu and aria-expanded=false when closed", () => {
    render(<BasicMenu />);
    const trigger = screen.getByRole("button", { name: "Open menu" });
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("sets aria-expanded=true on the trigger when the menu is open", async () => {
    const user = userEvent.setup();
    render(<BasicMenu />);
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    expect(screen.getByRole("button", { name: "Open menu" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("wires aria-controls from trigger to menu id", async () => {
    const user = userEvent.setup();
    render(<BasicMenu />);
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    const trigger = screen.getByRole("button", { name: "Open menu" });
    const menuId = trigger.getAttribute("aria-controls");
    expect(document.getElementById(menuId!)).toHaveAttribute("role", "menu");
  });

  it("renders the menu with role=menu and aria-labelledby pointing at the trigger", async () => {
    const user = userEvent.setup();
    render(<BasicMenu />);
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    const menu = screen.getByRole("menu");
    const triggerId = screen.getByRole("button", { name: "Open menu" }).id;
    expect(menu).toHaveAttribute("aria-labelledby", triggerId);
  });

  // -------------------------------------------------------------------------
  // Open / close lifecycle
  // -------------------------------------------------------------------------

  it("does not render the menu when closed", () => {
    render(<BasicMenu />);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("shows the menu on trigger click", async () => {
    const user = userEvent.setup();
    render(<BasicMenu />);
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("closes the menu on a second trigger click", async () => {
    const user = userEvent.setup();
    render(<BasicMenu />);
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("opens the menu with ArrowDown and keeps trigger focused momentarily", async () => {
    const user = userEvent.setup();
    render(<BasicMenu />);
    screen.getByRole("button", { name: "Open menu" }).focus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("opens the menu with ArrowUp", async () => {
    const user = userEvent.setup();
    render(<BasicMenu />);
    screen.getByRole("button", { name: "Open menu" }).focus();
    await user.keyboard("{ArrowUp}");
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Focus management
  // -------------------------------------------------------------------------

  it("moves focus to the first menu item when the menu opens", async () => {
    const user = userEvent.setup();
    render(<BasicMenu />);
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    const items = screen.getAllByRole("menuitem");
    expect(document.activeElement).toBe(items[0]);
  });

  // -------------------------------------------------------------------------
  // Keyboard — ArrowDown / ArrowUp navigation
  // -------------------------------------------------------------------------

  it("moves focus to the next item with ArrowDown", async () => {
    const user = userEvent.setup();
    render(<BasicMenu />);
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    await user.keyboard("{ArrowDown}");
    const items = screen.getAllByRole("menuitem");
    expect(document.activeElement).toBe(items[1]);
  });

  it("wraps from last item to first with ArrowDown", async () => {
    const user = userEvent.setup();
    render(<BasicMenu />);
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    // Move to last enabled item (Settings at index 1, then disabled at 2 is skipped by FOCUSABLE_ITEM selector).
    const items = screen.getAllByRole("menuitem");
    items[items.length - 1]?.focus();
    await user.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(items[0]);
  });

  it("moves focus to the previous item with ArrowUp", async () => {
    const user = userEvent.setup();
    render(<BasicMenu />);
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{ArrowUp}");
    const items = screen.getAllByRole("menuitem");
    expect(document.activeElement).toBe(items[0]);
  });

  it("moves focus to the last item with End", async () => {
    const user = userEvent.setup();
    render(<BasicMenu />);
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    await user.keyboard("{End}");
    const items = screen.getAllByRole("menuitem");
    // Last non-disabled item is "Settings" (index 1); disabled item is excluded from FOCUSABLE_ITEM.
    expect(document.activeElement).toBe(items[1]);
  });

  it("moves focus to the first item with Home", async () => {
    const user = userEvent.setup();
    render(<BasicMenu />);
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    await user.keyboard("{End}");
    await user.keyboard("{Home}");
    const items = screen.getAllByRole("menuitem");
    expect(document.activeElement).toBe(items[0]);
  });

  // -------------------------------------------------------------------------
  // Keyboard — Escape
  // -------------------------------------------------------------------------

  it("closes the menu on Escape", async () => {
    const user = userEvent.setup();
    render(<BasicMenu />);
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("returns focus to the trigger after closing with Escape", async () => {
    const user = userEvent.setup();
    render(<BasicMenu />);
    const trigger = screen.getByRole("button", { name: "Open menu" });
    await user.click(trigger);
    await user.keyboard("{Escape}");
    expect(document.activeElement).toBe(trigger);
  });

  // -------------------------------------------------------------------------
  // Click outside
  // -------------------------------------------------------------------------

  it("closes the menu when the user clicks outside", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <button type="button">Outside</button>
        <BasicMenu />
      </div>,
    );
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    await user.click(screen.getByRole("button", { name: "Outside" }));
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Keyboard — Typeahead
  // -------------------------------------------------------------------------

  it("jumps to the first item matching the typed character", async () => {
    const user = userEvent.setup();
    render(<BasicMenu />);
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    await user.keyboard("s");
    expect(document.activeElement).toHaveTextContent("Settings");
  });

  // -------------------------------------------------------------------------
  // Item selection
  // -------------------------------------------------------------------------

  it("calls onSelect and closes the menu when an item is clicked", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<BasicMenu onSelect={onSelect} />);
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    await user.click(screen.getByRole("menuitem", { name: "Profile" }));
    expect(onSelect).toHaveBeenCalledOnce();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("calls onSelect when Enter is pressed on an item", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<BasicMenu onSelect={onSelect} />);
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    screen.getAllByRole("menuitem")[0]?.focus();
    await user.keyboard("{Enter}");
    expect(onSelect).toHaveBeenCalledOnce();
  });

  it("calls onSelect when Space is pressed on an item", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<BasicMenu onSelect={onSelect} />);
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    screen.getAllByRole("menuitem")[0]?.focus();
    await user.keyboard(" ");
    expect(onSelect).toHaveBeenCalledOnce();
  });

  it("does not call onSelect when a disabled item is clicked", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<BasicMenu onSelect={onSelect} />);
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    const disabled = screen.getByRole("menuitem", { name: "Disabled item" });
    await user.click(disabled);
    expect(onSelect).not.toHaveBeenCalled();
  });

  // -------------------------------------------------------------------------
  // Disabled item ARIA
  // -------------------------------------------------------------------------

  it("sets aria-disabled=true on disabled items", async () => {
    const user = userEvent.setup();
    render(<BasicMenu />);
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    const disabled = screen.getByRole("menuitem", { name: "Disabled item" });
    expect(disabled).toHaveAttribute("aria-disabled", "true");
  });

  // -------------------------------------------------------------------------
  // Separator ARIA
  // -------------------------------------------------------------------------

  it("renders separator with role=separator and aria-orientation=horizontal", async () => {
    const user = userEvent.setup();
    render(<BasicMenu />);
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    const sep = screen.getByRole("separator");
    expect(sep).toHaveAttribute("aria-orientation", "horizontal");
  });

  // -------------------------------------------------------------------------
  // Controlled mode
  // -------------------------------------------------------------------------

  it("respects controlled open prop", () => {
    render(<BasicMenu open={true} onOpenChange={vi.fn()} />);
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("calls onOpenChange with false when Escape is pressed in controlled mode", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<BasicMenu open={true} onOpenChange={onOpenChange} />);
    // Focus moves to the first item on open via useEffect; ensure the element
    // is in focus so userEvent routes keyboard events to it.
    const items = screen.getAllByRole("menuitem");
    items[0]?.focus();
    await user.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  // -------------------------------------------------------------------------
  // Submenu — ARIA
  // -------------------------------------------------------------------------

  it("sub-trigger has aria-haspopup=menu and aria-expanded=false when sub is closed", async () => {
    const user = userEvent.setup();
    render(<MenuWithSub />);
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    const subTrigger = screen.getByRole("menuitem", { name: /Preferences/i });
    expect(subTrigger).toHaveAttribute("aria-haspopup", "menu");
    expect(subTrigger).toHaveAttribute("aria-expanded", "false");
  });

  it("opens submenu when sub-trigger is clicked", async () => {
    const user = userEvent.setup();
    render(<MenuWithSub />);
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    await user.click(screen.getByRole("menuitem", { name: /Preferences/i }));
    const menus = screen.getAllByRole("menu");
    expect(menus.length).toBe(2);
  });

  it("opens submenu on ArrowRight from sub-trigger", async () => {
    const user = userEvent.setup();
    render(<MenuWithSub />);
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    screen.getByRole("menuitem", { name: /Preferences/i }).focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getAllByRole("menu").length).toBe(2);
  });

  it("closes submenu on ArrowLeft from sub-item", async () => {
    const user = userEvent.setup();
    render(<MenuWithSub />);
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    await user.click(screen.getByRole("menuitem", { name: /Preferences/i }));
    const subItems = screen.getByRole("menuitem", { name: "Light theme" });
    subItems.focus();
    await user.keyboard("{ArrowLeft}");
    expect(screen.getAllByRole("menu").length).toBe(1);
  });

  it("closes submenu on Escape from sub-item", async () => {
    const user = userEvent.setup();
    render(<MenuWithSub />);
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    await user.click(screen.getByRole("menuitem", { name: /Preferences/i }));
    screen.getByRole("menuitem", { name: "Light theme" }).focus();
    await user.keyboard("{Escape}");
    expect(screen.getAllByRole("menu").length).toBe(1);
  });

  it("ArrowDown inside submenu focuses second submenu item, not parent menu's second item", async () => {
    // Regression: SubContent's ArrowDown used to bubble up to Content's
    // handler, which ran its own item list (including submenu items via
    // querySelectorAll) and moved focus to the wrong element.
    const user = userEvent.setup();
    render(
      <DropdownMenu>
        <DropdownMenu.Trigger>Open menu</DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item onSelect={vi.fn()}>Parent A</DropdownMenu.Item>
          <DropdownMenu.Item onSelect={vi.fn()}>Parent B</DropdownMenu.Item>
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger>Preferences</DropdownMenu.SubTrigger>
            <DropdownMenu.SubContent>
              <DropdownMenu.Item onSelect={vi.fn()}>Sub One</DropdownMenu.Item>
              <DropdownMenu.Item onSelect={vi.fn()}>Sub Two</DropdownMenu.Item>
              <DropdownMenu.Item onSelect={vi.fn()}>Sub Three</DropdownMenu.Item>
            </DropdownMenu.SubContent>
          </DropdownMenu.Sub>
        </DropdownMenu.Content>
      </DropdownMenu>,
    );
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    await user.click(screen.getByRole("menuitem", { name: /Preferences/i }));
    // First submenu item receives focus automatically on open.
    expect(document.activeElement).toBe(
      screen.getByRole("menuitem", { name: "Sub One" }),
    );
    await user.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(
      screen.getByRole("menuitem", { name: "Sub Two" }),
    );
  });

  // -------------------------------------------------------------------------
  // Dev overlays
  // -------------------------------------------------------------------------

  it("fires dev overlay for empty Content", async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu>
        <DropdownMenu.Trigger>Open</DropdownMenu.Trigger>
        <DropdownMenu.Content>{false}</DropdownMenu.Content>
      </DropdownMenu>,
    );
    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(errorSpy).toHaveBeenCalled();
    const msg = String(errorSpy.mock.calls[0]?.[0] ?? "");
    expect(msg).toMatch(/1\.3\.1/);
  });

  it("fires dev error when SubContent has no matching SubTrigger", async () => {
    render(
      // Controlled so menu is open immediately, causing Content and SubContent to mount.
      <DropdownMenu open onOpenChange={vi.fn()}>
        <DropdownMenu.Trigger>Open</DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Sub>
            {/* SubTrigger intentionally absent — guard fires after SubContent mount */}
            <DropdownMenu.SubContent>
              <DropdownMenu.Item onSelect={vi.fn()}>Item</DropdownMenu.Item>
            </DropdownMenu.SubContent>
          </DropdownMenu.Sub>
        </DropdownMenu.Content>
      </DropdownMenu>,
    );
    // Guard is deferred to a macrotask so a sibling SubTrigger's registration can win first.
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringMatching(/subtrigger-without-subcontent/),
    );
  });

  // -------------------------------------------------------------------------
  // CSS classes
  // -------------------------------------------------------------------------

  it("applies artui-dropdown-trigger class to the trigger", () => {
    render(<BasicMenu />);
    expect(screen.getByRole("button", { name: "Open menu" })).toHaveClass(
      "artui-dropdown-trigger",
    );
  });

  it("applies artui-dropdown-content class to the menu panel", async () => {
    const user = userEvent.setup();
    render(<BasicMenu />);
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    expect(screen.getByRole("menu")).toHaveClass("artui-dropdown-content");
  });

  it("applies artui-dropdown-item class to each item", async () => {
    const user = userEvent.setup();
    render(<BasicMenu />);
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    const items = screen.getAllByRole("menuitem");
    expect(items[0]).toHaveClass("artui-dropdown-item");
  });

  // -------------------------------------------------------------------------
  // SubContent viewport overflow — flip and clamp
  // -------------------------------------------------------------------------

  it("flips SubContent to the left when the right edge would overflow the viewport", async () => {
    // Trigger rect: left=300, width=120, subOffset=4 → rightSpace = 400-(300+120+4) = -24 < 160.
    // Flip left: max(4, 300 - 4 - 160) = 136.
    const user = userEvent.setup();

    const triggerRect = { top: 100, left: 300, width: 120, height: 40, bottom: 140, right: 420 };

    Element.prototype.getBoundingClientRect = vi.fn().mockReturnValue(triggerRect);

    // Viewport: narrow so rightSpace < MIN_MENU_WIDTH.
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 400 });
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 800 });

    render(<MenuWithSub />);
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    await user.click(screen.getByRole("menuitem", { name: /Preferences/i }));

    const subMenus = screen.getAllByRole("menu");
    const subPanel = subMenus[subMenus.length - 1]!;
    expect(subPanel).toHaveStyle({ left: "136px" });
  });

  it("keeps SubContent to the right when the viewport has enough space", async () => {
    // Trigger rect: left=50, width=120, subOffset=4 → rightSpace = 1024-(50+120+4) = 850 ≥ 160.
    // Keep right: left = 50 + 120 + 4 = 174.
    const user = userEvent.setup();

    const triggerRect = { top: 100, left: 50, width: 120, height: 40, bottom: 140, right: 170 };

    Element.prototype.getBoundingClientRect = vi.fn().mockReturnValue(triggerRect);

    Object.defineProperty(window, "innerWidth", { configurable: true, value: 1024 });
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 768 });

    render(<MenuWithSub />);
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    await user.click(screen.getByRole("menuitem", { name: /Preferences/i }));

    const subMenus = screen.getAllByRole("menu");
    const subPanel = subMenus[subMenus.length - 1]!;
    expect(subPanel).toHaveStyle({ left: "174px" });
  });

  it("positions SubContent top aligned with the sub-trigger", async () => {
    // top = subTriggerRect.top - contentPadding = 100 - 4 = 96.
    const user = userEvent.setup();

    const triggerRect = { top: 100, left: 50, width: 120, height: 40, bottom: 140, right: 170 };

    Element.prototype.getBoundingClientRect = vi.fn().mockReturnValue(triggerRect);

    Object.defineProperty(window, "innerWidth", { configurable: true, value: 1024 });
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 768 });

    render(<MenuWithSub />);
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    await user.click(screen.getByRole("menuitem", { name: /Preferences/i }));

    const subMenus = screen.getAllByRole("menu");
    const subPanel = subMenus[subMenus.length - 1]!;
    expect(subPanel).toHaveStyle({ top: "96px" });
  });
});
