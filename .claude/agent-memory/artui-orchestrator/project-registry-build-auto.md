---
name: project-registry-build-auto
description: registry/registry.json is regenerated automatically by pnpm typecheck (via turbo), not a separate manual step
metadata:
  type: project
---

Running `pnpm typecheck` triggers `turbo run typecheck`, which includes `@artui/registry:build` as a dependency step. That step runs `registry/scripts/build-registry.ts` and regenerates `registry/registry.json`. The docs prebuild (`copy-registry.mjs`) also runs as part of `@artui/docs:typecheck` and copies the JSON to `apps/docs/public/registry.json`.

**Why:** Observed 2026-05-20 — turbo output showed `@artui/registry:build` executing and logging "wrote registry.json with 4 component(s)".

**How to apply:** No need to run `pnpm build` as a separate step after adding a component — `pnpm typecheck` already does it. The final quality-gate pass (typecheck + test + lint) is sufficient to regenerate and validate registry.json.
