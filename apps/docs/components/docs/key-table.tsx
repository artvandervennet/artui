import { Fragment, type ReactNode } from 'react';

export type KeyTableRow = {
  keys: string[];
  action: ReactNode;
};

export function KeyTable({ rows }: { rows: KeyTableRow[] }) {
  return (
    <div className="not-prose my-6 overflow-x-auto rounded-lg border border-fd-border">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-fd-muted/50 text-left text-xs uppercase tracking-wide text-fd-muted-foreground">
          <tr>
            <th className="w-1/3 px-4 py-2 font-medium">Key</th>
            <th className="px-4 py-2 font-medium">Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.keys.join('+')} className="border-t border-fd-border align-top">
              <td className="px-4 py-3">
                <span className="flex flex-wrap items-center gap-1">
                  {row.keys.map((key, i) => (
                    <Fragment key={key}>
                      {i > 0 ? <span className="text-xs text-fd-muted-foreground">+</span> : null}
                      <kbd className="rounded border border-fd-border bg-fd-card px-1.5 py-0.5 font-mono text-xs text-fd-foreground shadow-sm">
                        {key}
                      </kbd>
                    </Fragment>
                  ))}
                </span>
              </td>
              <td className="px-4 py-3 text-fd-foreground">{row.action}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
