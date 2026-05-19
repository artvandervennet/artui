---
name: feedback-lint-eslint-disable-placement
description: eslint-disable-next-line must be the line immediately before the flagged JSX element — intervening comment lines shift the target and the directive misfires
metadata:
  type: feedback
---

`eslint-disable-next-line` applies to the very next line in the file. If a NOTE comment is placed between the directive and the flagged JSX element, the directive suppresses the comment line, not the element, and the error still fires.

**Why:** Encountered when suppressing `jsx-a11y/no-noninteractive-element-interactions` and `jsx-a11y/click-events-have-key-events` on the `<dialog>` element in `dialog.tsx`. The NOTE comment was placed after the directive, causing it to misfire.

**How to apply:** Always structure as:
```
// NOTE: explanation...
// eslint-disable-next-line rule-name
<element>
```
Never:
```
// eslint-disable-next-line rule-name
// NOTE: explanation
<element>   ← directive does NOT apply here
```
