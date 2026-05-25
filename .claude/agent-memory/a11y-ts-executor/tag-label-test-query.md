---
name: tag-label-test-query
description: When always-mounted content duplicates visible text, query tag labels via CSS class not getByText
metadata:
  type: feedback
---

With always-mounted Content, option labels appear in both the tag list AND the hidden listbox. `screen.getByText("Belgium")` throws "found multiple elements".

Use a CSS class query instead:

```typescript
// Instead of: screen.getByText("Belgium")
expect(document.querySelector(".artui-multiselect-tag-label")?.textContent).toBe("Belgium");
```

Or use `getAllByText` and assert on the first element.

**Why:** Always-mounting Content means text content exists in two DOM nodes simultaneously (tag label + hidden option label).

**How to apply:** Any test asserting on tag/badge label text in a component that uses the always-mounted-content pattern.

Related: [[always-mounted-content-pattern]]
