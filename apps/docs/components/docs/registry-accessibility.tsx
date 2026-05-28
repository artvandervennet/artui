import { findComponent, loadRegistry } from '@/lib/mcp/registry-loader';
import type { WcagTableRow } from './wcag-table';
import { WcagTable } from './wcag-table';

interface RegistryAccessibilityProps {
  component: string;
}

const wcagMeta: Record<string, { name: string; level: 'A' | 'AA' | 'AAA' }> = {
  '1.1.1': { name: 'Non-text Content', level: 'A' },
  '1.3.1': { name: 'Info and Relationships', level: 'A' },
  '1.3.3': { name: 'Sensory Characteristics', level: 'A' },
  '1.4.1': { name: 'Use of Color', level: 'A' },
  '1.4.3': { name: 'Contrast (Minimum)', level: 'AA' },
  '1.4.4': { name: 'Resize Text', level: 'AA' },
  '1.4.11': { name: 'Non-text Contrast', level: 'AA' },
  '2.1.1': { name: 'Keyboard', level: 'A' },
  '2.1.2': { name: 'No Keyboard Trap', level: 'A' },
  '2.1.3': { name: 'Keyboard (No Exception)', level: 'AAA' },
  '2.2.1': { name: 'Timing Adjustable', level: 'A' },
  '2.3.3': { name: 'Animation from Interactions', level: 'AAA' },
  '2.4.3': { name: 'Focus Order', level: 'A' },
  '2.4.7': { name: 'Focus Visible', level: 'AA' },
  '2.4.10': { name: 'Section Headings', level: 'AAA' },
  '2.5.5': { name: 'Target Size (Enhanced)', level: 'AAA' },
  '3.2.2': { name: 'On Input', level: 'A' },
  '3.3.1': { name: 'Error Identification', level: 'A' },
  '3.3.2': { name: 'Labels or Instructions', level: 'A' },
  '4.1.2': { name: 'Name, Role, Value', level: 'A' },
  '4.1.3': { name: 'Status Messages', level: 'AA' },
};

export async function RegistryAccessibility({ component }: RegistryAccessibilityProps) {
  const registry = await loadRegistry();
  const comp = findComponent(registry, component);

  const rows: WcagTableRow[] = comp.accessibility.map((note) => {
    const meta = wcagMeta[note.wcag];
    return {
      criterion: note.wcag,
      name: meta?.name ?? note.wcag,
      level: meta?.level,
      satisfiedBy: note.description,
    };
  });

  return <WcagTable rows={rows} />;
}
