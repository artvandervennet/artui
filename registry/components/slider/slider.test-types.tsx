/**
 * Type-only test file. Run with `tsc --noEmit`: the @ts-expect-error lines
 * MUST produce errors. If TypeScript ever stops flagging them, the safety net
 * is broken and this file fails to compile.
 */

import type { ReactNode } from "react";

import { Slider } from "./slider";

const noop = () => {};

export function ValidUses(): ReactNode {
  return (
    <>
      {/* Single-thumb with aria-label */}
      <Slider
        min={0}
        max={100}
        aria-label="Volume"
        onValueChange={noop}
      />

      {/* Single-thumb with aria-labelledby */}
      <Slider
        min={0}
        max={100}
        aria-labelledby="volume-label"
        onValueChange={noop}
      />

      {/* Single-thumb with formatValue */}
      <Slider
        min={0}
        max={1000}
        step={10}
        defaultValue={250}
        aria-label="Maximum price"
        formatValue={(v) => `€${v}`}
        onValueChange={noop}
      />

      {/* Single-thumb vertical */}
      <Slider
        min={0}
        max={100}
        orientation="vertical"
        aria-label="Volume"
        onValueChange={noop}
      />

      {/* Single-thumb controlled */}
      <Slider
        min={0}
        max={100}
        value={50}
        aria-label="Volume"
        onValueChange={noop}
      />

      {/* Range slider with aria-label on group + per-thumb aria-labels */}
      <Slider
        min={0}
        max={1000}
        step={10}
        defaultValue={[100, 750]}
        aria-label="Price range"
        thumbs={[
          { "aria-label": "Minimum price" },
          { "aria-label": "Maximum price" },
        ]}
        onValueChange={noop}
      />

      {/* Range slider with aria-labelledby */}
      <Slider
        min={0}
        max={100}
        aria-labelledby="range-label"
        thumbs={[
          { "aria-label": "From" },
          { "aria-label": "To" },
        ]}
        onValueChange={noop}
      />

      {/* Range slider with children as accessible name on thumbs */}
      <Slider
        min={0}
        max={100}
        aria-label="Date range"
        thumbs={[
          { children: "Start date" },
          { children: "End date" },
        ]}
        onValueChange={noop}
      />

      {/* Range slider with thumb-level formatValue overrides */}
      <Slider
        min={0}
        max={100}
        aria-label="Budget"
        thumbs={[
          { "aria-label": "Min", formatValue: (v) => `$${v}` },
          { "aria-label": "Max", formatValue: (v) => `$${v}` },
        ]}
        onValueChange={noop}
      />
    </>
  );
}

export function InvalidUses(): ReactNode {
  return (
    <>
      {/* @ts-expect-error single-thumb with no accessible name */}
      <Slider min={0} max={100} onValueChange={noop} />

      {/* thumbs slot with empty descriptors: error is on the thumbs prop itself */}
      <Slider
        min={0}
        max={100}
        aria-label="Range"
        // @ts-expect-error empty objects don't satisfy SliderThumbDescriptor (AccessibleNameProps required)
        thumbs={[{}, {}]}
        onValueChange={noop}
      />

      {/* Second thumb has no accessible name: error on the thumbs prop line */}
      <Slider
        min={0}
        max={100}
        aria-label="Range"
        // @ts-expect-error second thumb {} does not satisfy SliderThumbDescriptor
        thumbs={[{ "aria-label": "Min" }, {}]}
        onValueChange={noop}
      />

      {/* preventCrossing was removed; only swap behavior exists */}
      <Slider
        min={0}
        max={100}
        aria-label="Range"
        thumbs={[{ "aria-label": "Min" }, { "aria-label": "Max" }]}
        // @ts-expect-error preventCrossing was removed; only swap behavior exists
        preventCrossing={false}
        onValueChange={noop}
      />
    </>
  );
}
