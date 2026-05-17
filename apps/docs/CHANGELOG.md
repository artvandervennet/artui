# @artui/docs

## 0.0.2

### Patch Changes

- c380c97: Registry versioning + docs coupling. The registry now stamps its `package.json` version into `registry.json`, and the docs site publishes an immutable snapshot at `/registry/v<version>/registry.json` alongside the existing `/registry.json` "latest". The CLI accepts an optional `version` field in `components.json` to pin installs to a specific registry release, and validates that the fetched registry's version matches the pin. The docs site shows a registry-version badge and an install banner with the matching `components.json` snippet so docs and CLI always agree.
- Updated dependencies [c380c97]
  - @artui/registry@0.2.0

## 0.0.1

### Patch Changes

- Updated dependencies [a8cd519]
  - @artui/registry@0.1.0
