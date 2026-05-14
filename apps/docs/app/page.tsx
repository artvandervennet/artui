import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-12 text-center">
      <h1 className="text-4xl font-bold tracking-tight">artui</h1>
      <p className="max-w-xl text-lg text-fd-muted-foreground">
        An accessibility-first React component library. Inaccessibility is a compile error.
      </p>
      <Link
        href="/docs"
        className="rounded-md bg-fd-primary px-4 py-2 text-sm font-medium text-fd-primary-foreground hover:opacity-90"
      >
        Read the docs
      </Link>
    </main>
  );
}
