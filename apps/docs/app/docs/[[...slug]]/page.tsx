import { promises as fs } from 'node:fs';
import path from 'node:path';

import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/page';
import { notFound, redirect } from 'next/navigation';

import { PageActions } from '@/components/docs/page-actions';
import { source } from '@/lib/source';
import { getMDXComponents } from '@/mdx-components';

const FOLDER_REDIRECTS: Record<string, string> = {
  '': '/docs/getting-started',
  components: '/docs/components/accordion',
};

const REPO_BLOB_BASE = 'https://github.com/artvandervennet/artui/blob/main';
const DOCS_CONTENT_DIR = path.join(process.cwd(), 'content', 'docs');

async function readMarkdownSource(slug: string[]): Promise<string> {
  const candidates = [
    `${path.join(DOCS_CONTENT_DIR, ...slug)}.mdx`,
    path.join(DOCS_CONTENT_DIR, ...slug, 'index.mdx'),
  ];
  for (const file of candidates) {
    try {
      return await fs.readFile(file, 'utf8');
    } catch {}
  }
  return '';
}

function getSourceUrl(slug: string[]): string | undefined {
  if (slug[0] !== 'components' || !slug[1]) return undefined;
  const name = slug[1];
  return `${REPO_BLOB_BASE}/registry/components/${name}/${name}.tsx`;
}

export default async function Page({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;
  const key = (slug ?? []).join('/');
  const folderRedirect = FOLDER_REDIRECTS[key];
  if (folderRedirect) redirect(folderRedirect);
  const page = source.getPage(slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const markdown = await readMarkdownSource(slug ?? []);
  const sourceUrl = getSourceUrl(slug ?? []);

  return (
    <DocsPage toc={page.data.toc} full={page.data.full} tableOfContent={{ style: 'clerk' }}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <DocsTitle>{page.data.title}</DocsTitle>
        <PageActions markdown={markdown} sourceUrl={sourceUrl} />
      </div>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX components={getMDXComponents()} />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;
  const key = (slug ?? []).join('/');
  if (FOLDER_REDIRECTS[key]) return {};
  const page = source.getPage(slug);
  if (!page) notFound();
  return {
    title: page.data.title,
    description: page.data.description,
  };
}
