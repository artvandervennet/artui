---
name: fake-timers-matchmedia-stub
description: jsdom lacks matchMedia; must stub before render when using vi.useFakeTimers()
metadata:
  type: feedback
---

jsdom does not implement `window.matchMedia`. Any component that calls `window.matchMedia(...)` in a `useEffect` will throw "window.matchMedia is not a function" in tests.

Stub pattern:
```ts
function stubMatchMedia(matches = false) {
  const mq = {
    matches,
    media: "(prefers-reduced-motion: reduce)",
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: () => false as const,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
  };
  vi.stubGlobal("matchMedia", () => mq);
  return mq;
}
```

Call `stubMatchMedia()` in `beforeEach` and `vi.unstubAllGlobals()` in `afterEach`.

To test "reduced motion active on mount", call `vi.unstubAllGlobals()` then `stubMatchMedia(true)` at the top of that specific test.

**Why:** The component registers a `matchMedia` listener on mount for `prefers-reduced-motion`. If the stub isn't in place before render, the effect throws immediately.

**How to apply:** Add the stub in `beforeEach` for any component that reads media queries.
