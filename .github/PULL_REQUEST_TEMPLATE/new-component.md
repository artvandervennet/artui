# New component: <!-- name -->

## Summary

<!-- One sentence: what the component is and the problem it solves. -->

## Accessibility contract

**WCAG criteria addressed:**
<!-- e.g. 1.3.1 Info and Relationships, 4.1.2 Name Role Value -->

**Keyboard interactions implemented:**
<!-- List every key: Tab, Enter, Space, Escape, Arrow keys — and what each does. -->

**ARIA attributes used:**
<!-- role, aria-*, relevant attributes and why each is needed. -->

**Focus management:**
<!-- Where focus goes on open/close/activate. -->

## Checklist

### Component
- [ ] Source at `registry/components/<name>/<name>.tsx`
- [ ] `meta.ts` complete (name, description, files, registryDependencies)
- [ ] `pnpm --filter @artui/registry build` run — `registry.json` regenerated
- [ ] At least one Vitest test covering keyboard reachability, focus management, and ARIA exposure
- [ ] No imports from `packages/` or `apps/` — component is self-contained

### Docs
- [ ] Docs page at `apps/docs/content/docs/components/<name>.mdx`
- [ ] Install snippet included
- [ ] Interactive playground included
- [ ] Props table complete
- [ ] Dos and don'ts section included
- [ ] Related components listed

### CI
- [ ] `pnpm turbo run lint typecheck test build` passes locally
- [ ] Changeset added (`pnpm changeset`) if `@artui/cli` or `@artui/mcp` is touched

## Tested with

- [ ] Keyboard only
- [ ] VoiceOver (macOS/iOS)
- [ ] NVDA (Windows)
- [ ] axe DevTools

## Notes for reviewers

<!-- Tradeoffs, open questions, things you're less sure about. Delete if empty. -->
