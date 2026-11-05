import Link from "next/link";

/**
 * Локализованная 404. Отдаётся Next с HTTP-статусом 404 (а не soft-404),
 * когда страница/асана/теория действительно не найдены.
 */
export default function LocaleNotFound() {
  return (
    <section className="mx-auto flex max-w-2xl flex-col items-center px-6 py-24 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">404</p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">Страница не найдена</h1>
      <p className="mt-2 text-sm text-muted">Page not found</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/ru"
          className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-accent-on transition-opacity hover:opacity-90"
        >
          На главную
        </Link>
        <Link
          href="/en"
          className="rounded-full border border-night-line px-5 py-2 text-sm font-semibold text-ink transition-colors hover:border-accent"
        >
          Home
        </Link>
      </div>
    </section>
  );
}
