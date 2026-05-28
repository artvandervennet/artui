/**
 * Type-only test file. Run with `tsc --noEmit`: the @ts-expect-error lines
 * MUST be errors. If TypeScript ever stops flagging them, the safety net
 * is broken and this file fails to compile.
 */

import type { ReactNode } from 'react';

import { Datepicker } from './datepicker';

const noop = () => {};

export function ValidUses(): ReactNode {
  return (
    <>
      {/* Visible label: fine. */}
      <Datepicker label="Date of birth" value={null} onChange={noop} />

      {/* Non-visible aria-label: fine. */}
      <Datepicker aria-label="Date of birth" value={null} onChange={noop} />

      {/* Reference to another element's id: fine. */}
      <Datepicker aria-labelledby="external-label-id" value={null} onChange={noop} />
    </>
  );
}

export function InvalidUses(): ReactNode {
  return (
    <>
      {/* @ts-expect-error no label source at all: must provide label, aria-label, or aria-labelledby */}
      <Datepicker value={null} onChange={noop} />

      {/*
        NOTE: label="" is NOT a compile error here because AccessibleText without a generic
        parameter resolves to string. The empty-string case is caught at runtime by the
        dev overlay. Only literal string values via a generic function (like Image) get
        compile-time rejection.
      */}

      {/* @ts-expect-error two label sources at once: mutually exclusive */}
      <Datepicker label="Date of birth" aria-label="Date of birth" value={null} onChange={noop} />

      {/* @ts-expect-error label and aria-labelledby together: mutually exclusive */}
      <Datepicker label="Date of birth" aria-labelledby="external-id" value={null} onChange={noop} />
    </>
  );
}
