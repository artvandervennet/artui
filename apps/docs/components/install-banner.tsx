import { REGISTRY_VERSION } from '@/lib/registry-version';
import { RegistryVersionBadge } from './registry-version-badge';

/**
 * Rendered on each component docs page. Tells the reader which registry
 * version these docs describe and shows the components.json snippet they
 * need to pin to it. The version is generated at build time so a docs
 * deploy always agrees with what `artui add` would install.
 */
export function InstallBanner() {
  const snippet = `{
  "registry": "https://artui.vandervennet.art/registry.json",
  "version": "${REGISTRY_VERSION}"
}`;

  return (
    <aside
      style={{
        margin: '1rem 0 2rem',
        padding: '0.75rem 1rem',
        borderRadius: '0.5rem',
        border: '1px solid var(--color-fd-border, #ddd)',
        background: 'var(--color-fd-card, transparent)',
        fontSize: '0.875rem',
      }}
      aria-labelledby="install-banner-heading"
    >
      <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <strong id="install-banner-heading">These docs describe</strong>
        <RegistryVersionBadge />
      </p>
      <p style={{ margin: '0.5rem 0 0.25rem' }}>
        Pin to this exact version in <code>components.json</code>:
      </p>
      <pre
        style={{
          margin: 0,
          padding: '0.5rem 0.75rem',
          borderRadius: '0.25rem',
          background: 'var(--color-fd-muted, #f4f4f5)',
          fontSize: '0.8125rem',
          overflowX: 'auto',
        }}
      >
        <code>{snippet}</code>
      </pre>
    </aside>
  );
}
