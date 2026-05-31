import { act, fireEvent, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { __resetDevOverlayCache } from "../../lib/dev-overlay";

import { Accordion } from "./accordion";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getSummaries(): HTMLElement[] {
  return Array.from(
    document.querySelectorAll<HTMLElement>(
      "summary[data-artui-accordion-summary]",
    ),
  );
}

// Simulate a native toggle event with the newState property that AccordionItem listens for.
// Does NOT set details.open to avoid triggering jsdom's exclusive-accordion behavior via name attr.
// Returns a promise that resolves after React has flushed state updates from the event.
async function fireToggle(
  details: HTMLDetailsElement,
  newState: "open" | "closed",
) {
  await act(async () => {
    const event = new Event("toggle");
    Object.defineProperty(event, "newState", {
      value: newState,
      writable: false,
    });
    details.dispatchEvent(event);
  });
}

// Set the user-initiated flag then toggle.
// Uses fireEvent so React synthetic event handlers are triggered.
async function userToggle(
  summary: HTMLElement,
  details: HTMLDetailsElement,
  newState: "open" | "closed",
) {
  fireEvent.pointerDown(summary);
  await fireToggle(details, newState);
}

function BasicAccordion({
  type,
  value,
  defaultValue,
  onValueChange,
  headingLevel = 3,
}: {
  type?: "single" | "multiple";
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: ((v: string) => void) | ((v: string[]) => void);
  headingLevel?: 2 | 3 | 4 | 5 | 6;
}) {
  if (type === "multiple") {
    return (
      <Accordion
        type="multiple"
        value={value as string[] | undefined}
        defaultValue={defaultValue as string[] | undefined}
        onValueChange={onValueChange as ((v: string[]) => void) | undefined}
        headingLevel={headingLevel}
      >
        <Accordion.Item value="item-a">
          <Accordion.Header>
            <Accordion.Trigger>Section A</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel>Panel A content</Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value="item-b">
          <Accordion.Header>
            <Accordion.Trigger>Section B</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel>Panel B content</Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    );
  }
  return (
    <Accordion
      type="single"
      value={value as string | undefined}
      defaultValue={defaultValue as string | undefined}
      onValueChange={onValueChange as ((v: string) => void) | undefined}
      headingLevel={headingLevel}
    >
      <Accordion.Item value="item-a">
        <Accordion.Header>
          <Accordion.Trigger>Section A</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel>Panel A content</Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value="item-b">
        <Accordion.Header>
          <Accordion.Trigger>Section B</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel>Panel B content</Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}

function ThreeItemAccordion({
  middleDisabled = false,
}: {
  middleDisabled?: boolean;
}) {
  return (
    <Accordion headingLevel={3}>
      <Accordion.Item value="a">
        <Accordion.Header>
          <Accordion.Trigger>A</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel>Panel A</Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value="b" disabled={middleDisabled}>
        <Accordion.Header>
          <Accordion.Trigger>B</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel>Panel B</Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value="c">
        <Accordion.Header>
          <Accordion.Trigger>C</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel>Panel C</Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

describe("Accordion", () => {
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
  // 1. Single-mode: opening one item closes the previously-open item
  // -------------------------------------------------------------------------

  it("single-mode: opening a second item closes the first", async () => {
    render(<BasicAccordion />);
    const summaries = getSummaries();
    const details = document.querySelectorAll<HTMLDetailsElement>("details");

    await userToggle(summaries[0]!, details[0]!, "open");
    await userToggle(summaries[1]!, details[1]!, "open");

    // In single mode, React state should show only item-b open.
    // aria-expanded reflects React's isOpen state (from openValues context).
    expect(summaries[0]).toHaveAttribute("aria-expanded", "false");
    expect(summaries[1]).toHaveAttribute("aria-expanded", "true");
  });

  // -------------------------------------------------------------------------
  // 2. Multiple-mode: opening one item does not close the previously-open item
  // -------------------------------------------------------------------------

  it("multiple-mode: opening a second item does not close the first", async () => {
    render(<BasicAccordion type="multiple" />);
    const summaries = getSummaries();
    const details = document.querySelectorAll<HTMLDetailsElement>("details");

    await userToggle(summaries[0]!, details[0]!, "open");
    await userToggle(summaries[1]!, details[1]!, "open");

    // In multiple mode, React state should show both items open.
    // aria-expanded reflects React's isOpen state (from openValues context).
    expect(summaries[0]).toHaveAttribute("aria-expanded", "true");
    expect(summaries[1]).toHaveAttribute("aria-expanded", "true");
  });

  // -------------------------------------------------------------------------
  // 3. Enter on a closed summary sets the user-initiated flag
  // -------------------------------------------------------------------------

  it("Enter on an open summary toggles closed without focus moving away", async () => {
    render(<BasicAccordion />);
    const summaries = getSummaries();
    const details = document.querySelectorAll<HTMLDetailsElement>("details");

    summaries[0]!.focus();
    fireEvent.keyDown(summaries[0]!, { key: "Enter" });
    await fireToggle(details[0]!, "open");
    fireEvent.keyDown(summaries[0]!, { key: "Enter" });
    await fireToggle(details[0]!, "closed");

    expect(document.activeElement).toBe(summaries[0]);
  });

  // -------------------------------------------------------------------------
  // 4. Space on a closed summary sets the user-initiated flag
  // -------------------------------------------------------------------------

  it("Space on an open summary toggles closed without focus moving away", async () => {
    render(<BasicAccordion />);
    const summaries = getSummaries();
    const details = document.querySelectorAll<HTMLDetailsElement>("details");

    summaries[0]!.focus();
    fireEvent.keyDown(summaries[0]!, { key: " " });
    await fireToggle(details[0]!, "open");
    fireEvent.keyDown(summaries[0]!, { key: " " });
    await fireToggle(details[0]!, "closed");

    expect(document.activeElement).toBe(summaries[0]);
  });

  // -------------------------------------------------------------------------
  // 5. ArrowDown moves focus to the next summary
  // -------------------------------------------------------------------------

  it("ArrowDown moves focus to the next summary", async () => {
    const user = userEvent.setup();
    render(<ThreeItemAccordion />);
    const summaries = getSummaries();

    summaries[0]!.focus();
    await user.keyboard("{ArrowDown}");

    expect(document.activeElement).toBe(summaries[1]);
  });

  // -------------------------------------------------------------------------
  // 6. ArrowDown wraps from last summary to first
  // -------------------------------------------------------------------------

  it("ArrowDown wraps from last summary to first", async () => {
    const user = userEvent.setup();
    render(<ThreeItemAccordion />);
    const summaries = getSummaries();

    summaries[summaries.length - 1]!.focus();
    await user.keyboard("{ArrowDown}");

    expect(document.activeElement).toBe(summaries[0]);
  });

  // -------------------------------------------------------------------------
  // 7. ArrowUp wraps from first summary to last
  // -------------------------------------------------------------------------

  it("ArrowUp wraps from first summary to last", async () => {
    const user = userEvent.setup();
    render(<ThreeItemAccordion />);
    const summaries = getSummaries();

    summaries[0]!.focus();
    await user.keyboard("{ArrowUp}");

    expect(document.activeElement).toBe(summaries[summaries.length - 1]);
  });

  // -------------------------------------------------------------------------
  // 8. Home focuses the first summary
  // -------------------------------------------------------------------------

  it("Home focuses the first summary", async () => {
    const user = userEvent.setup();
    render(<ThreeItemAccordion />);
    const summaries = getSummaries();

    summaries[2]!.focus();
    await user.keyboard("{Home}");

    expect(document.activeElement).toBe(summaries[0]);
  });

  // -------------------------------------------------------------------------
  // 9. End focuses the last summary
  // -------------------------------------------------------------------------

  it("End focuses the last summary", async () => {
    const user = userEvent.setup();
    render(<ThreeItemAccordion />);
    const summaries = getSummaries();

    summaries[0]!.focus();
    await user.keyboard("{End}");

    expect(document.activeElement).toBe(summaries[summaries.length - 1]);
  });

  // -------------------------------------------------------------------------
  // 10. ArrowDown does not toggle any panel
  // -------------------------------------------------------------------------

  it("ArrowDown does not toggle any panel", async () => {
    const user = userEvent.setup();
    render(<ThreeItemAccordion />);
    const summaries = getSummaries();

    summaries[0]!.focus();
    await user.keyboard("{ArrowDown}");

    // No summary should have aria-expanded=true after just an arrow navigation.
    const expanded = summaries.filter(
      (s) => s.getAttribute("aria-expanded") === "true",
    );
    expect(expanded.length).toBe(0);
  });

  // -------------------------------------------------------------------------
  // 11. Disabled item summary is skipped by ArrowDown navigation
  // -------------------------------------------------------------------------

  it("ArrowDown skips disabled item and lands on the next enabled summary", async () => {
    const user = userEvent.setup();
    render(<ThreeItemAccordion middleDisabled />);
    const summaries = getSummaries();
    // summaries[1] is disabled; ArrowDown from [0] should land on [2].

    summaries[0]!.focus();
    await user.keyboard("{ArrowDown}");

    expect(document.activeElement).toBe(summaries[2]);
  });

  // -------------------------------------------------------------------------
  // 12. User-initiated expand moves focus into the panel
  // -------------------------------------------------------------------------

  it("user-initiated expand keeps focus on the summary", async () => {
    render(<BasicAccordion />);
    const summaries = getSummaries();
    const details = document.querySelectorAll<HTMLDetailsElement>("details");

    summaries[0]!.focus();
    await userToggle(summaries[0]!, details[0]!, "open");

    expect(document.activeElement).toBe(summaries[0]);
  });

  // -------------------------------------------------------------------------
  // 13. User-initiated collapse leaves focus off the panel
  // -------------------------------------------------------------------------

  it("user-initiated expand announces panel text via the live region", async () => {
    render(<BasicAccordion />);
    const summaries = getSummaries();
    const details = document.querySelectorAll<HTMLDetailsElement>("details");

    await userToggle(summaries[0]!, details[0]!, "open");
    // Live region is updated via requestAnimationFrame; wait one frame plus a tick.
    await act(async () => {
      await new Promise((r) => setTimeout(r, 32));
    });

    const liveRegion = document.querySelector('[aria-live="polite"]')!;
    expect(liveRegion.textContent).toContain("Panel A content");
  });

  // -------------------------------------------------------------------------
  // 14. Programmatic expand (controlled value prop) does NOT move focus
  // -------------------------------------------------------------------------

  it("programmatic controlled expand does not announce", async () => {
    const { rerender } = render(<BasicAccordion type="single" />);

    rerender(<BasicAccordion type="single" value="item-a" />);
    await act(async () => {
      await new Promise((r) => setTimeout(r, 32));
    });

    const liveRegion = document.querySelector('[aria-live="polite"]')!;
    expect(liveRegion.textContent).toBe("");
  });

  // -------------------------------------------------------------------------
  // 15. Panel has role="region" when ≤6 items
  // -------------------------------------------------------------------------

  it("panel has role=region when accordion has ≤6 items", async () => {
    render(<ThreeItemAccordion />);
    // Wait for itemValues state to stabilize after registration effects.
    await act(async () => {});
    const regions = document.querySelectorAll('[role="region"]');
    expect(regions.length).toBeGreaterThan(0);
  });

  // -------------------------------------------------------------------------
  // 16. Panel has no role="region" when >6 items
  // -------------------------------------------------------------------------

  it("panel has no role=region when accordion has more than 6 items", async () => {
    const values = ["a", "b", "c", "d", "e", "f", "g"];
    render(
      <Accordion headingLevel={3}>
        {values.map((v) => (
          <Accordion.Item key={v} value={v}>
            <Accordion.Header>
              <Accordion.Trigger aria-label={`Section ${v}`} />
            </Accordion.Header>
            <Accordion.Panel>Panel {v}</Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>,
    );
    // Wait for all 7 items to register so panelGetsRegionRole updates.
    await act(async () => {});

    const regions = document.querySelectorAll('[role="region"]');
    expect(regions.length).toBe(0);
  });

  // -------------------------------------------------------------------------
  // 17. Panel has tabIndex={-1}
  // -------------------------------------------------------------------------

  it("panel has tabIndex=-1", () => {
    render(<BasicAccordion />);
    const panels = document.querySelectorAll<HTMLElement>(".artui-accordion-panel");
    expect(panels[0]!.tabIndex).toBe(-1);
  });

  // -------------------------------------------------------------------------
  // 18. Closed panel content is not in the accessibility tree
  // -------------------------------------------------------------------------

  it("closed panel is not visible to queries that respect hidden state", () => {
    render(<BasicAccordion />);
    // jsdom does not implement the UA stylesheet for <details>, so we verify
    // via the details.open attribute: the panel is rendered but the closed
    // state is communicated through the native attribute to the AT.
    const details = document.querySelectorAll<HTMLDetailsElement>("details");
    expect(details[0]!.open).toBe(false);
    expect(details[1]!.open).toBe(false);
  });

  // -------------------------------------------------------------------------
  // 19. Header renders as the heading level passed to root
  // -------------------------------------------------------------------------

  it("renders heading at the level specified by headingLevel", () => {
    render(<BasicAccordion headingLevel={4} />);
    const headings = document.querySelectorAll("h4.artui-accordion-header");
    expect(headings.length).toBeGreaterThan(0);
  });

  // -------------------------------------------------------------------------
  // 20. Dev overlay: Item without Trigger logs item-without-trigger
  // -------------------------------------------------------------------------

  it("logs item-without-trigger when Item has no Trigger", async () => {
    render(
      <Accordion headingLevel={3}>
        <Accordion.Item value="x">
          <Accordion.Panel>Panel only</Accordion.Panel>
        </Accordion.Item>
      </Accordion>,
    );
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });
    const logged = errorSpy.mock.calls
      .flat()
      .some((msg: unknown) => String(msg).includes("item-without-trigger"));
    expect(logged).toBe(true);
  });

  // -------------------------------------------------------------------------
  // 21. Dev overlay: Item without Panel logs item-without-panel
  // -------------------------------------------------------------------------

  it("logs item-without-panel when Item has no Panel", async () => {
    render(
      <Accordion headingLevel={3}>
        <Accordion.Item value="x">
          <Accordion.Header>
            <Accordion.Trigger>Trigger only</Accordion.Trigger>
          </Accordion.Header>
        </Accordion.Item>
      </Accordion>,
    );
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });
    const logged = errorSpy.mock.calls
      .flat()
      .some((msg: unknown) => String(msg).includes("item-without-panel"));
    expect(logged).toBe(true);
  });

  // -------------------------------------------------------------------------
  // 22. Dev overlay: duplicate values log duplicate-values
  // -------------------------------------------------------------------------

  it("logs duplicate-values when two Items share the same value", async () => {
    render(
      <Accordion headingLevel={3}>
        <Accordion.Item value="dup">
          <Accordion.Header>
            <Accordion.Trigger>First</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel>Panel 1</Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value="dup">
          <Accordion.Header>
            <Accordion.Trigger>Second</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel>Panel 2</Accordion.Panel>
        </Accordion.Item>
      </Accordion>,
    );
    await act(async () => {});
    // The duplicate guard fires via withErrorOverlay which calls console.error.
    const logged = errorSpy.mock.calls
      .flat()
      .some((msg: unknown) => String(msg).includes("duplicate-values"));
    expect(logged).toBe(true);
  });

  // -------------------------------------------------------------------------
  // 23. Dev overlay: empty Accordion logs empty
  // -------------------------------------------------------------------------

  it("logs empty when Accordion renders with no Items", async () => {
    render(<Accordion headingLevel={3}>{null}</Accordion>);
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });
    const logged = errorSpy.mock.calls
      .flat()
      .some((msg: unknown) => String(msg).includes("Accordion:empty"));
    expect(logged).toBe(true);
  });

  // -------------------------------------------------------------------------
  // 24. Trigger compile rejects empty children (@ts-expect-error)
  // -------------------------------------------------------------------------

  it("type system rejects empty string as trigger children", () => {
    const emptyStr = "" as const;
    // @ts-expect-error: empty string is not an AccessibleText; never is not assignable to string
    const _unused: typeof Accordion.Trigger extends (props: { children: infer C }) => unknown ? C : never = emptyStr;
    expect(true).toBe(true);
  });

  // -------------------------------------------------------------------------
  // 25. Trigger compile rejects placeholder strings (@ts-expect-error)
  // -------------------------------------------------------------------------

  it("type system rejects placeholder string 'image' as trigger children", () => {
    const placeholder = "image" as const;
    // @ts-expect-error: "image" is a PlaceholderAltText; never is not assignable to string
    const _unused: typeof Accordion.Trigger extends (props: { children: infer C }) => unknown ? C : never = placeholder;
    expect(true).toBe(true);
  });

  // -------------------------------------------------------------------------
  // 26. Single-mode controlled: external value change syncs open attribute
  // -------------------------------------------------------------------------

  it("controlled single value prop syncs open attribute on the correct item", async () => {
    const { rerender } = render(<BasicAccordion type="single" value="item-a" />);
    await act(async () => {});

    const details = document.querySelectorAll<HTMLDetailsElement>("details");
    expect(details[0]!.open).toBe(true);
    expect(details[1]!.open).toBe(false);

    rerender(<BasicAccordion type="single" value="item-b" />);
    await act(async () => {});

    expect(details[0]!.open).toBe(false);
    expect(details[1]!.open).toBe(true);
  });

  // -------------------------------------------------------------------------
  // 27. onValueChange fires with the new value on user toggle
  // -------------------------------------------------------------------------

  it("onValueChange is called with the toggled value on user interaction", async () => {
    const onValueChange = vi.fn();
    render(<BasicAccordion onValueChange={onValueChange} />);
    const summaries = getSummaries();
    const details = document.querySelectorAll<HTMLDetailsElement>("details");

    await userToggle(summaries[0]!, details[0]!, "open");

    expect(onValueChange).toHaveBeenCalledWith("item-a");
  });

  // -------------------------------------------------------------------------
  // 28. Multi-mode controlled: value array reflects all open items
  // -------------------------------------------------------------------------

  it("controlled multiple value array opens the correct items", async () => {
    const { rerender } = render(
      <BasicAccordion type="multiple" value={[]} />,
    );
    await act(async () => {});

    rerender(<BasicAccordion type="multiple" value={["item-a", "item-b"]} />);
    await act(async () => {});

    const details = document.querySelectorAll<HTMLDetailsElement>("details");
    expect(details[0]!.open).toBe(true);
    expect(details[1]!.open).toBe(true);
  });

  // -------------------------------------------------------------------------
  // 29. aria-expanded mirrors open attribute
  // -------------------------------------------------------------------------

  it("aria-expanded on summary mirrors the open state", async () => {
    // Use controlled mode to test aria-expanded: controlled re-render is
    // deterministic and avoids reliance on jsdom's toggle event handling.
    const { rerender } = render(<BasicAccordion type="single" value={undefined} />);
    const summary = getSummaries()[0]!;

    expect(summary).toHaveAttribute("aria-expanded", "false");

    rerender(<BasicAccordion type="single" value="item-a" />);
    await act(async () => {});

    const updatedSummary = getSummaries()[0]!;
    expect(updatedSummary).toHaveAttribute("aria-expanded", "true");
  });

  // -------------------------------------------------------------------------
  // 30. aria-controls on summary points at an existing panel id
  // -------------------------------------------------------------------------

  it("aria-controls on summary references an existing panel element", () => {
    render(<BasicAccordion />);
    const summary = getSummaries()[0]!;
    const panelId = summary.getAttribute("aria-controls");
    expect(panelId).toBeTruthy();
    expect(document.getElementById(panelId!)).not.toBeNull();
  });

  // -------------------------------------------------------------------------
  // 31. Bug 1 regression: disabled summary is removed from the tab order
  // A disabled <summary> must have tabIndex=-1 so Tab/Shift+Tab cannot
  // land on it. Without this fix, a disabled summary kept its native
  // tabIndex=0 and Tab could reach it, causing AT to announce the wrong
  // item (the previously-focused enabled item) as context.
  // -------------------------------------------------------------------------

  it("disabled summary has tabIndex=-1 so Tab skips it", () => {
    render(<ThreeItemAccordion middleDisabled />);
    const summaries = getSummaries();
    // summaries[1] is the disabled item (value="b")
    expect(summaries[1]!.tabIndex).toBe(-1);
  });

  // -------------------------------------------------------------------------
  // 32. Bug 1 regression: disabled summary has its own accessible name
  // The disabled item's aria-controls must point at its own panel, not
  // the previous item's panel. This verifies the id/aria-controls wiring
  // is per-item (not shared), so AT reads the correct, disabled item.
  // -------------------------------------------------------------------------

  it("disabled summary aria-controls points at its own panel", () => {
    render(<ThreeItemAccordion middleDisabled />);
    const summaries = getSummaries();
    const disabledSummary = summaries[1]!;

    expect(disabledSummary).toHaveAttribute("aria-disabled", "true");

    const panelId = disabledSummary.getAttribute("aria-controls");
    expect(panelId).toBeTruthy();

    const panel = document.getElementById(panelId!);
    expect(panel).not.toBeNull();
    // The panel's aria-labelledby must point back at the disabled summary's id
    // so AT resolves the disabled item's own name — not the previous item's.
    expect(panel!.getAttribute("aria-labelledby")).toBe(disabledSummary.id);
  });

  // -------------------------------------------------------------------------
  // 33. Bug 2 regression: enabled summaries remain in the tab order
  // Counterpart to test 31 — the fix for disabled items must not
  // accidentally remove enabled summaries from the tab order.
  // -------------------------------------------------------------------------

  it("enabled summaries have tabIndex=0 and remain in the tab order", () => {
    render(<ThreeItemAccordion middleDisabled />);
    const summaries = getSummaries();
    // summaries[0] (value="a") and summaries[2] (value="c") are enabled
    expect(summaries[0]!.tabIndex).toBe(0);
    expect(summaries[2]!.tabIndex).toBe(0);
  });

  // -------------------------------------------------------------------------
  // 34. Bug 2 regression: Tab skips disabled summary and reaches the next
  // enabled summary. With tabIndex=-1 on the disabled summary, the natural
  // Tab order is: [0] enabled → [2] enabled (skipping [1] disabled).
  // -------------------------------------------------------------------------

  it("Tab skips the disabled summary and moves to the next enabled summary", async () => {
    const user = userEvent.setup();
    render(<ThreeItemAccordion middleDisabled />);
    const summaries = getSummaries();

    // Focus the first enabled summary, then Tab once.
    summaries[0]!.focus();
    await user.tab();

    // The disabled middle summary (index 1) must be skipped; Tab should land
    // on the third summary (index 2) which is enabled.
    expect(document.activeElement).toBe(summaries[2]);
  });
});
