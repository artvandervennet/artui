---
name: fake-timers-useraction-timeout
description: userEvent hangs with vi.useFakeTimers(); use fireEvent for click interactions in timer tests
metadata:
  type: feedback
---

`userEvent.setup()` uses internal scheduling (setTimeout/pointer events) that conflicts with `vi.useFakeTimers()`, causing async tests to hang for 5s until timeout.

Even `userEvent.setup({ advanceTimers: vi.advanceTimersByTime })` can deadlock when combined with `vi.runAllTimers()` in the same test.

**Solution:** In tests that use `vi.useFakeTimers()`, replace `await user.click(el)` with a synchronous helper:
```ts
function click(el: HTMLElement) {
  act(() => { fireEvent.click(el); });
}
```

Use real timers (`vi.useRealTimers()`) only when testing actual async behavior (like `done` Promise resolution) where timer precision matters.

**Why:** `userEvent` dispatches synthetic pointer/keyboard events asynchronously using setTimeout. When timers are faked, these internal timeouts never advance unless manually advanced — but the test runner waits for the Promise to resolve, which never happens.

**How to apply:** Default to `fireEvent` + `act(() => { vi.runAllTimers(); })` for all fake-timer tests. Reserve `userEvent` for real-timer tests (Tab navigation, actual keyboard sequences).
