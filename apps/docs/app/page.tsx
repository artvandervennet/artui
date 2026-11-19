import { ThemeSwitch } from 'fumadocs-ui/layouts/shared/slots/theme-switch';
import Link from 'next/link';

import { GessoElements } from '@/components/gesso-elements';

const GITHUB_URL = 'https://github.com/artvandervennet/artui';

/* The landing page, built on Gesso's page anatomy: a sticky <art-header>, then a stack of
   painted bands (hero, one section per topic, footer). The classes come from Gesso's
   layout.css; the art-* tags are its custom elements. See app/global.css. */
export default function HomePage() {
  return (
    <div className="landing">
      <GessoElements />
      {/* biome-ignore lint/a11y/noInteractiveElementToNoninteractiveRole: art-header is a custom element with no role of its own; it is the page's banner */}
      <art-header role="banner" label="On this page" data-paint="deep">
        {/* The logo stands before the name, inside the same link. The name names the link, so
            the picture has an empty alt. Gesso's layout.css sizes it. */}
        <a slot="wordmark" href="#top">
          {/* biome-ignore lint/performance/noImgElement: an 800-byte SVG, which next/image has nothing to optimise; art-header copies this element as it stands */}
          <img src="/logo.svg" alt="" width={28} height={28} />
          artui
        </a>
        <a href="#contract">The contract</a>
        <a href="#distribution">Distribution</a>
        <a href="#limits">What it is not</a>
        <span slot="actions" className="header-switch">
          <ThemeSwitch />
        </span>
        <art-button slot="actions" size="s">
          <Link href="/docs/getting-started">Docs</Link>
        </art-button>
      </art-header>

      <main>
        <div id="top" className="band hero" data-paint="deep">
          <div className="inner">
            <p className="eyebrow">Accessibility-first React components</p>
            <h1>
              Inaccessibility is a{' '}
              <art-stroke pigment="stroke" seed="artui" animate>
                compile&nbsp;error
              </art-stroke>
              .
            </h1>
            <p className="lead">
              Components that refuse to render inaccessibly. Copied into your repo, not installed
              from npm.
            </p>
            <div className="actions">
              <art-button size="l">
                <Link href="/docs/getting-started">Get started</Link>
              </art-button>
              <art-button size="l" variant="secondary">
                <Link href="/docs/components">Browse components</Link>
              </art-button>
            </div>
          </div>
          <art-drip
            className="band-drip"
            pigment="--surface"
            seed="artui"
            count="9"
            stagger=""
            flush=""
          />
        </div>

        <div className="band" data-paint="1">
          <div className="inner">
            <p className="statement">
              <a href="https://webaim.org/projects/million/" target="_blank" rel="noreferrer">
                WebAIM Million 2026
              </a>{' '}
              found WCAG violations on{' '}
              <art-stroke variant="highlight" seed="million">
                95.9%
              </art-stroke>{' '}
              of the top one million homepages.
            </p>
            <p>
              The same six categories show up every year: missing alt text, unlabelled inputs, empty
              buttons, low contrast. A library can prevent them.
            </p>
          </div>
        </div>

        <section id="contract" className="band section" data-paint="2" aria-labelledby="contract-h">
          <div className="inner">
            <div className="section-head">
              <h2 id="contract-h" className="section-title">
                The contract
              </h2>
              <p className="intro">Every artui component promises one or both of:</p>
            </div>
            <div className="section-body">
              <div className="card-grid">
                <article className="card">
                  <h3>Compile-time prevention</h3>
                  <p>
                    If a usage cannot be accessible, it must be a TypeScript error.{' '}
                    <code>&lt;Image /&gt;</code> with no <code>alt</code> does not compile. An{' '}
                    <code>Accordion.Trigger</code> with an empty label does not compile.
                  </p>
                </article>
                <article className="card">
                  <h3>Runtime fallback</h3>
                  <p>
                    Whatever the type system cannot express surfaces as a red development overlay
                    and a <code>console.error</code>. Both layers are no-ops in production. Shipping
                    is silent. Development is noisy on purpose.
                  </p>
                </article>
              </div>
            </div>
          </div>
        </section>

        <section
          id="distribution"
          className="band section"
          data-paint="3"
          aria-labelledby="distribution-h"
        >
          <div className="inner">
            <div className="section-head">
              <h2 id="distribution-h" className="section-title">
                Why shadcn-style distribution
              </h2>
              <p className="intro">
                artui has no runtime package. The CLI copies component source into your repo.
              </p>
            </div>
            <div className="section-body">
              <div className="card-grid">
                <article className="card">
                  <h3>Audit every line</h3>
                  <p>
                    The dev overlay says exactly what triggered it. You can read, modify, and own
                    every file.
                  </p>
                </article>
                <article className="card">
                  <h3>No version coupling</h3>
                  <p>
                    When the registry changes, you opt in by running <code>artui add</code> again.
                    Your existing copy keeps working.
                  </p>
                </article>
                <article className="card">
                  <h3>No tree-shaking debates</h3>
                  <p>
                    You import what is in your repo, full stop. No barrel files, no surprise
                    transitive bundles.
                  </p>
                </article>
              </div>
            </div>
          </div>
        </section>

        <section id="limits" className="band section" data-paint="4" aria-labelledby="limits-h">
          <div className="inner">
            <div className="section-head">
              <h2 id="limits-h" className="section-title">
                What artui is not
              </h2>
            </div>
            <div className="section-body">
              <ul className="limits">
                <li>
                  <strong>Not a design system.</strong>
                  <p>
                    Components ship minimal styles you are expected to rebrand. The accessibility
                    behaviour, not the visual language, is the product.
                  </p>
                </li>
                <li>
                  <strong>Not a replacement for testing.</strong>
                  <p>
                    Type-level enforcement catches the static mistakes; manual screen-reader testing
                    and automated axe runs catch the rest.
                  </p>
                </li>
                <li>
                  <strong>Not a complete component library.</strong>
                  <p>
                    Coverage grows as accessible patterns are validated. Missing a primitive?{' '}
                    <a href={`${GITHUB_URL}/issues/new/choose`} target="_blank" rel="noreferrer">
                      Open an issue
                    </a>
                    .
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      <footer className="band page-footer" data-paint="deep">
        <div className="inner">
          <div>
            <p>Built for accessibility-first React.</p>
            <nav aria-label="Footer">
              <ul>
                <li>
                  <Link href="/docs/getting-started">Docs</Link>
                </li>
                <li>
                  <Link href="/docs/components">Components</Link>
                </li>
                <li>
                  <Link href="/docs/faq">FAQ</Link>
                </li>
                <li>
                  <Link href="/docs/contributing">Contributing</Link>
                </li>
                <li>
                  <a href={GITHUB_URL} target="_blank" rel="noreferrer">
                    GitHub
                  </a>
                </li>
              </ul>
            </nav>
          </div>
          <art-signature year="2026" animate>
            Art Van der Vennet
          </art-signature>
        </div>
      </footer>
    </div>
  );
}
