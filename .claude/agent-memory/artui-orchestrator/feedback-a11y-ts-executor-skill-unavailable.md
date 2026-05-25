---
name: a11y-ts-executor-skill-unavailable
description: a11y-ts-executor skill is not registered in all sessions — implement directly when skill lookup fails
metadata:
  type: feedback
---

The `a11y-ts-executor` specialist skill is not always available via the Skill tool. When it returns "Unknown skill", implement the changes directly following the approved plan rather than blocking.

**Why:** Observed in Multiselect unified-field session — skill not found, implemented all tsx/css/test/meta changes inline with full test and typecheck verification.

**How to apply:** Always attempt `Skill("a11y-ts-executor", ...)` first. On failure, proceed with direct implementation using the approved plan as the specification. The same verification gate (typecheck + tests + lint) applies regardless of who implements.
