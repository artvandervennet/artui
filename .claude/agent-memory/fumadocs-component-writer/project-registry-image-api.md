---
name: project-registry-image-api
description: Image component API surface, WAI-ARIA pattern, and accessibility enforcement mechanisms
metadata:
  type: project
---

## Image component — registry API

**File:** `registry/components/image/image.tsx`

**Export:** Named export `Image` (generic function component), named export `ImageProps` type.

**WAI-ARIA pattern:** WCAG 1.1.1 Non-text Content + 4.1.2 Name, Role, Value. Not a complex interactive widget — an enforced `<img>` wrapper.

### Props

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `alt` | `SafeAlt<T>` | required | Forbidden if `decorative`. Literal forbidden strings cause compile-time error. |
| `decorative` | `true` | — | Renders `alt=""` and `role="presentation"`. Mutually exclusive with `alt` at type level. |
| `loading` | `"lazy" \| "eager"` | `"lazy"` | Defaulted in component. |
| `...rest` | `ImgHTMLAttributes<HTMLImageElement>` (minus `alt`, `role`) | — | `role` is omitted from public surface — managed internally. |

### Forbidden alt values (compile + runtime)
`""`, `"img"`, `"image"`, `"photo"`, `"picture"`, `"icon"` — case-insensitive.

### Compile-time enforcement
`SafeAlt<T>` conditional type: if `Lowercase<T> extends ForbiddenAlt`, the type resolves to an error-message string, making it unassignable to `T`. Only catches string literals.

### Runtime enforcement (dev only)
`withErrorOverlay` from `registry/lib/dev-overlay.tsx`:
- Wraps `<img>` in `position:relative` span with red `inset:0` overlay
- `aria-hidden="true"` and `pointerEvents:none` on the overlay — no a11y tree impact
- `console.error` once per stable key (de-duplicated via `reported` Set)
- No-op in production (`process.env.NODE_ENV !== 'production'` check)

### Decorative rendering
`<img {...rest} alt="" role="presentation" loading={loading ?? 'lazy'} />`

### Non-decorative rendering (clean)
`<img {...rest} alt={alt} loading={loading ?? 'lazy'} />`

**Why:** Needed to accurately document the API table and code examples without re-reading the source each time.

**How to apply:** Reference when writing API tables, TypeScript enforcement examples, or runtime error documentation for the Image component.

[[project-fumadocs-conventions]]
