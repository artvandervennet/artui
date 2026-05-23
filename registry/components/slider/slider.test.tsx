import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { __resetDevOverlayCache } from "../../lib/dev-overlay";

import { Slider } from "./slider";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getThumb(name?: string): HTMLElement {
  if (name) return screen.getByRole("slider", { name });
  return screen.getAllByRole("slider")[0]!;
}

function getThumbs(): HTMLElement[] {
  return screen.getAllByRole("slider");
}

describe("Slider", () => {
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
  // Rendering & ARIA — single-thumb
  // -------------------------------------------------------------------------

  describe("single-thumb rendering", () => {
    it("renders a single slider button", () => {
      render(<Slider min={0} max={100} defaultValue={50} aria-label="Volume" />);
      expect(getThumbs()).toHaveLength(1);
    });

    it("has role=slider on the thumb button", () => {
      render(<Slider min={0} max={100} defaultValue={50} aria-label="Volume" />);
      expect(getThumb()).toHaveAttribute("role", "slider");
    });

    it("sets aria-valuemin to min", () => {
      render(<Slider min={10} max={90} defaultValue={50} aria-label="Volume" />);
      expect(getThumb()).toHaveAttribute("aria-valuemin", "10");
    });

    it("sets aria-valuemax to max", () => {
      render(<Slider min={10} max={90} defaultValue={50} aria-label="Volume" />);
      expect(getThumb()).toHaveAttribute("aria-valuemax", "90");
    });

    it("sets aria-valuenow to defaultValue", () => {
      render(<Slider min={0} max={100} defaultValue={42} aria-label="Volume" />);
      expect(getThumb()).toHaveAttribute("aria-valuenow", "42");
    });

    it("sets aria-orientation to horizontal by default", () => {
      render(<Slider min={0} max={100} aria-label="Volume" />);
      expect(getThumb()).toHaveAttribute("aria-orientation", "horizontal");
    });

    it("sets aria-orientation to vertical when specified", () => {
      render(<Slider min={0} max={100} orientation="vertical" aria-label="Volume" />);
      expect(getThumb()).toHaveAttribute("aria-orientation", "vertical");
    });

    it("sets aria-label from the prop", () => {
      render(<Slider min={0} max={100} aria-label="Brightness" />);
      expect(getThumb("Brightness")).toBeInTheDocument();
    });

    it("sets accessible name from aria-labelledby", () => {
      render(
        <div>
          <span id="lbl">Speed</span>
          <Slider min={0} max={100} aria-labelledby="lbl" />
        </div>,
      );
      expect(getThumb("Speed")).toBeInTheDocument();
    });

    it("does not set aria-valuetext when formatValue is absent", () => {
      render(<Slider min={0} max={100} defaultValue={50} aria-label="Volume" />);
      expect(getThumb()).not.toHaveAttribute("aria-valuetext");
    });

    it("wires aria-valuetext from formatValue", () => {
      render(
        <Slider
          min={0}
          max={1000}
          step={10}
          defaultValue={250}
          aria-label="Price"
          formatValue={(v) => `€${v}`}
        />,
      );
      expect(getThumb()).toHaveAttribute("aria-valuetext", "€250");
    });

    it("sets aria-disabled=true when disabled", () => {
      render(<Slider min={0} max={100} disabled aria-label="Volume" />);
      expect(getThumb()).toHaveAttribute("aria-disabled", "true");
    });

    it("does not set aria-disabled when not disabled", () => {
      render(<Slider min={0} max={100} aria-label="Volume" />);
      expect(getThumb()).not.toHaveAttribute("aria-disabled");
    });

    it("applies artui-slider class to the root", () => {
      const { container } = render(
        <Slider min={0} max={100} aria-label="Volume" />,
      );
      expect(container.firstChild).toHaveClass("artui-slider");
    });

    it("appends className to the root", () => {
      const { container } = render(
        <Slider min={0} max={100} aria-label="Volume" className="custom" />,
      );
      expect(container.firstChild).toHaveClass("custom");
    });

    it("has data-orientation=horizontal on the root", () => {
      const { container } = render(
        <Slider min={0} max={100} aria-label="Volume" />,
      );
      expect(container.firstChild).toHaveAttribute("data-orientation", "horizontal");
    });

    it("has data-orientation=vertical on the root when vertical", () => {
      const { container } = render(
        <Slider min={0} max={100} orientation="vertical" aria-label="Volume" />,
      );
      expect(container.firstChild).toHaveAttribute("data-orientation", "vertical");
    });
  });

  // -------------------------------------------------------------------------
  // Rendering & ARIA — range slider
  // -------------------------------------------------------------------------

  describe("range slider rendering", () => {
    it("renders two slider buttons", () => {
      render(
        <Slider
          min={0}
          max={100}
          aria-label="Price range"
          thumbs={[{ "aria-label": "Min" }, { "aria-label": "Max" }]}
        />,
      );
      expect(getThumbs()).toHaveLength(2);
    });

    it("wraps in role=group", () => {
      render(
        <Slider
          min={0}
          max={100}
          aria-label="Price range"
          thumbs={[{ "aria-label": "Min" }, { "aria-label": "Max" }]}
        />,
      );
      expect(screen.getByRole("group")).toBeInTheDocument();
    });

    it("sets aria-label on the group", () => {
      render(
        <Slider
          min={0}
          max={100}
          aria-label="Price range"
          thumbs={[{ "aria-label": "Min" }, { "aria-label": "Max" }]}
        />,
      );
      expect(screen.getByRole("group", { name: "Price range" })).toBeInTheDocument();
    });

    it("gives each thumb its own accessible name", () => {
      render(
        <Slider
          min={0}
          max={100}
          aria-label="Range"
          thumbs={[{ "aria-label": "Minimum price" }, { "aria-label": "Maximum price" }]}
        />,
      );
      expect(getThumb("Minimum price")).toBeInTheDocument();
      expect(getThumb("Maximum price")).toBeInTheDocument();
    });

    it("sets aria-valuenow on each thumb from defaultValue", () => {
      render(
        <Slider
          min={0}
          max={100}
          defaultValue={[20, 80]}
          aria-label="Range"
          thumbs={[{ "aria-label": "Min" }, { "aria-label": "Max" }]}
        />,
      );
      const [lo, hi] = getThumbs();
      expect(lo).toHaveAttribute("aria-valuenow", "20");
      expect(hi).toHaveAttribute("aria-valuenow", "80");
    });

    it("sets dynamic aria-valuemax on lower thumb", () => {
      render(
        <Slider
          min={0}
          max={100}
          defaultValue={[20, 80]}
          aria-label="Range"
          thumbs={[{ "aria-label": "Min" }, { "aria-label": "Max" }]}
        />,
      );
      const [lo] = getThumbs();
      expect(lo).toHaveAttribute("aria-valuemax", "80");
    });

    it("sets dynamic aria-valuemin on upper thumb", () => {
      render(
        <Slider
          min={0}
          max={100}
          defaultValue={[20, 80]}
          aria-label="Range"
          thumbs={[{ "aria-label": "Min" }, { "aria-label": "Max" }]}
        />,
      );
      const [, hi] = getThumbs();
      expect(hi).toHaveAttribute("aria-valuemin", "20");
    });

    it("wires aria-valuetext from thumb-level formatValue", () => {
      render(
        <Slider
          min={0}
          max={100}
          defaultValue={[10, 90]}
          aria-label="Range"
          thumbs={[
            { "aria-label": "Min", formatValue: (v) => `$${v}` },
            { "aria-label": "Max", formatValue: (v) => `$${v}` },
          ]}
        />,
      );
      const [lo, hi] = getThumbs();
      expect(lo).toHaveAttribute("aria-valuetext", "$10");
      expect(hi).toHaveAttribute("aria-valuetext", "$90");
    });

    it("wires aria-valuetext from root formatValue when no thumb-level override", () => {
      render(
        <Slider
          min={0}
          max={100}
          defaultValue={[10, 90]}
          aria-label="Range"
          formatValue={(v) => `${v}%`}
          thumbs={[{ "aria-label": "Min" }, { "aria-label": "Max" }]}
        />,
      );
      const [lo, hi] = getThumbs();
      expect(lo).toHaveAttribute("aria-valuetext", "10%");
      expect(hi).toHaveAttribute("aria-valuetext", "90%");
    });

    it("thumb buttons are rendered in stable DOM order", () => {
      render(
        <Slider
          min={0}
          max={100}
          defaultValue={[80, 20]}
          aria-label="Range"
          thumbs={[{ "aria-label": "First" }, { "aria-label": "Second" }]}
        />,
      );
      const thumbs = getThumbs();
      expect(thumbs[0]).toHaveAttribute("aria-label", "First");
      expect(thumbs[1]).toHaveAttribute("aria-label", "Second");
    });
  });

  // -------------------------------------------------------------------------
  // Keyboard contract — single-thumb
  // -------------------------------------------------------------------------

  describe("single-thumb keyboard", () => {
    it("ArrowRight increases value by step", () => {
      render(
        <Slider min={0} max={100} step={5} defaultValue={50} aria-label="Vol" />,
      );
      fireEvent.keyDown(getThumb(), { key: "ArrowRight" });
      expect(getThumb()).toHaveAttribute("aria-valuenow", "55");
    });

    it("ArrowUp increases value by step", () => {
      render(
        <Slider min={0} max={100} step={5} defaultValue={50} aria-label="Vol" />,
      );
      fireEvent.keyDown(getThumb(), { key: "ArrowUp" });
      expect(getThumb()).toHaveAttribute("aria-valuenow", "55");
    });

    it("ArrowLeft decreases value by step", () => {
      render(
        <Slider min={0} max={100} step={5} defaultValue={50} aria-label="Vol" />,
      );
      fireEvent.keyDown(getThumb(), { key: "ArrowLeft" });
      expect(getThumb()).toHaveAttribute("aria-valuenow", "45");
    });

    it("ArrowDown decreases value by step", () => {
      render(
        <Slider min={0} max={100} step={5} defaultValue={50} aria-label="Vol" />,
      );
      fireEvent.keyDown(getThumb(), { key: "ArrowDown" });
      expect(getThumb()).toHaveAttribute("aria-valuenow", "45");
    });

    it("PageUp increases value by largeStep", () => {
      render(
        <Slider
          min={0}
          max={100}
          step={1}
          largeStep={20}
          defaultValue={50}
          aria-label="Vol"
        />,
      );
      fireEvent.keyDown(getThumb(), { key: "PageUp" });
      expect(getThumb()).toHaveAttribute("aria-valuenow", "70");
    });

    it("PageDown decreases value by largeStep", () => {
      render(
        <Slider
          min={0}
          max={100}
          step={1}
          largeStep={20}
          defaultValue={50}
          aria-label="Vol"
        />,
      );
      fireEvent.keyDown(getThumb(), { key: "PageDown" });
      expect(getThumb()).toHaveAttribute("aria-valuenow", "30");
    });

    it("Home moves to min", () => {
      render(
        <Slider min={10} max={100} defaultValue={50} aria-label="Vol" />,
      );
      fireEvent.keyDown(getThumb(), { key: "Home" });
      expect(getThumb()).toHaveAttribute("aria-valuenow", "10");
    });

    it("End moves to max", () => {
      render(
        <Slider min={0} max={90} defaultValue={50} aria-label="Vol" />,
      );
      fireEvent.keyDown(getThumb(), { key: "End" });
      expect(getThumb()).toHaveAttribute("aria-valuenow", "90");
    });

    it("ArrowRight does not exceed max", () => {
      render(
        <Slider min={0} max={100} step={10} defaultValue={100} aria-label="Vol" />,
      );
      fireEvent.keyDown(getThumb(), { key: "ArrowRight" });
      expect(getThumb()).toHaveAttribute("aria-valuenow", "100");
    });

    it("ArrowLeft does not go below min", () => {
      render(
        <Slider min={0} max={100} step={10} defaultValue={0} aria-label="Vol" />,
      );
      fireEvent.keyDown(getThumb(), { key: "ArrowLeft" });
      expect(getThumb()).toHaveAttribute("aria-valuenow", "0");
    });

    it("does not respond to keys when disabled", () => {
      render(
        <Slider min={0} max={100} defaultValue={50} disabled aria-label="Vol" />,
      );
      fireEvent.keyDown(getThumb(), { key: "ArrowRight" });
      expect(getThumb()).toHaveAttribute("aria-valuenow", "50");
    });

    it("calls onValueChange with new value on ArrowRight", () => {
      const handler = vi.fn();
      render(
        <Slider
          min={0}
          max={100}
          step={5}
          defaultValue={50}
          aria-label="Vol"
          onValueChange={handler}
        />,
      );
      fireEvent.keyDown(getThumb(), { key: "ArrowRight" });
      expect(handler).toHaveBeenCalledWith(55);
    });
  });

  // -------------------------------------------------------------------------
  // Keyboard contract — range slider
  // -------------------------------------------------------------------------

  describe("range slider keyboard", () => {
    it("ArrowRight increases lower thumb", () => {
      render(
        <Slider
          min={0}
          max={100}
          step={5}
          defaultValue={[20, 80]}
          aria-label="Range"
          thumbs={[{ "aria-label": "Min" }, { "aria-label": "Max" }]}
        />,
      );
      fireEvent.keyDown(getThumb("Min"), { key: "ArrowRight" });
      expect(getThumb("Min")).toHaveAttribute("aria-valuenow", "25");
    });

    it("ArrowLeft decreases upper thumb", () => {
      render(
        <Slider
          min={0}
          max={100}
          step={5}
          defaultValue={[20, 80]}
          aria-label="Range"
          thumbs={[{ "aria-label": "Min" }, { "aria-label": "Max" }]}
        />,
      );
      fireEvent.keyDown(getThumb("Max"), { key: "ArrowLeft" });
      expect(getThumb("Max")).toHaveAttribute("aria-valuenow", "75");
    });

    it("Home on lower thumb moves to min", () => {
      render(
        <Slider
          min={10}
          max={100}
          defaultValue={[50, 80]}
          aria-label="Range"
          thumbs={[{ "aria-label": "Min" }, { "aria-label": "Max" }]}
        />,
      );
      fireEvent.keyDown(getThumb("Min"), { key: "Home" });
      expect(getThumb("Min")).toHaveAttribute("aria-valuenow", "10");
    });

    it("End on upper thumb moves to max", () => {
      render(
        <Slider
          min={0}
          max={90}
          defaultValue={[20, 50]}
          aria-label="Range"
          thumbs={[{ "aria-label": "Min" }, { "aria-label": "Max" }]}
        />,
      );
      fireEvent.keyDown(getThumb("Max"), { key: "End" });
      expect(getThumb("Max")).toHaveAttribute("aria-valuenow", "90");
    });

    it("calls onValueChange with tuple on ArrowRight on lower thumb", () => {
      const handler = vi.fn();
      render(
        <Slider
          min={0}
          max={100}
          step={5}
          defaultValue={[20, 80]}
          aria-label="Range"
          thumbs={[{ "aria-label": "Min" }, { "aria-label": "Max" }]}
          onValueChange={handler}
        />,
      );
      fireEvent.keyDown(getThumb("Min"), { key: "ArrowRight" });
      expect(handler).toHaveBeenCalledWith([25, 80]);
    });
  });

  // -------------------------------------------------------------------------
  // Thumb swap — keyboard
  // -------------------------------------------------------------------------

  describe("thumb swap — keyboard", () => {
    it("ArrowRight on lower thumb swaps when proposed crosses upper thumb value", () => {
      // Equal start + step=10: proposed=60 strictly crosses other=50 after sanitize
      render(
        <Slider
          min={0}
          max={100}
          step={10}
          defaultValue={[50, 50]}
          aria-label="Range"
          thumbs={[{ "aria-label": "Min" }, { "aria-label": "Max" }]}
        />,
      );
      fireEvent.keyDown(getThumb("Min"), { key: "ArrowRight" });
      // proposed = 60 > 50 → swap: slot0=50, slot1=60
      const [t0, t1] = getThumbs();
      expect(t0).toHaveAttribute("aria-valuenow", "50");
      expect(t1).toHaveAttribute("aria-valuenow", "60");
    });

    it("ArrowRight swap transfers focus to the upper thumb ref", () => {
      render(
        <Slider
          min={0}
          max={100}
          step={10}
          defaultValue={[50, 50]}
          aria-label="Range"
          thumbs={[{ "aria-label": "Min" }, { "aria-label": "Max" }]}
        />,
      );
      fireEvent.keyDown(getThumb("Min"), { key: "ArrowRight" });
      expect(document.activeElement).toBe(getThumb("Max"));
    });

    it("ArrowLeft on upper thumb swaps when proposed crosses lower thumb value", () => {
      // Equal start + step=10: proposed=40 strictly crosses other=50 after sanitize
      render(
        <Slider
          min={0}
          max={100}
          step={10}
          defaultValue={[50, 50]}
          aria-label="Range"
          thumbs={[{ "aria-label": "Min" }, { "aria-label": "Max" }]}
        />,
      );
      fireEvent.keyDown(getThumb("Max"), { key: "ArrowLeft" });
      // proposed = 40 < 50 → swap: slot0=40, slot1=50
      const [t0, t1] = getThumbs();
      expect(t0).toHaveAttribute("aria-valuenow", "40");
      expect(t1).toHaveAttribute("aria-valuenow", "50");
    });

    it("ArrowLeft swap transfers focus to the lower thumb ref", () => {
      render(
        <Slider
          min={0}
          max={100}
          step={10}
          defaultValue={[50, 50]}
          aria-label="Range"
          thumbs={[{ "aria-label": "Min" }, { "aria-label": "Max" }]}
        />,
      );
      fireEvent.keyDown(getThumb("Max"), { key: "ArrowLeft" });
      expect(document.activeElement).toBe(getThumb("Min"));
    });

    it("swap at equal values — ArrowRight advances then swaps", () => {
      render(
        <Slider
          min={0}
          max={100}
          step={1}
          defaultValue={[50, 50]}
          aria-label="Range"
          thumbs={[{ "aria-label": "Min" }, { "aria-label": "Max" }]}
        />,
      );
      fireEvent.keyDown(getThumb("Min"), { key: "ArrowRight" });
      // proposed=51 > other=50 → swap: slot0=50, slot1=51
      const [t0, t1] = getThumbs();
      expect(t0).toHaveAttribute("aria-valuenow", "50");
      expect(t1).toHaveAttribute("aria-valuenow", "51");
    });

    it("PageUp on lower thumb swaps when proposed crosses upper", () => {
      render(
        <Slider
          min={0}
          max={100}
          step={1}
          largeStep={10}
          defaultValue={[10, 15]}
          aria-label="Range"
          thumbs={[{ "aria-label": "Min" }, { "aria-label": "Max" }]}
        />,
      );
      fireEvent.keyDown(getThumb("Min"), { key: "PageUp" });
      // proposed=20 > other=15 → swap: slot0=15, slot1=20
      const [t0, t1] = getThumbs();
      expect(t0).toHaveAttribute("aria-valuenow", "15");
      expect(t1).toHaveAttribute("aria-valuenow", "20");
    });

    it("Home on upper thumb swaps when min is below lower thumb", () => {
      render(
        <Slider
          min={0}
          max={100}
          defaultValue={[30, 80]}
          aria-label="Range"
          thumbs={[{ "aria-label": "Min" }, { "aria-label": "Max" }]}
        />,
      );
      fireEvent.keyDown(getThumb("Max"), { key: "Home" });
      // proposed=0 < other=30 → swap: slot0=0, slot1=30
      const [t0, t1] = getThumbs();
      expect(t0).toHaveAttribute("aria-valuenow", "0");
      expect(t1).toHaveAttribute("aria-valuenow", "30");
    });

    it("End on lower thumb swaps when max is above upper thumb", () => {
      render(
        <Slider
          min={0}
          max={100}
          defaultValue={[20, 70]}
          aria-label="Range"
          thumbs={[{ "aria-label": "Min" }, { "aria-label": "Max" }]}
        />,
      );
      fireEvent.keyDown(getThumb("Min"), { key: "End" });
      // proposed=100 > other=70 → swap: slot0=70, slot1=100
      const [t0, t1] = getThumbs();
      expect(t0).toHaveAttribute("aria-valuenow", "70");
      expect(t1).toHaveAttribute("aria-valuenow", "100");
    });

    it("no swap when lower thumb ArrowRight does not cross upper", () => {
      render(
        <Slider
          min={0}
          max={100}
          step={5}
          defaultValue={[10, 80]}
          aria-label="Range"
          thumbs={[{ "aria-label": "Min" }, { "aria-label": "Max" }]}
        />,
      );
      fireEvent.keyDown(getThumb("Min"), { key: "ArrowRight" });
      const [t0, t1] = getThumbs();
      expect(t0).toHaveAttribute("aria-valuenow", "15");
      expect(t1).toHaveAttribute("aria-valuenow", "80");
    });

    it("onValueChange called with swapped tuple on swap", () => {
      const handler = vi.fn();
      render(
        <Slider
          min={0}
          max={100}
          step={10}
          defaultValue={[50, 50]}
          aria-label="Range"
          thumbs={[{ "aria-label": "Min" }, { "aria-label": "Max" }]}
          onValueChange={handler}
        />,
      );
      fireEvent.keyDown(getThumb("Min"), { key: "ArrowRight" });
      expect(handler).toHaveBeenCalledWith([50, 60]);
    });
  });

  // -------------------------------------------------------------------------
  // Thumb swap — pointer drag
  // -------------------------------------------------------------------------

  describe("thumb swap — pointer drag", () => {
    it("drag lower thumb past upper transfers capture and commits swapped tuple", () => {
      const handler = vi.fn();
      const { container } = render(
        <Slider
          min={0}
          max={100}
          defaultValue={[20, 60]}
          aria-label="Range"
          thumbs={[{ "aria-label": "Min" }, { "aria-label": "Max" }]}
          onValueChange={handler}
        />,
      );
      const track = container.querySelector(".artui-slider-track")!;
      const rect = { left: 0, top: 0, width: 100, height: 20, right: 100, bottom: 20 };
      vi.spyOn(track, "getBoundingClientRect").mockReturnValue(rect as DOMRect);

      const thumb0 = container.querySelectorAll(".artui-slider-thumb")[0] as HTMLElement;
      const thumb1 = container.querySelectorAll(".artui-slider-thumb")[1] as HTMLElement;

      const releaseSpy = vi.fn();
      const setSpy0 = vi.fn();
      const setSpy1 = vi.fn();
      thumb0.releasePointerCapture = releaseSpy;
      thumb0.setPointerCapture = setSpy0;
      thumb1.setPointerCapture = setSpy1;

      // Start drag on thumb0
      fireEvent.pointerDown(thumb0, { pointerId: 1, clientX: 20 });
      // Drag past the upper thumb (clientX=80 = value 80, crosses 60)
      fireEvent.pointerMove(thumb0, { pointerId: 1, clientX: 80 });

      expect(releaseSpy).toHaveBeenCalledWith(1);
      expect(setSpy1).toHaveBeenCalledWith(1);
      expect(handler).toHaveBeenCalledWith([60, 80]);
    });
  });

  // -------------------------------------------------------------------------
  // Dynamic valuemin/valuemax updates
  // -------------------------------------------------------------------------

  describe("dynamic valuemin/valuemax", () => {
    it("updates lower thumb aria-valuemax when upper thumb moves via keyboard", () => {
      render(
        <Slider
          min={0}
          max={100}
          step={10}
          defaultValue={[20, 80]}
          aria-label="Range"
          thumbs={[{ "aria-label": "Min" }, { "aria-label": "Max" }]}
        />,
      );
      fireEvent.keyDown(getThumb("Max"), { key: "ArrowLeft" });
      const [lo] = getThumbs();
      expect(lo).toHaveAttribute("aria-valuemax", "70");
    });

    it("updates upper thumb aria-valuemin when lower thumb moves via keyboard", () => {
      render(
        <Slider
          min={0}
          max={100}
          step={10}
          defaultValue={[20, 80]}
          aria-label="Range"
          thumbs={[{ "aria-label": "Min" }, { "aria-label": "Max" }]}
        />,
      );
      fireEvent.keyDown(getThumb("Min"), { key: "ArrowRight" });
      const [, hi] = getThumbs();
      expect(hi).toHaveAttribute("aria-valuemin", "30");
    });

    it("equal values: both thumbs get global min and max", () => {
      render(
        <Slider
          min={0}
          max={100}
          defaultValue={[50, 50]}
          aria-label="Range"
          thumbs={[{ "aria-label": "Min" }, { "aria-label": "Max" }]}
        />,
      );
      const [t0, t1] = getThumbs();
      expect(t0).toHaveAttribute("aria-valuemin", "0");
      expect(t0).toHaveAttribute("aria-valuemax", "50");
      expect(t1).toHaveAttribute("aria-valuemin", "0");
      expect(t1).toHaveAttribute("aria-valuemax", "50");
    });

    it("post-swap: bounds reflect new value ordering after swap", () => {
      render(
        <Slider
          min={0}
          max={100}
          step={10}
          defaultValue={[50, 50]}
          aria-label="Range"
          thumbs={[{ "aria-label": "Min" }, { "aria-label": "Max" }]}
        />,
      );
      fireEvent.keyDown(getThumb("Min"), { key: "ArrowRight" });
      // After swap: slot0=50, slot1=60 → t0Max=60, t1Min=50
      const [t0, t1] = getThumbs();
      expect(t0).toHaveAttribute("aria-valuemax", "60");
      expect(t1).toHaveAttribute("aria-valuemin", "50");
    });
  });

  // -------------------------------------------------------------------------
  // Controlled vs uncontrolled
  // -------------------------------------------------------------------------

  describe("controlled single-thumb", () => {
    it("reflects controlled value as aria-valuenow", () => {
      render(
        <Slider min={0} max={100} value={30} aria-label="Vol" onValueChange={() => {}} />,
      );
      expect(getThumb()).toHaveAttribute("aria-valuenow", "30");
    });

    it("does not update internal state on keypress in controlled mode", () => {
      const handler = vi.fn();
      const { rerender } = render(
        <Slider min={0} max={100} value={30} step={5} aria-label="Vol" onValueChange={handler} />,
      );
      fireEvent.keyDown(getThumb(), { key: "ArrowRight" });
      // value stays 30 until consumer calls rerender
      expect(getThumb()).toHaveAttribute("aria-valuenow", "30");
      // onValueChange called with new value
      expect(handler).toHaveBeenCalledWith(35);
      // consumer rerenders with new value
      rerender(
        <Slider min={0} max={100} value={35} step={5} aria-label="Vol" onValueChange={handler} />,
      );
      expect(getThumb()).toHaveAttribute("aria-valuenow", "35");
    });
  });

  describe("uncontrolled single-thumb", () => {
    it("initializes from defaultValue", () => {
      render(<Slider min={0} max={100} defaultValue={42} aria-label="Vol" />);
      expect(getThumb()).toHaveAttribute("aria-valuenow", "42");
    });

    it("updates aria-valuenow on key press without external state", () => {
      render(
        <Slider min={0} max={100} step={10} defaultValue={50} aria-label="Vol" />,
      );
      fireEvent.keyDown(getThumb(), { key: "ArrowRight" });
      expect(getThumb()).toHaveAttribute("aria-valuenow", "60");
    });
  });

  describe("controlled range", () => {
    it("reflects controlled range values", () => {
      render(
        <Slider
          min={0}
          max={100}
          value={[15, 85]}
          aria-label="Range"
          thumbs={[{ "aria-label": "Min" }, { "aria-label": "Max" }]}
          onValueChange={() => {}}
        />,
      );
      const [lo, hi] = getThumbs();
      expect(lo).toHaveAttribute("aria-valuenow", "15");
      expect(hi).toHaveAttribute("aria-valuenow", "85");
    });

    it("calls onValueChange with new tuple on keypress in controlled mode", () => {
      const handler = vi.fn();
      render(
        <Slider
          min={0}
          max={100}
          step={5}
          value={[20, 80]}
          aria-label="Range"
          thumbs={[{ "aria-label": "Min" }, { "aria-label": "Max" }]}
          onValueChange={handler}
        />,
      );
      fireEvent.keyDown(getThumb("Min"), { key: "ArrowRight" });
      expect(handler).toHaveBeenCalledWith([25, 80]);
    });
  });

  // -------------------------------------------------------------------------
  // Pointer interactions
  // -------------------------------------------------------------------------

  describe("pointer interactions", () => {
    it("track click on single slider calls onValueChange", () => {
      const handler = vi.fn();
      const { container } = render(
        <Slider
          min={0}
          max={100}
          defaultValue={50}
          aria-label="Vol"
          onValueChange={handler}
        />,
      );
      const track = container.querySelector(".artui-slider-track")!;
      const rect = { left: 0, top: 0, width: 200, height: 20, right: 200, bottom: 20 };
      vi.spyOn(track, "getBoundingClientRect").mockReturnValue(rect as DOMRect);

      fireEvent.pointerDown(track, { clientX: 100, clientY: 10 });
      expect(handler).toHaveBeenCalled();
    });

    it("pointerdown on thumb sets pointer capture", () => {
      const { container } = render(
        <Slider min={0} max={100} defaultValue={50} aria-label="Vol" />,
      );
      const thumb = container.querySelector(".artui-slider-thumb") as HTMLElement;
      const setCaptureSpy = vi.fn();
      thumb.setPointerCapture = setCaptureSpy;
      fireEvent.pointerDown(thumb, { pointerId: 1 });
      expect(setCaptureSpy).toHaveBeenCalledWith(1);
    });

    it("does not respond to track click when disabled", () => {
      const handler = vi.fn();
      const { container } = render(
        <Slider
          min={0}
          max={100}
          defaultValue={50}
          disabled
          aria-label="Vol"
          onValueChange={handler}
        />,
      );
      const track = container.querySelector(".artui-slider-track")!;
      fireEvent.pointerDown(track, { clientX: 100, clientY: 10 });
      expect(handler).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // Dev guards — overlay assertions
  //
  // withErrorOverlay wraps the element in:
  //   <span style="position:relative;display:inline-block">
  //     {element}
  //     <span aria-hidden="true" style="position:absolute;inset:0;background:#d62828;..." />
  //   </span>
  // We assert the inner <span aria-hidden="true"> is present as the overlay marker,
  // and console.error is called with the guard key (withErrorOverlay always calls it).
  // -------------------------------------------------------------------------

  describe("Slider:invalid-step guard", () => {
    it("renders the error overlay when step=0", () => {
      const { container } = render(
        <Slider min={0} max={100} step={0} defaultValue={50} aria-label="Vol" />,
      );
      expect(container.querySelector('span[aria-hidden="true"]')).toBeInTheDocument();
    });

    it("logs console.error with Slider:invalid-step when step=0", () => {
      render(
        <Slider min={0} max={100} step={0} defaultValue={50} aria-label="Vol" />,
      );
      const hit = errorSpy.mock.calls.find((c: unknown[]) =>
        String(c[0]).includes("Slider:invalid-step"),
      );
      expect(hit).toBeDefined();
    });

    it("renders the error overlay when step exceeds range", () => {
      const { container } = render(
        <Slider min={0} max={100} step={200} defaultValue={50} aria-label="Vol" />,
      );
      expect(container.querySelector('span[aria-hidden="true"]')).toBeInTheDocument();
    });

    it("does not render an overlay when step is valid", () => {
      const { container } = render(
        <Slider min={0} max={100} step={5} aria-label="Vol" />,
      );
      expect(container.querySelector('span[aria-hidden="true"]')).not.toBeInTheDocument();
    });
  });

  describe("Slider:value-out-of-range guard", () => {
    it("renders the error overlay when value > max", () => {
      const { container } = render(
        <Slider min={0} max={100} value={150} aria-label="Vol" onValueChange={() => {}} />,
      );
      expect(container.querySelector('span[aria-hidden="true"]')).toBeInTheDocument();
    });

    it("logs console.error with Slider:value-out-of-range when value > max", () => {
      render(
        <Slider min={0} max={100} value={150} aria-label="Vol" onValueChange={() => {}} />,
      );
      const hit = errorSpy.mock.calls.find((c: unknown[]) =>
        String(c[0]).includes("Slider:value-out-of-range"),
      );
      expect(hit).toBeDefined();
    });

    it("renders the error overlay when value < min", () => {
      const { container } = render(
        <Slider min={10} max={100} value={5} aria-label="Vol" onValueChange={() => {}} />,
      );
      expect(container.querySelector('span[aria-hidden="true"]')).toBeInTheDocument();
    });

    it("renders the error overlay when defaultValue > max", () => {
      const { container } = render(
        <Slider min={0} max={100} defaultValue={120} aria-label="Vol" />,
      );
      expect(container.querySelector('span[aria-hidden="true"]')).toBeInTheDocument();
    });

    it("logs console.error with Slider:value-out-of-range when defaultValue > max", () => {
      render(
        <Slider min={0} max={100} defaultValue={120} aria-label="Vol" />,
      );
      const hit = errorSpy.mock.calls.find((c: unknown[]) =>
        String(c[0]).includes("Slider:value-out-of-range"),
      );
      expect(hit).toBeDefined();
    });

    it("renders the error overlay when defaultValue < min", () => {
      const { container } = render(
        <Slider min={10} max={100} defaultValue={5} aria-label="Vol" />,
      );
      expect(container.querySelector('span[aria-hidden="true"]')).toBeInTheDocument();
    });

    it("does not render an overlay when value is in range", () => {
      const { container } = render(
        <Slider min={0} max={100} value={50} aria-label="Vol" onValueChange={() => {}} />,
      );
      expect(container.querySelector('span[aria-hidden="true"]')).not.toBeInTheDocument();
    });

    it("clamps out-of-range value silently in the rendered thumb", () => {
      render(
        <Slider min={0} max={100} value={150} aria-label="Vol" onValueChange={() => {}} />,
      );
      expect(getThumb()).toHaveAttribute("aria-valuenow", "100");
    });

    it("renders the error overlay when range value[0] < min", () => {
      const { container } = render(
        <Slider
          min={10}
          max={100}
          value={[5, 80]}
          aria-label="Range"
          thumbs={[{ "aria-label": "Min" }, { "aria-label": "Max" }]}
          onValueChange={() => {}}
        />,
      );
      expect(container.querySelector('span[aria-hidden="true"]')).toBeInTheDocument();
    });

    it("logs console.error with Slider:value-out-of-range when range value[0] < min", () => {
      render(
        <Slider
          min={10}
          max={100}
          value={[5, 80]}
          aria-label="Range"
          thumbs={[{ "aria-label": "Min" }, { "aria-label": "Max" }]}
          onValueChange={() => {}}
        />,
      );
      const hit = errorSpy.mock.calls.find((c: unknown[]) =>
        String(c[0]).includes("Slider:value-out-of-range"),
      );
      expect(hit).toBeDefined();
    });

    it("renders the error overlay when range defaultValue[1] > max", () => {
      const { container } = render(
        <Slider
          min={0}
          max={100}
          defaultValue={[20, 120]}
          aria-label="Range"
          thumbs={[{ "aria-label": "Min" }, { "aria-label": "Max" }]}
        />,
      );
      expect(container.querySelector('span[aria-hidden="true"]')).toBeInTheDocument();
    });

    it("logs console.error with Slider:value-out-of-range when range defaultValue[1] > max", () => {
      render(
        <Slider
          min={0}
          max={100}
          defaultValue={[20, 120]}
          aria-label="Range"
          thumbs={[{ "aria-label": "Min" }, { "aria-label": "Max" }]}
        />,
      );
      const hit = errorSpy.mock.calls.find((c: unknown[]) =>
        String(c[0]).includes("Slider:value-out-of-range"),
      );
      expect(hit).toBeDefined();
    });
  });

  describe("Slider:range-without-group-name guard", () => {
    it("renders the error overlay when range slider has no aria-label or aria-labelledby", () => {
      const { container } = render(
        <Slider
          min={0}
          max={100}
          thumbs={[{ "aria-label": "Min" }, { "aria-label": "Max" }]}
        />,
      );
      expect(container.querySelector('span[aria-hidden="true"]')).toBeInTheDocument();
    });

    it("logs console.error with Slider:range-without-group-name when no label set", () => {
      render(
        <Slider
          min={0}
          max={100}
          thumbs={[{ "aria-label": "Min" }, { "aria-label": "Max" }]}
        />,
      );
      const hit = errorSpy.mock.calls.find((c: unknown[]) =>
        String(c[0]).includes("Slider:range-without-group-name"),
      );
      expect(hit).toBeDefined();
    });

    it("logs console.error (no overlay) when aria-labelledby points to nonexistent element", () => {
      // The DOM-id check must run in useEffect because sibling elements in the
      // same render batch are not committed yet; an overlay cannot be shown
      // at render time without false-positiving on sibling ids.
      render(
        <Slider
          min={0}
          max={100}
          aria-labelledby="does-not-exist"
          thumbs={[{ "aria-label": "Min" }, { "aria-label": "Max" }]}
        />,
      );
      const hit = errorSpy.mock.calls.find((c: unknown[]) =>
        String(c[0]).includes("Slider:range-without-group-name") &&
        String(c[0]).includes("does-not-exist"),
      );
      expect(hit).toBeDefined();
    });

    it("does not render an overlay when aria-label is set", () => {
      const { container } = render(
        <Slider
          min={0}
          max={100}
          aria-label="Range"
          thumbs={[{ "aria-label": "Min" }, { "aria-label": "Max" }]}
        />,
      );
      expect(container.querySelector('span[aria-hidden="true"]')).not.toBeInTheDocument();
    });

    it("does not render an overlay when aria-labelledby resolves to an existing element", () => {
      const { container } = render(
        <div>
          <span id="range-lbl">Price range</span>
          <Slider
            min={0}
            max={100}
            aria-labelledby="range-lbl"
            thumbs={[{ "aria-label": "Min" }, { "aria-label": "Max" }]}
          />
        </div>,
      );
      expect(container.querySelector('span[aria-hidden="true"]')).not.toBeInTheDocument();
    });
  });

  describe("Slider:multi-without-thumb-names guard", () => {
    it("renders the error overlay when a thumb has no accessible name (JS bypass)", () => {
      const { container } = render(
        <Slider
          min={0}
          max={100}
          aria-label="Range"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          thumbs={[{} as any, { "aria-label": "Max" }]}
        />,
      );
      expect(container.querySelector('span[aria-hidden="true"]')).toBeInTheDocument();
    });

    it("logs console.error with Slider:multi-without-thumb-names", () => {
      render(
        <Slider
          min={0}
          max={100}
          aria-label="Range"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          thumbs={[{} as any, { "aria-label": "Max" }]}
        />,
      );
      const hit = errorSpy.mock.calls.find((c: unknown[]) =>
        String(c[0]).includes("Slider:multi-without-thumb-names"),
      );
      expect(hit).toBeDefined();
    });

    it("does not render an overlay when both thumbs have names", () => {
      const { container } = render(
        <Slider
          min={0}
          max={100}
          aria-label="Range"
          thumbs={[{ "aria-label": "Min" }, { "aria-label": "Max" }]}
        />,
      );
      expect(container.querySelector('span[aria-hidden="true"]')).not.toBeInTheDocument();
    });
  });

  describe("Slider:thumb-count-mismatch guard", () => {
    it("renders the error overlay when range value array has wrong length", () => {
      const { container } = render(
        <Slider
          min={0}
          max={100}
          aria-label="Range"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          value={[10, 50, 90] as any}
          thumbs={[{ "aria-label": "Min" }, { "aria-label": "Max" }]}
          onValueChange={() => {}}
        />,
      );
      expect(container.querySelector('span[aria-hidden="true"]')).toBeInTheDocument();
    });

    it("logs console.error with Slider:thumb-count-mismatch", () => {
      render(
        <Slider
          min={0}
          max={100}
          aria-label="Range"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          value={[10, 50, 90] as any}
          thumbs={[{ "aria-label": "Min" }, { "aria-label": "Max" }]}
          onValueChange={() => {}}
        />,
      );
      const hit = errorSpy.mock.calls.find((c: unknown[]) =>
        String(c[0]).includes("Slider:thumb-count-mismatch"),
      );
      expect(hit).toBeDefined();
    });
  });

  // -------------------------------------------------------------------------
  // Guard dedup — console.error fires once, overlay still renders on re-render
  // -------------------------------------------------------------------------

  describe("guard deduplication", () => {
    it("Slider:range-without-group-name logs console.error only once across re-renders", () => {
      const { rerender } = render(
        <Slider
          min={0}
          max={100}
          thumbs={[{ "aria-label": "Min" }, { "aria-label": "Max" }]}
        />,
      );
      rerender(
        <Slider
          min={0}
          max={100}
          thumbs={[{ "aria-label": "Min" }, { "aria-label": "Max" }]}
        />,
      );
      const hits = errorSpy.mock.calls.filter((c: unknown[]) =>
        String(c[0]).includes("Slider:range-without-group-name"),
      );
      // withErrorOverlay deduplicates via the reported Set — console.error fires exactly once.
      expect(hits).toHaveLength(1);
    });

    it("overlay is still rendered on re-render after first log", () => {
      const { rerender, container } = render(
        <Slider
          min={0}
          max={100}
          thumbs={[{ "aria-label": "Min" }, { "aria-label": "Max" }]}
        />,
      );
      rerender(
        <Slider
          min={0}
          max={100}
          thumbs={[{ "aria-label": "Min" }, { "aria-label": "Max" }]}
        />,
      );
      expect(container.querySelector('span[aria-hidden="true"]')).toBeInTheDocument();
    });
  });
});
