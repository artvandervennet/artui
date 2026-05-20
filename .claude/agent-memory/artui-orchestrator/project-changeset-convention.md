---
name: project-changeset-convention
description: Changeset files can be written directly as .changeset/<slug>.md instead of running interactive pnpm changeset
metadata:
  type: project
---

`pnpm changeset` is interactive and cannot be automated. Write changeset files directly to `.changeset/<descriptive-slug>.md` with the standard frontmatter format:

```md
---
"@artui/registry": minor
"@artui/cli": minor
---

Human-readable description of what changed and why.
```

Bump levels: new component or new public API → minor. Breaking change → major. Internal-only docs-site change → no changeset needed (apps/docs is private).

Releasable packages: `@artui/registry` and `@artui/cli`. `apps/docs` is private. There is no `@artui/mcp` package (see [[project-mcp-lives-in-docs]]).
