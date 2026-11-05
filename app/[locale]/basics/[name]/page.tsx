import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { isLocale } from "@/lib/i18n/settings";
import { getServerTranslation } from "@/lib/i18n/server";
import { getBasics } from "@/lib/api/content";
import { normalizePathParam } from "@/lib/api/catalog";
import { mediaUrl } from "@/lib/api/media";

export const dynamic = "force-dynamic";

const siteUrl = "https://dharana.ru";

type Props = { params: Promise<{ locale: string; name: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, name: raw } = await params;
  const name = normalizePathParam(raw);
  const { t } = await getServerTranslation(locale);
  const items = await getBasics(locale);
  const item =
    items.find((i) => i.name === name) ??
    items.find((i) => i.name.toLowerCase() === name.toLowerCase());
  if (!item) {
    return {
      title: `${t("basics.itemNotFound")} — ${t("brand")}`,
      robots: { index: false, follow: false },
    };
  }
  const displayName =
    locale === "en" && item.name_en ? item.name_en : item.name;
  const path = `basics/${encodeURIComponent(item.name)}`;
  return {
    title: `${displayName} — ${t("basics.title")} — ${t("brand")}`,
    description: item.content?.slice(0, 160) || t("basics.itemNotFound"),
    robots: { index: true, follow: true },
    alternates: {
      canonical: `${siteUrl}/${locale}/${path}`,
      languages: {
        ru: `${siteUrl}/ru/${path}`,
        en: `${siteUrl}/en/${path}`,
        "x-default": `${siteUrl}/ru/${path}`,
      },
    },
  };
}

export default async function BasicItemPage({ params }: Props) {
  const { locale, name: rawName } = await params;
  const name = normalizePathParam(rawName);
  if (!isLocale(locale)) notFound();

  const { t } = await getServerTranslation(locale);

  const items = await getBasics(locale);
  const item =
    items.find((i) => i.name === name) ??
    items.find((i) => i.name.toLowerCase() === name.toLowerCase());

  if (!item) notFound();
  if (item.name !== name) {
    permanentRedirect(`/${locale}/basics/${encodeURIComponent(item.name)}`);
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