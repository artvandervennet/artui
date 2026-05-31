---
name: dom-order-tab-order-pattern
description: DOM order governs tab/focus order; CSS `order` governs visual paint only — use this to fix tab-order bugs without changing visual layout.
metadata:
  type: feedback
---

Tab/focus order follows DOM source order, not CSS visual order. When a component has interactive elements that must be reached in a specific tab sequence (e.g., trigger button before chip remove buttons), place them first in the DOM, then use CSS `order` on sibling flex children to restore the intended visual layout.

Implemented in `registry/components/select/select.tsx` Control: `.artui-select-actions` (containing the trigger) is rendered before `.artui-select-field` (containing chips) in DOM, then `.artui-select-field` gets `order: 2` and `.artui-select-actions` gets `order: 3` in CSS so the field appears visually on the left and actions on the right.

**Why:** WCAG 2.1.1 / 2.4.3 require focus order to match logical reading/interaction order. The main control (trigger) must be the first tab stop, not interior chip remove buttons.

**How to apply:** Whenever a flex/grid layout has interactive children whose visual position disagrees with the desired focus sequence, reorder the DOM for focus correctness and use CSS `order` to re-establish visual layout. Never rely on visual order alone for tab sequence.
