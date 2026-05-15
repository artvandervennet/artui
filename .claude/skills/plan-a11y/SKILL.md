---
name: plan-a11y
description: Plan the accessibility contract for an artui component before any code is written. Use when scaffolding a new component, retrofitting accessibility onto an existing one, or auditing whether a component's API forces correct usage. Produces a structured plan covering WCAG criteria, type-level guards, runtime guards, fatal-failure fallbacks, keyboard/focus/ARIA decisions. Always invoke before /add-component starts writing files; also invoke directly when the user asks to "plan", "design the a11y for", "audit", or "make X accessible".
argument-hint: "<component-name-or-description>"
allowed-tools:
  - Read
  - Glob
  - Grep
  - AskUserQuestion
---

Design the accessibility contract for one component. Output a plan in chat — never write files. The plan is consumed by `/add-component` (or the user) to write the actual code.

artui components are copied verbatim into consumer projects. They have to be inaccessible-by-construction: the consumer cannot ship a broken `<Button>` because `<Button>` won't accept a broken shape. This skill exists to make sure that contract is designed *before* the .tsx is written, not bolted on after.

## The priority hierarchy

For every accessibility requirement the component has, walk these tiers in order. Stop at the first one that works. Drop to the next only when the one above genuinely cannot enforce the property.

### Tier 1 — Eliminate the failure mode

The best guard is no guard: design the API so the bad shape doesn't exist. The author cannot misuse what isn't representable.

Examples of how this looks in practice:
- `<Image>` doesn't accept `alt={undefined}` because the prop type is a discriminated union: pass `decorative: true` (and no alt) or pass a real `alt`. There is no third shape, so "forgot the alt" is not a state the component can be in.
- A toggle button doesn't expose `pressed?: boolean` (which can be omitted) — it requires `pressed: boolean`. The "I forgot to wire aria-pressed" failure mode is gone.
- A `<Modal>` doesn't expose an `onClose` that callers can omit; closing is part of the modal's own lifecycle.

Ask, for each requirement: *can I redesign the API so this mistake is structurally impossible?* If yes, do that and you're done. No type guard, no runtime guard, no fallback.

### Tier 2 — Type error at the call site

If you can't eliminate the shape, make the bad shape a compile error. The author sees red squigglies in their IDE before they ever run the code.

Tools the project already gives you:
- **Discriminated unions with `never`** — see `ImageProps` in [registry/components/image/image.tsx](../../../registry/components/image/image.tsx). Each branch lists the *forbidden* keys as `never`, so passing both is rejected.
- **`AccessibleText<T>`** from [registry/lib/a11y-types.ts](../../../registry/lib/a11y-types.ts) — rejects empty strings and known placeholder values (`"image"`, `"icon"`, `"photo"`, ...) at the type level. Use it for any prop that holds an accessible name (`alt`, `aria-label`, button label).
- **`AccessibleNameProps`** — three-way union for components that need an accessible name from one of `children` / `aria-label` / `aria-labelledby`. Author must pick exactly one.
- **Required props** — never make an a11y-critical prop optional with a default. If a `<Tabs>` needs an `aria-label` describing the tablist, make it required. The default is "force the author to think."
- **Branded literal types** — for ARIA role/state strings, use a string-literal union (`'true' | 'false' | 'mixed'`) not `string`. Typos become type errors.
- **Template literal types** — pattern like `\`${string}-label\`` to require an id format, or `Exclude<T, ''>` to forbid empty strings.

Patterns to reach for:

```ts
// Forbid combinations
type A = { mode: 'icon';  'aria-label': AccessibleText; children?: never };
type B = { mode: 'text';  'aria-label'?: never;        children: AccessibleText };
type Props = A | B;

// Forbid optional with no default
type Props = { pressed: boolean };  // not pressed?: boolean

// Forbid empty / placeholder strings
type Props = { label: AccessibleText };

// Brand a string into an id reference
type IdRef<T extends string> = T;  // documented contract; combine with runtime check
```

### Tier 3 — Runtime warning + visible outline (dev only)

For violations TypeScript literally cannot see — dynamic strings, DOM relationships, conditional ARIA — fire a `devWarn`. The warning logs to the console *and* outlines the offending element with a red border so the developer sees it on the page.

Use [registry/lib/dev-warn.ts](../../../registry/lib/dev-warn.ts). Never call `console.warn` directly. `devWarn` is no-op in production and tree-shaken; safe to leave in.

