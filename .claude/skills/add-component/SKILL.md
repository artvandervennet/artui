---
name: add-component
description: Scaffold a new accessibility-first component in registry/components/<name>/. Use when the user asks to add, create, or scaffold a new artui component. Produces the component, meta, behavior tests, type-only tests, and wires up exports + registry.json.
argument-hint: "<component-name> [one-line description]"
disable-model-invocation: true
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash(pnpm --filter * *)
  - Bash(pnpm typecheck)
  - Bash(pnpm test *)
  - Bash(pnpm lint)
  - Bash(git status)
  - Bash(git diff *)
---

Scaffold a new component in `registry/components/<name>/`. Components are the source of truth and are copied verbatim into consumer projects — they must be self-contained and accessibility-first.

## Step 0: Resolve name and intent

- `$ARGUMENTS` = `<component-name> [one-line description]`. If empty or ambiguous, ask the user (AskUserQuestion) for: kebab-case name, PascalCase identifier (default: PascalCase of name), and a one-line description.
- Confirm the directory `registry/components/<name>/` does not already exist. If it does, stop and tell the user.
- Read [registry/components/image/](../../../registry/components/image/) end-to-end. It is the canonical reference — match its structure exactly.
- Read [registry/lib/meta-types.ts](../../../registry/lib/meta-types.ts) so the `meta.ts` you produce satisfies `ComponentMeta`.

## Step 1: Plan the accessibility contract

Invoke the `plan-a11y` skill, passing the component name and one-line description as `$ARGUMENTS`. That skill produces the structured accessibility plan (WCAG criteria, type-level API sketch, runtime guards, fatal fallbacks, keyboard contract, focus management, ARIA, cross-cutting concerns) and walks the priority hierarchy: eliminate the failure mode → type error → `devWarn` → `renderA11yError`.

Wait for the user to confirm the plan before proceeding to Step 2. The plan is the accessibility contract for the component, and changing it after consumers have copied the code is expensive — get alignment now.

If the plan lists "Setup work the implementer must do first" (e.g. a new `registry/lib/` file the component depends on), do that work before Step 2.

## Step 2: Create the files

Create exactly these files under `registry/components/<name>/`. File names are kebab-case; the exported identifier is PascalCase.

### `<name>.tsx`
- `'use client'` only if the component uses hooks/effects.
- Imports allowed: `react`, `../../lib/*`, sibling files in the same component directory. Nothing else.
- Never import from `packages/` or `apps/` — the file is copied verbatim into the consumer's repo.
- Export the component as a named export. Export the props type as `<Name>Props`.
- WHY comments only at non-obvious decisions. No JSDoc on every internal helper.
- Respect `prefers-reduced-motion` for any animation. CSS transitions only.

### `meta.ts`
- Default export shape: `export const meta: ComponentMeta = { ... }`. Type-import `ComponentMeta` from `../../lib/meta-types`.
- `files`: every file in the component directory that ships to consumers (e.g. `['<name>.tsx']`). Exclude `meta.ts`, `*.test.*`, `*.test-types.*`.
- `registryDependencies`: any `lib/*` files the component imports, listed as paths relative to the registry root (e.g. `'lib/dev-warn.ts'`). The build script bundles them.
- `props`: every public prop — `name`, `type` (TS source string), `required`, `defaultValue?`, `description`. Match what the `.tsx` actually exports.
- `accessibility`: one entry per WCAG criterion from Step 1. Plain language, no jargon.
- `examples`: at least one happy-path and one accessibility-edge-case example. The `code` field is rendered as-is in docs.
- `donts`: anti-patterns with `code` + `reason`. Mirror the patterns the type system rejects.
- `related`: PascalCase names of other artui components a user might want.

### `<name>.test.tsx`
- Vitest + `@testing-library/react`. Follow [registry/components/image/image.test.tsx](../../../registry/components/image/image.test.tsx).
- One assertion per `it`. Test names read as sentences: `it('renders X when Y', ...)`.
- Reset `__resetDevWarnCache()` in `beforeEach` if the component uses `devWarn`.
- Cover: happy path, every accessibility branch (each WCAG criterion from `meta.accessibility`), every runtime guard, every dev warning trigger.
- No mocking the component under test. No `expect(true)` or untyped assertions.

### `<name>.test-types.tsx`
- Type-only test. Follow [registry/components/image/image.test-types.tsx](../../../registry/components/image/image.test-types.tsx).
- Export `ValidUses()` showing every legal prop shape.
- Export `InvalidUses()` with `@ts-expect-error` directly above every misuse the type system must reject. One per discriminated case, per branded type, per required prop.
- These files must compile under `tsc --noEmit`. An `@ts-expect-error` with no error is itself a compile error — that is the safety net.

## Step 3: Wire up exports

- Add a named re-export to [registry/index.ts](../../../registry/index.ts):
  ```ts
  export { <Name> } from './components/<name>/<name>';
  export type { <Name>Props } from './components/<name>/<name>';
  ```
- Do **not** edit `registry/registry.json` — it is generated by `registry/scripts/build-registry.ts` in Step 4.

## Step 4: Build, typecheck, test, lint

Run in this order. Stop and fix on the first failure — do not proceed past a broken step.

1. `pnpm --filter @artui/registry build` — regenerates `registry.json`. Confirms `meta.files` and `registryDependencies` point at real files.
2. `pnpm --filter @artui/registry typecheck` — proves the component compiles AND that every `@ts-expect-error` in the type-only test still fires.
3. `pnpm --filter @artui/registry test <name>` — runs only the new component's tests for fast feedback.
4. `pnpm --filter @artui/registry lint` — registry has its own ESLint config (including `jsx-a11y`). Warnings fail.

## Step 5: Report

Brief, in-conversation. No markdown file. Cover:

- The files created (with clickable links).
- The WCAG criteria the component now enforces.
- Anything you couldn't enforce at the type level and pushed to a runtime `devWarn`.
- What the user should do next (e.g. add an MDX docs page in `apps/docs`, if that's part of the workflow).

## Rules

- Never edit `registry/registry.json` by hand.
- Never add a runtime import from `registry/` to anything in `packages/` or `apps/`.
- Never `git commit` — the user always commits manually.
- Never introduce a new CSS framework inside `registry/` — plain CSS or authored styles only.
- If the user resists the accessibility contract in Step 1, push back once with the WCAG reasoning; if they still want it relaxed, do it but flag it in Step 5.
