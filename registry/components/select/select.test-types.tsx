/**
 * Type-only test file. Run with `tsc --noEmit` — the @ts-expect-error lines
 * MUST produce errors. If TypeScript ever stops flagging them, the safety net
 * is broken and this file fails to compile.
 */

import type { ReactNode } from "react";

import { Select } from "./select";

const noop = () => {};

export function ValidMultiUses(): ReactNode {
  return (
    <>
      {/* Multi: Control with aria-label */}
      <Select multiple onValueChange={noop}>
        <Select.Control aria-label="Countries" />
        <Select.Content>
          <Select.Option value="be">Belgium</Select.Option>
        </Select.Content>
      </Select>

      {/* Multi: Control with aria-labelledby */}
      <Select multiple onValueChange={noop}>
        <Select.Control aria-labelledby="external-label" />
        <Select.Content>
          <Select.Option value="be">Belgium</Select.Option>
        </Select.Content>
      </Select>

      {/* Multi: Control with visible text children */}
      <Select multiple onValueChange={noop}>
        <Select.Control>Pick countries</Select.Control>
        <Select.Content>
          <Select.Option value="be">Belgium</Select.Option>
        </Select.Content>
      </Select>

      {/* Multi: controlled value */}
      <Select multiple value={["be"]} onValueChange={noop}>
        <Select.Control aria-label="Countries" />
        <Select.Content>
          <Select.Option value="be">Belgium</Select.Option>
        </Select.Content>
      </Select>

      {/* Multi: uncontrolled defaultValue */}
      <Select multiple defaultValue={["be"]} onValueChange={noop}>
        <Select.Control aria-label="Countries" />
        <Select.Content>
          <Select.Option value="be">Belgium</Select.Option>
        </Select.Content>
      </Select>

      {/* Multi: controlled open */}
      <Select multiple open={true} onOpenChange={noop} onValueChange={noop}>
        <Select.Control aria-label="Countries" />
        <Select.Content>
          <Select.Option value="be">Belgium</Select.Option>
        </Select.Content>
      </Select>

      {/* Multi: disabled root */}
      <Select multiple disabled onValueChange={noop}>
        <Select.Control aria-label="Countries" />
        <Select.Content>
          <Select.Option value="be">Belgium</Select.Option>
        </Select.Content>
      </Select>

      {/* Multi: Control with custom removeLabel */}
      <Select multiple defaultValue={["be"]} onValueChange={noop}>
        <Select.Control
          aria-label="Pays"
          removeLabel={(label) => `Supprimer ${label}`}
        />
        <Select.Content>
          <Select.Option value="be">Belgium</Select.Option>
        </Select.Content>
      </Select>

      {/* Multi: disabled option */}
      <Select multiple onValueChange={noop}>
        <Select.Control aria-label="Countries" />
        <Select.Content>
          <Select.Option value="be">Belgium</Select.Option>
          <Select.Option value="fr" disabled>France</Select.Option>
        </Select.Content>
      </Select>

      {/* Multi: custom className on subcomponents */}
      <Select multiple onValueChange={noop}>
        <Select.Control aria-label="Countries" className="my-control" />
        <Select.Content className="my-content">
          <Select.Option value="be" className="my-option">Belgium</Select.Option>
        </Select.Content>
      </Select>

      {/* Multi: Control with showClearAll */}
      <Select multiple defaultValue={["be"]} onValueChange={noop}>
        <Select.Control
          aria-label="Countries"
          showClearAll
          clearAllLabel="Clear everything"
        />
        <Select.Content>
          <Select.Option value="be">Belgium</Select.Option>
        </Select.Content>
      </Select>

      {/* Multi: with Group */}
      <Select multiple onValueChange={noop}>
        <Select.Control aria-label="Countries" />
        <Select.Content>
          <Select.Group label="Benelux">
            <Select.Option value="be">Belgium</Select.Option>
            <Select.Option value="nl">Netherlands</Select.Option>
          </Select.Group>
          <Select.Option value="fr">France</Select.Option>
        </Select.Content>
      </Select>

      {/* Multi: with disabled Group */}
      <Select multiple onValueChange={noop}>
        <Select.Control aria-label="Countries" />
        <Select.Content>
          <Select.Group label="Benelux" disabled>
            <Select.Option value="be">Belgium</Select.Option>
          </Select.Group>
        </Select.Content>
      </Select>

      {/* Multi: name prop for form participation */}
      <Select multiple name="countries" onValueChange={noop}>
        <Select.Control aria-label="Countries" />
        <Select.Content>
          <Select.Option value="be">Belgium</Select.Option>
        </Select.Content>
      </Select>
    </>
  );
}

export function ValidSingleUses(): ReactNode {
  return (
    <>
      {/* Single: aria-label */}
      <Select aria-label="Country" onValueChange={noop}>
        <Select.Option value="be">Belgium</Select.Option>
        <Select.Option value="nl">Netherlands</Select.Option>
      </Select>

      {/* Single: aria-labelledby */}
      <Select aria-labelledby="country-label" onValueChange={noop}>
        <Select.Option value="be">Belgium</Select.Option>
      </Select>

      {/* Single: with defaultValue and name */}
      <Select aria-label="Country" defaultValue="be" name="country" onValueChange={noop}>
        <Select.Option value="be">Belgium</Select.Option>
        <Select.Option value="nl">Netherlands</Select.Option>
      </Select>

      {/* Single: controlled value */}
      <Select aria-label="Country" value="be" onValueChange={noop}>
        <Select.Option value="be">Belgium</Select.Option>
      </Select>

      {/* Single: disabled */}
      <Select aria-label="Country" disabled onValueChange={noop}>
        <Select.Option value="be">Belgium</Select.Option>
      </Select>

      {/* Single: with Group */}
      <Select aria-label="Country" onValueChange={noop}>
        <Select.Group label="Benelux">
          <Select.Option value="be">Belgium</Select.Option>
          <Select.Option value="nl">Netherlands</Select.Option>
        </Select.Group>
        <Select.Option value="fr">France</Select.Option>
      </Select>

      {/* Single: with explicit multiple={false} */}
      <Select multiple={false} aria-label="Country" onValueChange={noop}>
        <Select.Option value="be">Belgium</Select.Option>
      </Select>
    </>
  );
}

export function InvalidControlUses(): ReactNode {
  return (
    <>
      {/* @ts-expect-error no accessible name source on Control */}
      <Select.Control />

      {/* @ts-expect-error children and aria-label are mutually exclusive */}
      <Select.Control aria-label="Countries">Pick</Select.Control>
    </>
  );
}

export function InvalidSingleUses(): ReactNode {
  return (
    <>
      {/* @ts-expect-error single mode with no accessible name (no aria-label and no aria-labelledby) */}
      <Select onValueChange={noop}>
        <Select.Option value="be">Belgium</Select.Option>
      </Select>

      {/* @ts-expect-error single mode with both aria-label and aria-labelledby are mutually exclusive */}
      <Select aria-label="Country" aria-labelledby="country-label" onValueChange={noop}>
        <Select.Option value="be">Belgium</Select.Option>
      </Select>
    </>
  );
}
