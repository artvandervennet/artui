---
name: aria-hidden-decorative-display
description: Pattern for opt-in visual value display that is purely decorative — all spans carry aria-hidden="true" because ARIA attributes already announce the values
metadata:
  type: feedback
---

When adding opt-in visual text that mirrors what ARIA already announces (e.g., `aria-valuenow`/`aria-valuetext` on a slider thumb), all visual spans must be `aria-hidden="true"`. This prevents double-announcement to screen readers.

**Why:** WAI-ARIA spec: aria-valuenow and aria-valuetext on role=slider are the authoritative channel. Adding visible text without aria-hidden causes screen readers to read the value twice.

**How to apply:** Any `showValues`-style prop that renders visible text from an aria source must mark every rendered text node `aria-hidden="true"`. Gate the feature with a `data-show-values="true"` attribute on the root so CSS can scope padding/layout only when active. Tests should assert `aria-hidden` on each new element class explicitly.

**Exemplified in:** `registry/components/slider/slider.tsx` — `showValues` prop renders `.artui-slider-min`, `.artui-slider-max`, `.artui-slider-value` spans, all with `aria-hidden="true"`. CSS activates layout padding via `[data-show-values="true"]` selector.
