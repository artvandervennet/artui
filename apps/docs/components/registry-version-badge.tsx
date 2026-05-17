import { REGISTRY_VERSION } from '@/lib/registry-version';

export function RegistryVersionBadge() {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        padding: '0.125rem 0.5rem',
        borderRadius: '0.25rem',
        fontSize: '0.75rem',
        fontFamily: 'var(--font-mono, monospace)',
        background: 'var(--color-fd-muted, #eee)',
        color: 'var(--color-fd-muted-foreground, #555)',
      }}
    >
      registry v{REGISTRY_VERSION}
    </span>
  );
}
