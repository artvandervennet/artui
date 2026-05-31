---
name: disabled-summary-tabindex
description: Disabled <summary> elements must have tabIndex=-1 explicitly; native default is 0 which keeps them in the tab order and causes AT to read the wrong item context
metadata:
  type: feedback
---

`<summary>` elements are natively focusable with an implicit `tabIndex=0`. When a summary is disabled with `aria-disabled="true"`, the element stays in the tab order unless `tabIndex={-1}` is set explicitly.

The symptom: a screen reader user pressing Tab lands on the disabled summary, but AT resolves context from the previously focused (enabled) item, announcing the wrong item's name and state. This was confirmed in the artui Accordion component (accordion.tsx ~467-479).

The fix: `tabIndex={disabled ? -1 : 0}` on the summary. The explicit `0` on the enabled path is important — without it, removing the attribute leaves the element still focusable but removes the explicit anchor for tests that assert `tabIndex=0`.

Arrow-key navigation (handleKeyDown) already filters `:not([aria-disabled='true'])` — that filter and the tabIndex fix are complementary. Tab and arrows must both skip disabled items consistently.

**Why:** Without tabIndex=-1, disabled items are reachable by Tab, creating two problems: (1) the AT naming bug described above, (2) the APG accordion pattern's tab order contract (Tab moves through content, Arrow moves between headers) is violated because a non-interactive header appears as a tab stop.

**How to apply:** Any disclosure/accordion pattern with disabled trigger elements must explicitly set `tabIndex={-1}` on those elements — do not rely on `aria-disabled` alone to remove a disabled element from the tab order. `aria-disabled` is advisory only.

Related: [[jsdom details toggle pitfall]]
