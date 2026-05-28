/**
 * Type-only test file. Run with `tsc --noEmit`: the @ts-expect-error lines
 * MUST be errors. If TypeScript ever stops flagging them, the safety net
 * is broken and this file fails to compile (because @ts-expect-error
 * without an error is itself an error).
 *
 * This file proves the §1.4.2 "fouten onmogelijk maken" claim.
 */

import type { ReactNode } from 'react';

import { Image } from './image';

export function ValidUses(): ReactNode {
  return (
    <>
      {/* Real alt text: fine. */}
      <Image src="/x.jpg" alt="Engineering team photo from May 2026" />

      {/* Explicit decorative opt-out: fine. */}
      <Image src="/x.jpg" decorative />
    </>
  );
}

export function InvalidUses(): ReactNode {
  return (
    <>
      {/* @ts-expect-error placeholder alt text is rejected at compile time */}
      <Image src="/x.jpg" alt="image" />

      {/* @ts-expect-error placeholder alt text is rejected at compile time */}
      <Image src="/x.jpg" alt="photo" />

      {/* @ts-expect-error empty alt without `decorative` is ambiguous */}
      <Image src="/x.jpg" alt="" />

      {/* @ts-expect-error alt is required when not decorative */}
      <Image src="/x.jpg" />

      {/* @ts-expect-error alt and decorative are mutually exclusive */}
      <Image src="/x.jpg" alt="Real text" decorative />
    </>
  );
}
