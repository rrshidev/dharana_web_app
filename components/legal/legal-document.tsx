import Link from "next/link";
import type { LegalDocument } from "@/lib/legal/types";

type Labels = {
  updated: string;
  version: string;
  contents: string;
  back: string;
};

export function LegalDocumentView({
  doc,
  labels,
  backHref,
}: {
  doc: LegalDocument;
  labels: Labels;
  backHref: string;
}) {
  return (
    <article className="mx-auto max-w-3xl px-6 py-12">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-accent-ink"
      >
        <span aria-hidden="true">←</span>
        {labels.back}
      </Link>

      <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">{doc.title}</h1>
      <p className="mt-3 text-xs text-muted">
        {labels.updated}: {doc.updatedAt} · {labels.version}: {doc.version}
      </p>

      <p className="mt-6 text-sm leading-7 text-muted">{doc.intro}</p>

      <nav
        aria-label={labels.contents}
        className="mt-8 rounded-2xl border border-night-line bg-night-soft/50 p-5"
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">{labels.contents}</p>
        <ol className="mt-3 space-y-1.5 text-sm">
          {doc.sections.map((section) => (
            <li key={section.id}>
              <a href={`#${section.id}`} className="text-accent-ink hover:underline">
                {section.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="mt-10 space-y-9">
        {doc.sections.map((section) => (
          <section key={section.id} id={section.id} className="scroll-mt-24">
            <h2 className="text-xl font-semibold tracking-tight">{section.title}</h2>
            <div className="mt-3 space-y-3">
              {section.blocks.map((block, index) =>
                block.kind === "p" ? (
                  <p key={index} className="text-sm leading-7 text-muted">
                    {block.text}
                  </p>
                ) : (
                  <ul key={index} className="list-disc space-y-2 pl-5 text-sm leading-7 text-muted">
                    {block.items.map((item, itemIndex) => (
                      <li key={itemIndex}>{item}</li>
                    ))}
                  </ul>
                ),
              )}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-12 border-t border-night-line pt-6">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1 text-sm text-accent-ink hover:underline"
        >
          <span aria-hidden="true">←</span>
          {labels.back}
        </Link>
      </div>
    </article>
  );
}
