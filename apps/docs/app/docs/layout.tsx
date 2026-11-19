import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { ReactNode } from 'react';

import { source } from '@/lib/source';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tree={source.pageTree}
      nav={{
        title: (
          <span className="wordmark">
            {/* biome-ignore lint/performance/noImgElement: an 800-byte SVG, which next/image has nothing to optimise */}
            <img src="/logo.svg" alt="" width={28} height={28} />
            artui
          </span>
        ),
        url: '/',
      }}
      sidebar={{ defaultOpenLevel: 1 }}
      githubUrl="https://github.com/artvandervennet/artui"
    >
      {children}
    </DocsLayout>
  );
}
