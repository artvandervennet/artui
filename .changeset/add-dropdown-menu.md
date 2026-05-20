---
"@artui/registry": minor
"@artui/cli": minor
---

Add DropdownMenu component — accessible dropdown following the WAI-ARIA APG Menu Button pattern with single-level submenus, full keyboard contract (arrows, Home/End, typeahead, Escape, ArrowRight/Left for sub-menus), compile-time accessible name enforcement via AccessibleNameProps, and five dev-overlay runtime guards.

Fix Dialog NVDA blank-read bug — the Dialog component previously unmounted its native `<dialog>` element while it was still in `showModal()` modal state, causing NVDA's virtual buffer to get stranded with no content to read. The `<dialog>` is now always kept in the DOM; `.close()` is called via a dedicated close-transition effect before any unmount can occur.
