---
name: registry-css-no-import
description: Never put @import in registry/components/**/*.css — breaks when CLI copies files to consumer projects
metadata:
  type: feedback
---

Never add `@import` (e.g. of `artui-tokens.css`) inside any `registry/components/**/*.css` file.

**Why:** Registry components are copied verbatim into consumer projects by the artui CLI (shadcn-style). Relative `@import` paths break once the file lands in a different directory structure. Consumers are expected to include `artui-tokens.css` once in their app entry point instead.
**How to apply:** When centralizing or sharing CSS across registry components, rely on tokens being defined globally (the consumer/docs imports the token file once). The component CSS just references `var(--artui-*)`. Verify with a grep for `@import` in `registry/components/**/*.css` after any CSS refactor. See [[centralized-css-tokens]].
