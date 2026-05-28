import type { ReactNode } from 'react';

export type PropsTableRow = {
  name: string;
  type: ReactNode;
  default?: ReactNode;
  required?: boolean;
  description: ReactNode;
};

export function PropsTable({ rows }: { rows: PropsTableRow[] }) {
  return (
    <div className="not-prose my-6 overflow-x-auto rounded-lg border border-fd-border">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-fd-muted/50 text-left text-xs uppercase tracking-wide text-fd-muted-foreground">
          <tr>
            <th className="px-4 py-2 font-medium">Prop</th>
            <th className="px-4 py-2 font-medium">Type</th>
            <th className="px-4 py-2 font-medium">Default</th>
            <th className="px-4 py-2 font-medium">Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name} className="border-t border-fd-border align-top">
              <td className="px-4 py-3 font-mono text-fd-foreground">
                <span className="inline-flex flex-wrap items-center gap-1.5">
                  <span>{row.name}</span>
                  {row.required ? (
                    <span className="rounded bg-fd-primary/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-fd-primary">
                      required
                    </span>
                  ) : null}
                </span>
              </td>
              <td className="px-4 py-3 font-mono text-xs text-fd-muted-foreground">{row.type}</td>
              <td className="px-4 py-3 font-mono text-xs text-fd-muted-foreground">
                {row.default ?? <span className="text-fd-muted-foreground/60">none</span>}
              </td>
              <td className="px-4 py-3 text-fd-foreground">{row.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
