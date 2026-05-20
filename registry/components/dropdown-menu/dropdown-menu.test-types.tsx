/**
 * Type-only test file. Run with `tsc --noEmit` — the @ts-expect-error lines
 * MUST be errors. If TypeScript ever stops flagging them, the safety net
 * is broken and this file fails to compile.
 */

import type { ReactNode } from "react";

import { DropdownMenu } from "./dropdown-menu";

const noop = () => {};

export function ValidUses(): ReactNode {
  return (
    <>
      {/* Trigger with visible text children */}
      <DropdownMenu>
        <DropdownMenu.Trigger>Account</DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item onSelect={noop}>Profile</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>

      {/* Trigger with aria-label */}
      <DropdownMenu>
        <DropdownMenu.Trigger aria-label="User menu">
          {undefined}
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item onSelect={noop}>Profile</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>

      {/* Trigger with aria-labelledby */}
      <DropdownMenu>
        <DropdownMenu.Trigger aria-labelledby="external-label">
          {undefined}
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item onSelect={noop}>Profile</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>

      {/* SubTrigger with visible text */}
      <DropdownMenu>
        <DropdownMenu.Trigger>Menu</DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger>Preferences</DropdownMenu.SubTrigger>
            <DropdownMenu.SubContent>
              <DropdownMenu.Item onSelect={noop}>Light</DropdownMenu.Item>
            </DropdownMenu.SubContent>
          </DropdownMenu.Sub>
        </DropdownMenu.Content>
      </DropdownMenu>
    </>
  );
}

export function InvalidTriggerUses(): ReactNode {
  return (
    <>
      {/* @ts-expect-error no accessible name source on Trigger */}
      <DropdownMenu.Trigger />

      {/* @ts-expect-error children and aria-label are mutually exclusive */}
      <DropdownMenu.Trigger aria-label="User menu">Account</DropdownMenu.Trigger>
    </>
  );
}

export function InvalidSubTriggerUses(): ReactNode {
  return (
    <>
      {/* @ts-expect-error no accessible name source on SubTrigger */}
      <DropdownMenu.SubTrigger />
    </>
  );
}

export function InvalidItemUses(): ReactNode {
  return (
    <>
      {/* @ts-expect-error onSelect is required on Item */}
      <DropdownMenu.Item>Profile</DropdownMenu.Item>
    </>
  );
}
