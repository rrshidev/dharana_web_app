import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/settings";
import { getServerTranslation } from "@/lib/i18n/server";
import { getBasics, type TheoryItem } from "@/lib/api/content";
import { normalizePathParam } from "@/lib/api/catalog";
import { mediaUrl } from "@/lib/api/media";

export const dynamic = "force-dynamic";

const siteUrl = "https://dharana.ru";

type Props = { params: Promise<{ locale: string; name: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, name: raw } = await params;
  const name = normalizePathParam(raw);
  const { t } = await getServerTranslation(locale);
  const item = (await getBasics(locale).catch(() => [] as TheoryItem[])).find(
    (i) => i.name === name,
  );
  const displayName = item
    ? locale === "en" && item.name_en
      ? item.name_en
      : item.name
    : name;
  return {
    title: `${displayName} — ${t("basics.title")} — ${t("brand")}`,
    description: item?.content?.slice(0, 160) || t("basics.itemNotFound"),
    robots: { index: true, follow: true },
    alternates: {
      canonical: `${siteUrl}/${locale}/basics/${encodeURIComponent(name)}`,
      languages: {
        ru: `${siteUrl}/ru/basics/${encodeURIComponent(name)}`,
        en: `${siteUrl}/en/basics/${encodeURIComponent(name)}`,
        "x-default": `${siteUrl}/ru/basics/${encodeURIComponent(name)}`,
      },
    },
  };
}

export default async function BasicItemPage({ params }: Props) {
  const { locale, name: rawName } = await params;
  const name = normalizePathParam(rawName);
  if (!isLocale(locale)) notFound();

  const { t } = await getServerTranslation(locale);

  let item: TheoryItem | undefined;
  try {
    item = (await getBasics(locale)).find((i) => i.name === name);
  } catch {
    item = undefined;
  }

  if (!item) {
    return (
      <article className="mx-auto max-w-3xl px-6 py-12">
        <Link
          href={`/${locale}/basics`}
          className="mb-6 inline-block text-sm text-muted transition-colors hover:text-ink"
        >
          {t("basics.backToList")}
        </Link>
        <p className="rounded-2xl border border-night-line p-8 text-center text-muted">
          {t("basics.itemNotFound")}
        </p>
      </article>
    );
  }

  const displayName = locale === "en" && item.name_en ? item.name_en : item.name;
  const img = mediaUrl(item.image_url ?? null);

  return (
    <article className="mx-auto max-w-3xl px-6 py-12">
      <Link
        href={`/${locale}/basics`}
        className="mb-6 inline-block text-sm text-muted transition-colors hover:text-ink"
      >
        {t("basics.backToList")}
      </Link>

      <h1 className="text-3xl font-semibold tracking-tight">{displayName}</h1>

      {img && (
        <div className="mt-6 overflow-hidden rounded-2xl border border-night-line bg-night">
          <img src={img} alt={displayName} className="h-auto w-full" loading="lazy" />
        </div>
      )}

      <div className="mt-6 whitespace-pre-line leading-relaxed text-muted">
        {item.content}
      </div>
    </article>
  );
}