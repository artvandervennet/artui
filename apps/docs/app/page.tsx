import Link from 'next/link';

const GITHUB_URL = 'https://github.com/artvandervennet/artui';

export default function HomePage() {
  return (
    <main className="relative flex min-h-screen flex-col text-fd-foreground">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[640px] overflow-hidden"
      >
        <div
          className="absolute left-1/2 top-[-220px] h-[720px] w-[1200px] -translate-x-1/2 rounded-full opacity-60 blur-3xl"
          style={{
            background:
              'radial-gradient(closest-side, color-mix(in oklch, var(--brand-400) 55%, transparent), transparent 70%)',
          }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-32"
          style={{
            background: 'linear-gradient(to bottom, transparent, var(--color-fd-background))',
          }}
        />
      </div>

      <header className="mx-auto w-full max-w-5xl px-6 pb-12 pt-24 sm:pt-32">
        <p className="mb-6 text-xs font-medium uppercase tracking-[0.18em] text-fd-muted-foreground">
          accessibility-first react components
        </p>
        <h1 className="text-balance text-5xl font-semibold tracking-tight sm:text-6xl">
          Inaccessibility is a <span className="text-fd-primary">compile&nbsp;error</span>.
        </h1>
        <p className="mt-6 max-w-2xl text-pretty text-lg text-fd-muted-foreground sm:text-xl">
          Components that refuse to render inaccessibly. Copied into your repo, not installed from
          npm.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link
            href="/docs/getting-started"
            className="inline-flex items-center gap-2 rounded-md bg-fd-primary px-5 py-2.5 text-sm font-medium text-fd-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fd-ring"
          >
            Get started
            <span aria-hidden="true">→</span>
          </Link>
          <Link
            href="/docs/components"
            className="inline-flex items-center gap-2 rounded-md border border-fd-border bg-fd-card px-5 py-2.5 text-sm font-medium text-fd-foreground transition-colors hover:border-fd-primary/50 hover:bg-fd-accent/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fd-ring"
          >
            Browse components
          </Link>
        </div>
      </header>

      <section className="mx-auto w-full max-w-5xl px-6 py-16">
        <p className="text-balance text-2xl font-medium tracking-tight sm:text-3xl">
          <a
            href="https://webaim.org/projects/million/"
            target="_blank"
            rel="noreferrer"
            className="underline decoration-fd-border decoration-1 underline-offset-4 transition-colors hover:decoration-fd-primary"
          >
            WebAIM Million 2026
          </a>{' '}
          found WCAG violations on <span className="text-fd-primary">95.9%</span> of the top one
          million homepages.
        </p>
        <p className="mt-4 max-w-2xl text-base text-fd-muted-foreground">
          The same six categories show up every year: missing alt text, unlabelled inputs, empty
          buttons, low contrast. A library can prevent them.
        </p>
      </section>

      <section className="mx-auto w-full max-w-5xl px-6 py-12">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-fd-muted-foreground">
          The contract
        </h2>
        <p className="mt-3 max-w-2xl text-lg text-fd-foreground">
          Every artui component promises one or both of:
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <article className="rounded-lg border border-fd-border bg-fd-card p-6">
            <h3 className="text-base font-semibold text-fd-foreground">Compile-time prevention</h3>
            <p className="mt-2 text-sm leading-relaxed text-fd-muted-foreground">
              If a usage cannot be accessible, it must be a TypeScript error.{' '}
              <code className="rounded bg-fd-muted px-1.5 py-0.5 text-[0.85em] text-fd-foreground">
                &lt;Image /&gt;
              </code>{' '}
              with no{' '}
              <code className="rounded bg-fd-muted px-1.5 py-0.5 text-[0.85em] text-fd-foreground">
                alt
              </code>{' '}
              does not compile. An{' '}
              <code className="rounded bg-fd-muted px-1.5 py-0.5 text-[0.85em] text-fd-foreground">
                Accordion.Trigger
              </code>{' '}
              with an empty label does not compile.
            </p>
          </article>
          <article className="rounded-lg border border-fd-border bg-fd-card p-6">
            <h3 className="text-base font-semibold text-fd-foreground">Runtime fallback</h3>
            <p className="mt-2 text-sm leading-relaxed text-fd-muted-foreground">
              Whatever the type system cannot express surfaces as a red development overlay and a{' '}
              <code className="rounded bg-fd-muted px-1.5 py-0.5 text-[0.85em] text-fd-foreground">
                console.error
              </code>
              . Both layers are no-ops in production. Shipping is silent. Development is noisy on
              purpose.
            </p>
          </article>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-6 py-12">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-fd-muted-foreground">
          Why shadcn-style distribution
        </h2>
        <p className="mt-3 max-w-2xl text-lg text-fd-foreground">
          artui has no runtime package. The CLI copies component source into your repo.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <article className="rounded-lg border border-fd-border bg-fd-card p-6">
            <h3 className="text-base font-semibold text-fd-foreground">Audit every line</h3>
            <p className="mt-2 text-sm leading-relaxed text-fd-muted-foreground">
              The dev overlay says exactly what triggered it. You can read, modify, and own every
              file.
            </p>
          </article>
          <article className="rounded-lg border border-fd-border bg-fd-card p-6">
            <h3 className="text-base font-semibold text-fd-foreground">No version coupling</h3>
            <p className="mt-2 text-sm leading-relaxed text-fd-muted-foreground">
              When the registry changes, you opt in by running{' '}
              <code className="rounded bg-fd-muted px-1.5 py-0.5 text-[0.85em] text-fd-foreground">
                artui add
              </code>{' '}
              again. Your existing copy keeps working.
            </p>
          </article>
          <article className="rounded-lg border border-fd-border bg-fd-card p-6">
            <h3 className="text-base font-semibold text-fd-foreground">No tree-shaking debates</h3>
            <p className="mt-2 text-sm leading-relaxed text-fd-muted-foreground">
              You import what is in your repo, full stop. No barrel files, no surprise transitive
              bundles.
            </p>
          </article>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-6 py-12">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-fd-muted-foreground">
          What artui is not
        </h2>
        <ul className="mt-6 space-y-3 text-base text-fd-muted-foreground">
          <li>
            <span className="text-fd-foreground">Not a design system.</span> Components ship minimal
            styles you are expected to rebrand. The accessibility behaviour, not the visual
            language, is the product.
          </li>
          <li>
            <span className="text-fd-foreground">Not a replacement for testing.</span> Type-level
            enforcement catches the static mistakes; manual screen-reader testing and automated axe
            runs catch the rest.
          </li>
          <li>
            <span className="text-fd-foreground">Not a complete component library.</span> Coverage
            grows as accessible patterns are validated. Missing a primitive?{' '}
            <a
              href={`${GITHUB_URL}/issues/new`}
              target="_blank"
              rel="noreferrer"
              className="text-fd-primary underline decoration-fd-primary/40 underline-offset-4 hover:decoration-fd-primary"
            >
              Open an issue
            </a>
            .
          </li>
        </ul>
      </section>

      <footer className="mt-auto border-t border-fd-border">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-sm text-fd-muted-foreground">
          <p>Built for accessibility-first React.</p>
          <nav aria-label="Footer">
            <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <li>
                <Link
                  href="/docs/getting-started"
                  className="rounded transition-colors hover:text-fd-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fd-ring"
                >
                  Docs
                </Link>
              </li>
              <li>
                <Link
                  href="/docs/components"
                  className="rounded transition-colors hover:text-fd-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fd-ring"
                >
                  Components
                </Link>
              </li>
              <li>
                <Link
                  href="/docs/faq"
                  className="rounded transition-colors hover:text-fd-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fd-ring"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/docs/contributing"
                  className="rounded transition-colors hover:text-fd-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fd-ring"
                >
                  Contributing
                </Link>
              </li>
              <li>
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded transition-colors hover:text-fd-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fd-ring"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </footer>
    </main>
  );
}