When to reach for runtime warnings:
- Dynamic alt text that *evaluates* to a placeholder at runtime (e.g. `alt={user.name ?? 'image'}`).
- `aria-labelledby` / `aria-controls` pointing at an id that doesn't exist in the DOM.
- An interactive component receiving `tabIndex={-1}` plus no programmatic focus path.
- A `<Dialog>` mounted without any focusable child.
- A `prefers-reduced-motion: reduce` user being shown a non-reduced animation (you missed the media query).

Each warning needs:
- A stable `key` for de-duplication.
- A `wcag` code so the developer knows which criterion they violated.
- A `message` written for a human, not for a parser.
- The `element` so it gets outlined.

### Tier 4 — Fatal failure: render the red square

When the component literally cannot do its job accessibly, do not render the broken thing. Render a visible red error block in its place via `renderA11yError()` from `registry/lib/render-a11y-error.tsx`.

Use only for catastrophic violations the developer must see *immediately*, not for tier-3 nudges. Examples:
- An `<IconButton>` with no `aria-label`, no `aria-labelledby`, and no visible text — it has no accessible name at all and the user has no way to know what it does.
- A `<Tabs>` with zero `<Tab>` children.
- A `<Combobox>` whose listbox id doesn't resolve to any element in the DOM.

The red square is dev-only behaviour (gated on `process.env.NODE_ENV !== 'production'`). In production, the component still has to do *something* — usually render a valid-but-degraded fallback (e.g. a button with the literal text "Unlabelled action") so a real user is never shown the red block.

If the plan calls for `renderA11yError()` and the file doesn't yet exist in `registry/lib/`, the plan must include "create render-a11y-error.tsx with this signature: …" as an explicit setup step. Don't assume the util is already there.

## How to produce the plan

### Step 0 — Understand what's being built

If `$ARGUMENTS` is a known component name, read the existing file (if any) to see what's there. If it's a description ("a tabs component"), that's enough.

Look up what this kind of component is *supposed* to do accessibly. Check the WAI-ARIA Authoring Practices Guide patterns for the component type when relevant (combobox, dialog, disclosure, menu, menubar, radio, slider, tabs, tooltip, tree). Don't fake this — if you don't know the keyboard contract for `tabs`, look it up via WebFetch or say so honestly to the user.

### Step 1 — Enumerate the requirements

List every distinct accessibility requirement the component has. Don't conflate them. For a `<Tabs>` that means roughly:
- The tablist exposes an accessible name (WCAG 4.1.2).
- Each tab is reachable by keyboard, with arrow-key navigation between tabs and Enter/Space to activate (WCAG 2.1.1).
- The active tab's panel is visible and the others are hidden from the a11y tree (WCAG 1.3.1).
- Focus is visible on the active tab (WCAG 2.4.7).
- Tab order moves into and out of the tablist as a single stop (WCAG 2.4.3).
- Programmatic activation vs manual activation is a deliberate choice (APG pattern).

One bullet per requirement. Pair each with its WCAG criterion code.

### Step 2 — Walk the hierarchy for each requirement

For every requirement from Step 1, decide which tier handles it. Write the decision down explicitly.

Example fragment:

> **Accessible name on tablist (WCAG 4.1.2)** — Tier 2. The `<Tabs>` props use `AccessibleNameProps` so the author must pass `aria-label` or `aria-labelledby`. Compile error if both are missing.
>
> **Arrow-key navigation between tabs (WCAG 2.1.1)** — Tier 1. The `<Tabs>` component manages focus internally via `useKeyboard`; individual `<Tab>` children don't accept their own `onKeyDown`, so authors can't break the contract by overriding it.
>
> **At least one tab present** — Tier 4. If `children` resolves to zero `<Tab>` elements, render `renderA11yError()` in dev. In production, render an empty tablist with `aria-label` so screenreaders aren't confused.

If a requirement falls to Tier 3 or Tier 4, justify *why* tiers 1 and 2 didn't work. ("Can't make this a type error because the tab list is `children`, which TypeScript sees as `ReactNode`.") That's the breadcrumb that tells future-you whether the call was right.

### Step 3 — Cover the cross-cutting concerns

Every interactive component needs an answer for these. Include them in the plan even if the answer is "n/a":

