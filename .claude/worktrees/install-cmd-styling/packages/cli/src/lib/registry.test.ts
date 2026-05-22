import { describe, expect, it } from 'vitest';

import { assertVersionMatch, type Registry, resolveRegistryUrl } from './registry.js';

describe('resolveRegistryUrl', () => {
  it('returns source unchanged when no version is pinned', () => {
    expect(resolveRegistryUrl('https://artui.vandervennet.art/registry.json')).toBe(
      'https://artui.vandervennet.art/registry.json',
    );
  });

  it('rewrites a URL ending in registry.json to a versioned snapshot URL', () => {
    expect(resolveRegistryUrl('https://artui.vandervennet.art/registry.json', '0.1.1')).toBe(
      'https://artui.vandervennet.art/registry/v0.1.1/registry.json',
    );
  });

  it('rewrites a local path ending in registry.json to a versioned snapshot path', () => {
    expect(resolveRegistryUrl('./registry.json', '0.2.0')).toBe('./registry/v0.2.0/registry.json');
  });

  it('leaves sources that do not end in registry.json alone', () => {
    expect(resolveRegistryUrl('https://example.com/custom.json', '0.1.1')).toBe(
      'https://example.com/custom.json',
    );
  });
});

describe('assertVersionMatch', () => {
  const baseRegistry: Registry = {
    $schema: 'https://artui.vandervennet.art/registry-schema.json',
    version: '0.1.1',
    generatedAt: '2026-01-01T00:00:00Z',
    components: [],
  };

  it('passes when no version is pinned', () => {
    expect(() => assertVersionMatch(baseRegistry, undefined)).not.toThrow();
  });

  it('passes when pinned version matches registry version', () => {
    expect(() => assertVersionMatch(baseRegistry, '0.1.1')).not.toThrow();
  });

  it('throws when pinned version does not match registry version', () => {
    expect(() => assertVersionMatch(baseRegistry, '0.1.0')).toThrow(/Pinned to registry v0\.1\.0/);
  });
});
