import { RootProvider } from 'fumadocs-ui/provider/next';
import type { ReactNode } from 'react';

import './global.css';

export const metadata = {
  title: 'artui: accessibility-first React components',
  description: 'React components that treat inaccessibility as a compile-time error.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