- **Keyboard contract** — every interaction key, what it does, what gets focus next.
- **Focus management** — initial focus on mount, focus restore on unmount, focus trap if modal-like.
- **ARIA roles & states** — exact role string, every state attribute, what triggers each state change.
- **Reduced motion** — any animation must check `prefers-reduced-motion: reduce` (CSS or JS).
- **Color contrast** — if the component ships colors, the contrast ratio for normal text (4.5:1) and large text / non-text indicators (3:1).
- **Touch target size** — interactive elements at least 44×44 CSS pixels.
- **Screen reader announcements** — does the component change content live? If so, `aria-live` region or sr-only status.

### Step 4 — Output the plan

Write the plan to chat in this exact structure. No prose paragraphs — bullets only, so the consumer (a person or `/add-component`) can implement it line by line.

```
## Accessibility plan: <ComponentName>

### Requirements
- [WCAG <code>] <one-line requirement> — Tier <n>: <how it's enforced>
- ...

### Type-level API
<Props type sketch in TS — every discriminated union, every never, every AccessibleText. Just enough that the implementer can paste it into the .tsx and refine.>

### Runtime guards (devWarn calls)
- key: "<Component>:<short-key>" — wcag <code> — fires when <condition> — message: "<human>"
- ...

### Fatal fallbacks (renderA11yError)
- Triggered when <condition>. Production fallback: <what to render instead>.
- (Or: "none — every fatal case is caught at the type level.")

### Keyboard contract
- <Key>: <action>
- ...

### Focus management
- On mount: <where focus lands, or n/a>
- On unmount: <restore target, or n/a>
- Trap: <yes/no — if yes, why>

### ARIA
- Root role: <role>
- States: <attr=values, when each is set>

### Reduced motion / contrast / touch target
- <one line each, or "n/a">

### Setup work the implementer must do first
- <e.g. "create registry/lib/render-a11y-error.tsx" — only list things that don't exist yet>

### Open questions for the user
- <anything you genuinely couldn't decide — keep this list short>
```

### Step 5 — Confirm with the user

Before returning control, ask the user to confirm the plan (AskUserQuestion or a direct prompt). The accessibility contract is the most expensive thing to change after the component ships, because it's already been copied into consumer repos. Get alignment now.

If the user is fine, return. If they push back, iterate on the plan — don't quietly ship a weaker contract.

## What this skill does not do

- Does not write `.tsx`, `meta.ts`, or test files. That's `/add-component`'s job.
- Does not edit `registry/lib/`. If the plan needs a new lib file, list it under "Setup work" and let the implementer create it.
- Does not run typecheck, tests, or lint. Planning only.

## Reference: artui primitives you can lean on

- [registry/lib/a11y-types.ts](../../../registry/lib/a11y-types.ts) — `AccessibleText`, `PlaceholderAltText`, `AccessibleNameProps`.
- [registry/lib/dev-warn.ts](../../../registry/lib/dev-warn.ts) — `devWarn({ key, component, message, wcag, element })`.
- [registry/lib/use-keyboard.ts](../../../registry/lib/use-keyboard.ts) — keyboard event helpers.
- [registry/lib/focus-trap.ts](../../../registry/lib/focus-trap.ts) — focus trap for modal-like components.
- [registry/components/image/image.tsx](../../../registry/components/image/image.tsx) — the canonical reference for tier-1+tier-2+tier-3 layering. Read it once before producing any plan.

## Reference: WCAG criteria you'll cite most often

- **1.1.1** Non-text Content — every non-decorative image / icon needs a text alternative.
- **1.3.1** Info and Relationships — semantic structure (headings, lists, labels) is conveyed in markup, not just visually.
- **1.4.3 / 1.4.11** Contrast — 4.5:1 text, 3:1 large text and non-text UI.
- **1.4.13** Content on Hover or Focus — tooltip-like content is dismissable, hoverable, persistent.
- **2.1.1** Keyboard — all functionality reachable from a keyboard.
- **2.1.2** No Keyboard Trap — focus can leave any component (focus traps must have a documented exit).
- **2.4.3** Focus Order — tab order matches reading order.
- **2.4.7** Focus Visible — every focusable element has a visible focus indicator.
- **2.5.5 / 2.5.8** Target Size — interactive targets ≥ 44×44 CSS px (24×24 minimum at 2.5.8).
- **3.3.2** Labels or Instructions — every input has a label.
- **4.1.2** Name, Role, Value — every UI control exposes an accessible name, a correct role, and current state.
- **4.1.3** Status Messages — live updates announced via `aria-live` / role="status".

If you cite a criterion you're unsure about, look it up rather than guessing — the WCAG number is going into `meta.accessibility` and the docs site.
