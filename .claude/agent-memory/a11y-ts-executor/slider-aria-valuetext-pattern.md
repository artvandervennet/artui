---
name: slider-aria-valuetext-pattern
description: Slider wires aria-valuetext automatically from formatValue — thumb-level formatValue overrides root-level; test with toHaveAttribute
metadata:
  type: project
---

The Slider component wires `aria-valuetext` from `formatValue` automatically. Root-level `formatValue(value, thumbIndex)` applies to all thumbs; `SliderThumbDescriptor.formatValue(value)` overrides per-thumb. The priority order is: thumb formatValue > root formatValue > no aria-valuetext. Tests verify with `toHaveAttribute("aria-valuetext", ...)`.

**Why:** The thesis found that most libraries fail to wire aria-valuetext automatically — artui's design closes this gap by making it opt-in via a single prop rather than requiring the author to know about the ARIA attribute.

**How to apply:** When implementing future slider-like components (color pickers, volume controls), use the same pattern: a root `formatValue` prop that automatically wires to the ARIA attribute.
