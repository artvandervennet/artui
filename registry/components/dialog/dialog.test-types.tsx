/**
 * Type-only test file. Run with `tsc --noEmit` — the @ts-expect-error lines
 * MUST be errors. If TypeScript ever stops flagging them, the safety net
 * is broken and this file fails to compile.
 */

import type { ReactNode } from "react";

import { Dialog } from "./dialog";

const noop = () => {};

export function ValidUses(): ReactNode {
  return (
    <>
      {/* title prop — visible h2 heading */}
      <Dialog open onClose={noop} title="Confirm deletion">
        <p>Are you sure?</p>
      </Dialog>

      {/* aria-labelledby referencing an external element */}
      <Dialog open onClose={noop} aria-labelledby="external-heading">
        <p>Content</p>
      </Dialog>

      {/* With optional description */}
      <Dialog
        open
        onClose={noop}
        title="Settings"
        description="Adjust your preferences."
      >
        <p>Content</p>
      </Dialog>
    </>
  );
}

export function InvalidUses(): ReactNode {
  return (
    <>
      {/* @ts-expect-error no label source — must provide title or aria-labelledby */}
      <Dialog open onClose={noop}>
        <p>Content</p>
      </Dialog>

      {/* @ts-expect-error title and aria-labelledby together — mutually exclusive */}
      <Dialog open onClose={noop} title="Heading" aria-labelledby="external">
        <p>Content</p>
      </Dialog>
    </>
  );
}
