import type { ReactNode } from 'react';

export type WcagTableRow = {
  criterion: string;
  name: string;
  level?: 'A' | 'AA' | 'AAA';
  satisfiedBy: ReactNode;
};

function toUnderstandingUrl(criterion: string): string {
  const slug = criterion.toLowerCase().replace(/\./g, '-');
  return `https://www.w3.org/WAI/WCAG22/Understanding/${slugMap[slug] ?? slug}.html`;
}

// Map criterion numbers to W3C slug stems. Most match `n-n-n` directly; a few
// well-known criteria use named slugs.
const slugMap: Record<string, string> = {
  '1-3-1': 'info-and-relationships',
  '1-3-3': 'sensory-characteristics',
  '2-1-1': 'keyboard',
  '2-4-3': 'focus-order',
  '2-4-7': 'focus-visible',
  '2-4-10': 'section-headings',
  '2-5-5': 'target-size-enhanced',
  '4-1-2': 'name-role-value',
};

export function WcagTable({ rows }: { rows: WcagTableRow[] }) {
  return (
    <div className="not-prose my-6 overflow-x-auto rounded-lg border border-fd-border">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-fd-muted/50 text-left text-xs uppercase tracking-wide text-fd-muted-foreground">
          <tr>
            <th className="w-32 px-4 py-2 font-medium">Criterion</th>
            <th className="w-60 px-4 py-2 font-medium">Name</th>
            <th className="px-4 py-2 font-medium">How the component satisfies it</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.criterion} className="border-t border-fd-border align-top">
              <td className="px-4 py-3">
                <a
                  href={toUnderstandingUrl(row.criterion)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded bg-fd-primary/10 px-2 py-0.5 font-mono text-xs font-medium text-fd-primary no-underline hover:bg-fd-primary/20"
                >
                  {row.criterion}
                  {row.level ? <span className="opacity-70">({row.level})</span> : null}
                </a>
              </td>
              <td className="px-4 py-3 font-medium text-fd-foreground">{row.name}</td>
              <td className="px-4 py-3 text-fd-foreground">{row.satisfiedBy}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
