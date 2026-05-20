---
name: feedback-dialog-modal-always-mounted
description: Native <dialog> with showModal() must never be conditionally unmounted; always keep it in the DOM and use .close() before any unmount
metadata:
  type: feedback
---

Never conditionally unmount a `<dialog>` element that was opened with `showModal()`. If React removes the element from the DOM while it is in modal state, the browser's top-layer session is abandoned without a proper close signal. NVDA (and JAWS) leave their virtual buffers locked to the vanished modal context and report blank for all subsequent page content.

**Why:** NVDA bug report on artui feat/13 branch — Dialog was using `if (!open) return null` which removed the `<dialog>` before the useEffect cleanup could call `dialog.close()`. All page content read as blank after the dialog was closed.

**How to apply:**
- Any component that calls `showModal()` must always render its `<dialog>` element.
- Control visibility exclusively through `.showModal()` / `.close()` (the native `open` attribute).
- A closed `<dialog>` (no `open` attribute) is already `display:none` per the UA stylesheet — AT-invisible, no extra CSS needed.
- Split open/close into two separate effects:
  - Effect A (open=true): calls `showModal()`, wires listeners. Cleanup only removes listeners.
  - Effect B (open=false): calls `dialog.close()`, then restores focus. This fires while the element is still in the DOM.
- The same principle applies to `datepicker.tsx` which also uses `showModal()` — check it for the same pattern if issues arise.

See also: [[project-registry-build-auto]]
