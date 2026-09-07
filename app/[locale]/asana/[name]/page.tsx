import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/settings";
import { getServerTranslation } from "@/lib/i18n/server";
import { getAsanaDetail, normalizePathParam } from "@/lib/api/catalog";
import { requireAuth } from "@/lib/api/guard";
import { mediaUrl } from "@/lib/api/media";
import { AsanaPhoto } from "@/components/asana/asana-photo";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string; name: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, name } = await params;
  const { t } = await getServerTranslation(locale);
  return {
    title: `${normalizePathParam(name)} — ${t("catalog.title")} — ${t("brand")}`,
  };
}

export default async function AsanaPage({ params }: Props) {
  const { locale, name: rawName } = await params;
  const name = normalizePathParam(rawName);
  if (!isLocale(locale)) notFound();

  await requireAuth(locale, `/${locale}/asana/${name}`);

  const { t } = await getServerTranslation(locale);
  let asana: Awaited<ReturnType<typeof getAsanaDetail>>;
  try {
    asana = await getAsanaDetail(name);
  } catch {
    asana = null;
  }

  const img = mediaUrl(asana?.image_url ?? null);

  return (
    <article className="mx-auto max-w-4xl px-6 py-12">
      <Link
        href={`/${locale}/catalog`}
        className="mb-6 inline-block text-sm text-muted transition-colors hover:text-ink"
      >
        {t("asana.backToCatalog")}
      </Link>

      {!asana ? (
        <p className="rounded-2xl border border-night-line p-8 text-center text-muted">
          {t("asana.notFound")}
        </p>
      ) : (
        <div className="grid gap-8 md:grid-cols-[2fr_3fr]">
          <AsanaPhoto src={img} alt={asana.name} />

          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">{asana.name}</h1>
              <p className="mt-1 text-sm text-muted">{asana.category_name}</p>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted">{t("asana.difficulty")}:</span>
                <span className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span
                      key={n}
                      className={`h-1.5 w-6 rounded-full ${
                        n <= asana.difficulty ? "bg-accent" : "bg-night-line"
                      }`}
                    />
                  ))}
                </span>
              </div>
            </div>

            <div>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
                {t("asana.description")}
              </h2>
              <p className="whitespace-pre-line leading-relaxed text-muted">
                {asana.description || t("asana.noDescription")}
              </p>
            </div>

            {asana.effects.length > 0 && (
              <div>
                <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
                  {t("asana.effects")}
                </h2>
                <ul className="flex flex-wrap gap-2">
                  {asana.effects.map((e) => (
                    <li
                      key={e}
                      className="rounded-full border border-night-line px-3 py-1 text-xs text-muted"
                    >
                      {e}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {asana.contraindications.length > 0 && (
              <div>
                <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
                  {t("asana.contraindications")}
                </h2>
                <ul className="flex flex-wrap gap-2">
                  {asana.contraindications.map((c) => (
                    <li
                      key={c}
                      className="rounded-full border border-red-500/20 bg-red-500/5 px-3 py-1 text-xs text-red-400"
                    >
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </article>
  );
}