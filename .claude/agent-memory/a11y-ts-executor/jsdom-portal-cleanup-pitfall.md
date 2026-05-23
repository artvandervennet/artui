---
name: jsdom-portal-cleanup-pitfall
description: RTL cleanup unmounts portals; manual DOM removal in afterEach causes "not a child" errors
metadata:
  type: feedback
---

When React portals (createPortal to document.body) are used, RTL's automatic `cleanup()` in `afterEach` already removes the portal DOM nodes. If `afterEach` also runs `document.querySelectorAll("[...]").forEach(el => el.remove())` on those nodes, jsdom throws "The node to be removed is not a child of this node", failing every test.

**Why:** RTL cleanup calls unmount which triggers React's portal cleanup synchronously. The manual DOM removal runs after, finds the nodes already gone.

**How to apply:** Never manually remove portal DOM nodes in `afterEach`. Let RTL cleanup handle it. Only manually remove nodes if the component is not unmounted by RTL.
