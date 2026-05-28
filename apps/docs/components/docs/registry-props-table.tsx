import { findComponent, loadRegistry } from '@/lib/mcp/registry-loader';
import type { PropsTableRow } from './props-table';
import { PropsTable } from './props-table';

interface RegistryPropsTableProps {
  component: string;
  sub?: string;
}

export async function RegistryPropsTable({ component, sub }: RegistryPropsTableProps) {
  const registry = await loadRegistry();
  const comp = findComponent(registry, component);

  let rows: PropsTableRow[];

  if (sub) {
    const prefix = `${sub}.`;
    rows = comp.props
      .filter((p) => p.name.startsWith(prefix))
      .map((p) => ({
        name: p.name.slice(prefix.length),
        type: p.type,
        default: p.defaultValue,
        required: p.required,
        description: p.description,
      }));
  } else {
    rows = comp.props
      .filter((p) => !p.name.includes('.'))
      .map((p) => ({
        name: p.name,
        type: p.type,
        default: p.defaultValue,
        required: p.required,
        description: p.description,
      }));
  }

  return <PropsTable rows={rows} />;
}
