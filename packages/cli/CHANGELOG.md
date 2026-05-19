# @artui/cli

## 0.2.0

### Minor Changes

- 0a13d07: feat(dialog): add accessible Dialog component

  Native `<dialog>` with `showModal()` providing browser-managed focus trap, top-layer rendering, and Escape handling. Discriminated-union props enforce exactly one label source (`title` or `aria-labelledby`) at compile time. Three runtime dev overlays cover empty children (WCAG 1.3.1), unfocusable body content (WCAG 2.1.1), and unresolvable aria-labelledby (WCAG 4.1.2). A hidden sentinel close button guarantees at least one focus stop. Focus is captured on open and restored on close.

## 0.1.0

### Minor Changes

- c380c97: Registry versioning + docs coupling. The registry now stamps its `package.json` version into `registry.json`, and the docs site publishes an immutable snapshot at `/registry/v<version>/registry.json` alongside the existing `/registry.json` "latest". The CLI accepts an optional `version` field in `components.json` to pin installs to a specific registry release, and validates that the fetched registry's version matches the pin. The docs site shows a registry-version badge and an install banner with the matching `components.json` snippet so docs and CLI always agree.

## 0.0.2

### Patch Changes

- ba7c1fb: Point default registry URL at `artui.vandervennet.art` (was the unowned `artui.dev` placeholder). Fresh `artui init` now writes a `components.json` whose `registry` resolves.

## 0.0.1

### Patch Changes

- 28b6cda: fix the init command
